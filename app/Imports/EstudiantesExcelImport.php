<?php
// app/Imports/EstudiantesExcelImport.php

namespace App\Imports;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EstudiantesExcelImport implements ToCollection, WithHeadingRow
{
    protected $mensaje;
    protected $motivosOmision = [];

    private const CAMPOS_PERMITIDOS = [
        'id_estudiante',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'grado',
        'grupo',
        'contacto',
        'contacto_emergencia',
    ];

    private const CAMPOS_OBLIGATORIOS = [
        'id_estudiante',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'grado',
        'grupo',
    ];

    private const MAX_FILAS       = 2000;
    private const MAX_LARGO_CELDA = 500;

    private const ALIAS_ENCABEZADOS = [
        'id'                     => 'id_estudiante',
        'matricula'              => 'id_estudiante',
        'num_control'            => 'id_estudiante',
        'numero_control'         => 'id_estudiante',
        'no_control'             => 'id_estudiante',
        'paterno'                => 'apellido_paterno',
        'materno'                => 'apellido_materno',
        'contacto_de_emergencia' => 'contacto_emergencia',
        'telefono'               => 'contacto',
        'tel_estudiante'         => 'contacto',
        'telefono_estudiante'    => 'contacto',
        'tel_padre'              => 'contacto_emergencia',
        'telefono_tutor'         => 'contacto_emergencia',
        'telefono_padre'         => 'contacto_emergencia',
    ];

    public function collection(Collection $rows)
    {
        if ($rows->count() > self::MAX_FILAS) {
            throw new \Exception(
                'El archivo excede el limite de ' . self::MAX_FILAS . ' filas.'
            );
        }

        // Verificar headers en la primera fila
        if ($rows->isNotEmpty()) {
            $primerFila = $rows->first();
            $headersDetectados = [];
            foreach ($primerFila as $key => $value) {
                $headersDetectados[] = $this->normalizarEncabezado($key);
            }

            $faltantes = array_diff(self::CAMPOS_OBLIGATORIOS, $headersDetectados);
            if (!empty($faltantes)) {
                // Columnas utiles detectadas (solo las validas)
                $utiles = array_intersect(self::CAMPOS_PERMITIDOS, $headersDetectados);
                throw new \Exception(
                    'Faltan columnas obligatorias: ' . implode(', ', $faltantes) .
                    '. Columnas utiles detectadas: ' . (empty($utiles) ? 'ninguna' : implode(', ', $utiles)) . '.'
                );
            }
        }

        $insertados = 0;
        $actualizados = 0;
        $saltados = 0;

        $columnasIgnoradasRegistradas = false;

        foreach ($rows as $row) {
            $data = [];
            $columnasIgnoradas = [];

            foreach ($row as $key => $value) {
                $keyNormalizada = $this->normalizarEncabezado($key);

                if (in_array($keyNormalizada, self::CAMPOS_PERMITIDOS, true)) {
                    $data[$keyNormalizada] = $value;
                } else {
                    if ($keyNormalizada !== '') {
                        $columnasIgnoradas[] = $keyNormalizada;
                    }
                }
            }

            if (!$columnasIgnoradasRegistradas && !empty($columnasIgnoradas)) {
                Log::info('Importacion Excel: columnas ignoradas', [
                    'columnas' => array_values(array_unique($columnasIgnoradas)),
                ]);
                $columnasIgnoradasRegistradas = true;
            }

            $idEstudiante    = $this->clean($data['id_estudiante'] ?? null);
            $nombre          = $this->clean($data['nombre'] ?? '') ?? '';
            $apellidoPaterno = $this->clean($data['apellido_paterno'] ?? '') ?? '';
            $apellidoMaterno = $this->clean($data['apellido_materno'] ?? '') ?? '';
            $grado           = $this->clean($data['grado'] ?? '') ?? '';
            $grupo           = $this->clean($data['grupo'] ?? '') ?? '';
            $contacto        = $this->clean($data['contacto'] ?? null);
            $contactoEmerg   = $this->clean($data['contacto_emergencia'] ?? null);

            $contacto      = $this->normalizarTelefono($contacto);
            $contactoEmerg = $this->normalizarTelefono($contactoEmerg);

            // Registrar motivos de omision
            $motivos = [];
            if (empty($idEstudiante))    $motivos[] = 'ID';
            if ($nombre === '')          $motivos[] = 'Nombre';
            if ($apellidoPaterno === '') $motivos[] = 'Apellido paterno';
            if ($apellidoMaterno === '') $motivos[] = 'Apellido materno';
            if ($grado === '')           $motivos[] = 'Grado';
            if ($grupo === '')           $motivos[] = 'Grupo';

            if (!empty($motivos)) {
                $saltados++;
                foreach ($motivos as $m) {
                    $this->motivosOmision[$m] = ($this->motivosOmision[$m] ?? 0) + 1;
                }
                continue;
            }

            $existe = DB::table('estudiantes')->where('id_estudiante', $idEstudiante)->exists();

            $payload = [
                'nombre'              => $nombre,
                'apellido_paterno'    => $apellidoPaterno,
                'apellido_materno'    => $apellidoMaterno,
                'grado'               => $grado,
                'grupo'               => strtoupper($grupo),
                'contacto'            => $contacto ?: null,
                'contacto_emergencia' => $contactoEmerg ?: null,
            ];

            if ($existe) {
                DB::table('estudiantes')
                    ->where('id_estudiante', $idEstudiante)
                    ->update($payload);
                $actualizados++;
            } else {
                DB::table('estudiantes')->insert(array_merge(
                    ['id_estudiante' => $idEstudiante],
                    $payload
                ));
                $insertados++;
            }
        }

        // Mensaje con detalle
        $this->mensaje = "Importacion completada: $insertados insertados, $actualizados actualizados";
        if ($saltados > 0) {
            arsort($this->motivosOmision);
            $top = array_slice(array_keys($this->motivosOmision), 0, 4);
            $this->mensaje .= ". $saltados filas omitidas por faltar: " . implode(', ', $top);
            if (count($top) === 4) $this->mensaje .= ", etc.";
            $this->mensaje .= ".";
        } else {
            $this->mensaje .= ".";
        }
    }

    private function normalizarEncabezado($header): string
    {
        $h = (string) $header;
        $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);
        $h = str_replace(['"', "'"], '', $h);
        $h = str_replace([' ', '-'], '_', $h);
        $h = strtolower(trim($h));

        $h = strtr($h, [
            'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ñ'=>'n','ü'=>'u',
        ]);

        if (isset(self::ALIAS_ENCABEZADOS[$h])) {
            return self::ALIAS_ENCABEZADOS[$h];
        }

        return $h;
    }

    private function clean($value)
    {
        if ($value === null) return null;
        if (is_object($value)) return $value;

        $value = (string) $value;
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
        $value = trim($value);

        if (mb_strlen($value) > self::MAX_LARGO_CELDA) {
            $value = mb_substr($value, 0, self::MAX_LARGO_CELDA);
        }

        if ($value !== '') {
            $primerCaracter = substr($value, 0, 1);
            if (in_array($primerCaracter, ['=', '+', '-', '@'], true)) {
                $value = "'" . $value;
            }
        }

        return $value;
    }

    private function normalizarTelefono($tel)
    {
        if (empty($tel)) return null;
        if (is_object($tel)) return null;

        $tel = trim((string) $tel);
        $tel = str_replace([' ', '-', '(', ')', '+'], '', $tel);

        if (stripos($tel, 'E+') !== false) {
            $tel = number_format((float) $tel, 0, '', '');
        }

        return $tel ?: null;
    }

    public function getMensaje()
    {
        return $this->mensaje;
    }
}
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

    private const CAMPOS_PERMITIDOS = [
        'id_estudiante',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'grado',
        'grupo',
        'telefono_estudiante',
        'telefono_padre',
    ];

    private const CAMPOS_OBLIGATORIOS = [
        'id_estudiante',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'grado',
        'grupo',
    ];

    private const ALIAS_ENCABEZADOS = [
        'id'                     => 'id_estudiante',
        'paterno'                => 'apellido_paterno',
        'materno'                => 'apellido_materno',
        'contacto'               => 'telefono_estudiante',
        'contacto_de_emergencia' => 'telefono_padre',
        'contacto_emergencia'    => 'telefono_padre',
        'telefono'               => 'telefono_estudiante',
        'tel_estudiante'         => 'telefono_estudiante',
        'tel_padre'              => 'telefono_padre',
        'telefono_tutor'         => 'telefono_padre',
    ];

    // Procesa las filas del Excel importado
    public function collection(Collection $rows)
    {
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
                Log::info('Importación Excel: columnas ignoradas', [
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
            $telEstudiante   = $this->clean($data['telefono_estudiante'] ?? null);
            $telPadre        = $this->clean($data['telefono_padre'] ?? null);

            $telEstudiante = $this->normalizarTelefono($telEstudiante);
            $telPadre      = $this->normalizarTelefono($telPadre);

            if (empty($idEstudiante) || $nombre === '' || $apellidoPaterno === '' || $apellidoMaterno === '' || $grado === '' || $grupo === '') {
                $saltados++;
                continue;
            }

            $existe = DB::table('estudiantes')->where('id_estudiante', $idEstudiante)->exists();

            $payload = [
                'nombre'              => $nombre,
                'apellido_paterno'    => $apellidoPaterno,
                'apellido_materno'    => $apellidoMaterno,
                'grado'               => $grado,
                'grupo'               => strtoupper($grupo),
                'telefono_estudiante' => $telEstudiante ?: null,
                'telefono_padre'      => $telPadre ?: null,
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

        $this->mensaje = "Importación completada: $insertados insertados, $actualizados actualizados";
        if ($saltados > 0) {
            $this->mensaje .= ", $saltados filas omitidas (datos incompletos).";
        } else {
            $this->mensaje .= ".";
        }
    }

    // Normaliza el nombre de una columna + aplica aliases
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

    // Limpia un valor de texto
    private function clean($value)
    {
        if ($value === null) return null;
        if (is_object($value)) return $value;
        $value = (string) $value;
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
        return trim($value);
    }

    // Limpia un número de teléfono
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
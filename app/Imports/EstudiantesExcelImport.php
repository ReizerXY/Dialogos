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
        'grado',
        'grupo',
        'fecha_nacimiento',
        'sexo',
        'telefono_estudiante',
        'telefono_padre',
    ];

    private const CAMPOS_OBLIGATORIOS = [
        'id_estudiante',
        'nombre',
        'grado',
        'grupo',
    ];

    private const ALIAS_ENCABEZADOS = [
        'fecha_de_nacimiento' => 'fecha_nacimiento',
        'nacimiento'          => 'fecha_nacimiento',
        'fecha_nac'           => 'fecha_nacimiento',
        'cumpleanos'          => 'fecha_nacimiento',
        'genero'              => 'sexo',
        'sexo_genero'         => 'sexo',
        'telefono'            => 'telefono_estudiante',
        'tel_estudiante'      => 'telefono_estudiante',
        'tel_padre'           => 'telefono_padre',
        'telefono_tutor'      => 'telefono_padre',
    ];

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
                    // No limpiamos aquí las fechas: pueden venir como número de serie o DateTime
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

            $idEstudiante  = $this->clean($data['id_estudiante'] ?? null);
            $nombre        = $this->clean($data['nombre'] ?? '') ?? '';
            $grado         = $this->clean($data['grado'] ?? '') ?? '';
            $grupo         = $this->clean($data['grupo'] ?? '') ?? '';
            $fechaNacRaw   = $data['fecha_nacimiento'] ?? null;
            $sexoRaw       = $data['sexo'] ?? null;
            $telEstudiante = $this->clean($data['telefono_estudiante'] ?? null);
            $telPadre      = $this->clean($data['telefono_padre'] ?? null);

            $telEstudiante = $this->normalizarTelefono($telEstudiante);
            $telPadre      = $this->normalizarTelefono($telPadre);
            $fechaNac      = $this->normalizarFecha($fechaNacRaw);
            $sexo          = $this->normalizarSexo($sexoRaw);

            if (empty($idEstudiante) || $nombre === '' || $grado === '' || $grupo === '') {
                $saltados++;
                continue;
            }

            $existe = DB::table('estudiantes')->where('id_estudiante', $idEstudiante)->exists();

            $payload = [
                'nombre'              => $nombre,
                'grado'               => $grado,
                'grupo'               => strtoupper($grupo),
                'fecha_nacimiento'    => $fechaNac,
                'sexo'                => $sexo,
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

    /**
     * Normaliza el nombre de la columna + aplica aliases
     */
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
        // Si es un objeto (DateTime de Excel), no lo limpiamos como string
        if (is_object($value)) return $value;
        $value = (string) $value;
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
        return trim($value);
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

    /**
     * Normaliza fecha a YYYY-MM-DD o null.
     * Maneja: número de serie de Excel, DateTime (Maatwebsite a veces devuelve objetos),
     * texto en varios formatos, vacíos.
     */
    private function normalizarFecha($valor): ?string
    {
        if ($valor === null || $valor === '') return null;

        // 1) Si ya es un objeto DateTime (Maatwebsite lo devuelve así cuando detecta fecha)
        if ($valor instanceof \DateTimeInterface) {
            return $valor->format('Y-m-d');
        }

        $valor = trim((string) $valor);
        if ($valor === '') return null;

        // 2) Número de serie de Excel (días desde 1899-12-30)
        if (is_numeric($valor)) {
            $num = (int) $valor;
            if ($num > 1000 && $num < 80000) {
                try {
                    $fecha = new \DateTime('1899-12-30');
                    $fecha->modify("+{$num} days");
                    return $fecha->format('Y-m-d');
                } catch (\Exception $e) {
                    return null;
                }
            }
            return null;
        }

        // 3) Formatos comunes
        $formatos = [
            'Y-m-d',
            'd/m/Y',
            'd-m-Y',
            'Y/m/d',
            'd.m.Y',
            'm/d/Y',
        ];

        foreach ($formatos as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $valor);
            if ($dt && $dt->format($fmt) === $valor) {
                if ($dt->getTimestamp() > time()) return null;
                return $dt->format('Y-m-d');
            }
        }

        // 4) Fallback con strtotime
        $ts = strtotime($valor);
        if ($ts !== false && $ts < time()) {
            return date('Y-m-d', $ts);
        }

        return null;
    }

    /**
     * Normaliza sexo/género. Aliases comunes → valores base, el resto tal cual.
     */
    private function normalizarSexo($valor): ?string
    {
        if ($valor === null || $valor === '') return null;

        $valor = trim((string) $valor);
        if ($valor === '') return null;

        if (mb_strlen($valor) > 50) {
            $valor = mb_substr($valor, 0, 50);
        }

        $lower = mb_strtolower($valor, 'UTF-8');

        $mapa = [
            'm' => 'Hombre',
            'h' => 'Hombre',
            'hombre' => 'Hombre',
            'masculino' => 'Hombre',
            'varon' => 'Hombre',
            'varón' => 'Hombre',
            'f' => 'Mujer',
            'mujer' => 'Mujer',
            'femenino' => 'Mujer',
            'prefiero no decirlo' => 'Prefiero no decirlo',
            'no especificado' => 'Prefiero no decirlo',
            'sin especificar' => 'Prefiero no decirlo',
            'n/e' => 'Prefiero no decirlo',
        ];

        if (isset($mapa[$lower])) {
            return $mapa[$lower];
        }

        return $valor;
    }

    public function getMensaje()
    {
        return $this->mensaje;
    }
}
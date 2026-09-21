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

    /**
     * Campos que se leen del archivo. Cualquier otra columna es ignorada.
     */
    private const CAMPOS_PERMITIDOS = [
        'id_estudiante',
        'nombre',
        'grado',
        'grupo',
        'telefono_estudiante',
        'telefono_padre',
    ];

    /**
     * Campos obligatorios.
     */
    private const CAMPOS_OBLIGATORIOS = [
        'id_estudiante',
        'nombre',
        'grado',
        'grupo',
    ];

    public function collection(Collection $rows)
    {
        $insertados = 0;
        $actualizados = 0;
        $saltados = 0;

        $columnasIgnoradasRegistradas = false;

        foreach ($rows as $row) {
            // Normalizar los encabezados de esta fila
            $data = [];
            $columnasIgnoradas = [];

            foreach ($row as $key => $value) {
                $keyNormalizada = $this->normalizarEncabezado($key);

                if (in_array($keyNormalizada, self::CAMPOS_PERMITIDOS, true)) {
                    $data[$keyNormalizada] = $this->clean($value);
                } else {
                    // Es una columna que no nos interesa, la registramos para log (solo una vez)
                    if ($keyNormalizada !== '') {
                        $columnasIgnoradas[] = $keyNormalizada;
                    }
                }
            }

            // Log de columnas ignoradas (solo la primera fila para no spamear)
            if (!$columnasIgnoradasRegistradas && !empty($columnasIgnoradas)) {
                Log::info('Importación Excel: columnas ignoradas', [
                    'columnas' => array_values(array_unique($columnasIgnoradas)),
                ]);
                $columnasIgnoradasRegistradas = true;
            }

            // Extraer solo los campos que nos interesan
            $idEstudiante  = $data['id_estudiante'] ?? null;
            $nombre        = $data['nombre'] ?? '';
            $grado         = $data['grado'] ?? '';
            $grupo         = $data['grupo'] ?? '';
            $telEstudiante = $data['telefono_estudiante'] ?? null;
            $telPadre      = $data['telefono_padre'] ?? null;

            // Normalizar teléfonos (por si Excel los puso en notación científica)
            $telEstudiante = $this->normalizarTelefono($telEstudiante);
            $telPadre      = $this->normalizarTelefono($telPadre);

            if (empty($idEstudiante) || $nombre === '' || $grado === '' || $grupo === '') {
                $saltados++;
                continue;
            }

            $existe = DB::table('estudiantes')->where('id_estudiante', $idEstudiante)->exists();

            if ($existe) {
                DB::table('estudiantes')
                    ->where('id_estudiante', $idEstudiante)
                    ->update([
                        'nombre' => $nombre,
                        'grado' => $grado,
                        'grupo' => $grupo,
                        'telefono_estudiante' => $telEstudiante ?: null,
                        'telefono_padre' => $telPadre ?: null,
                    ]);
                $actualizados++;
            } else {
                DB::table('estudiantes')->insert([
                    'id_estudiante' => $idEstudiante,
                    'nombre' => $nombre,
                    'grado' => $grado,
                    'grupo' => $grupo,
                    'telefono_estudiante' => $telEstudiante ?: null,
                    'telefono_padre' => $telPadre ?: null,
                ]);
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
     * Normaliza el nombre de una columna.
     * - Quita BOM, comillas, espacios y acentos
     * - Convierte a minúsculas
     * - Reemplaza espacios y guiones por _
     */
    private function normalizarEncabezado($header): string
    {
        $h = (string) $header;
        $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);       // BOM residual
        $h = str_replace(['"', "'"], '', $h);                // comillas
        $h = str_replace([' ', '-'], '_', $h);              // espacios y guiones → _
        $h = strtolower(trim($h));                          // minúsculas + trim
        return $h;
    }

    private function clean($value)
    {
        if ($value === null) return null;
        $value = (string) $value;
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
        return trim($value);
    }

    private function normalizarTelefono($tel)
    {
        if (empty($tel)) return null;

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
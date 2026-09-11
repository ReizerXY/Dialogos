<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EstudiantesExcelImport implements ToCollection, WithHeadingRow
{
    protected $mensaje;

    public function collection(Collection $rows)
    {
        $insertados = 0;
        $actualizados = 0;
        $saltados = 0;

        foreach ($rows as $row) {
            $data = [];
            foreach ($row as $key => $value) {
                $keyLimpia = strtolower((string) $key);
                $keyLimpia = preg_replace('/^\xEF\xBB\xBF/', '', $keyLimpia);
                $keyLimpia = str_replace(' ', '_', $keyLimpia);
                $data[$keyLimpia] = $this->clean($value);
            }

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
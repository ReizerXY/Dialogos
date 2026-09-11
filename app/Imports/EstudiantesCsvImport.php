<?php

namespace App\Imports;

use Illuminate\Support\Facades\DB;

class EstudiantesCsvImport
{
    protected $mensaje;

    /**
     * Lee un archivo de texto (CSV, TXT, TSV) y lo importa a la tabla estudiantes.
     * - Detecta encoding: UTF-8 (con/sin BOM), UTF-16, Latin-1, Windows-1252
     * - Detecta delimitador: , ; tab |
     */
    public function import($filePath)
    {
        $insertados = 0;
        $actualizados = 0;
        $saltados = 0;

        // 1) Leer el archivo completo en binario
        $contenido = @file_get_contents($filePath);
        if ($contenido === false) {
            throw new \Exception('No se pudo leer el archivo.');
        }

        // 2) Detectar y normalizar encoding → UTF-8
        $contenido = $this->normalizarEncoding($contenido);

        // 3) Escribir a un archivo temporal en UTF-8 para procesarlo con fgetcsv
        $tmp = tmpfile();
        fwrite($tmp, $contenido);
        rewind($tmp);

        // 4) Detectar delimitador
        $primeraLinea = fgets($tmp);
        rewind($tmp);
        $delimitador = $this->detectarDelimitador($primeraLinea);

        // 5) Leer encabezados
        $encabezados = fgetcsv($tmp, 0, $delimitador);
        if ($encabezados === false) {
            fclose($tmp);
            throw new \Exception('El archivo está vacío o no se pudo leer.');
        }

        // Limpiar encabezados
        $encabezados = array_map(function ($h) {
            $h = (string) $h;
            $h = preg_replace('/^\xEF\xBB\xBF/', '', $h); // BOM residual
            $h = str_replace(['"', "'"], '', $h);
            return strtolower(trim($h));
        }, $encabezados);

        // 6) Verificar columnas mínimas
        $requeridas = ['id_estudiante', 'nombre', 'grado', 'grupo'];
        $faltantes = array_diff($requeridas, $encabezados);
        if (!empty($faltantes)) {
            fclose($tmp);
            throw new \Exception(
                'Faltan columnas obligatorias: ' . implode(', ', $faltantes) .
                '. Columnas detectadas: ' . implode(', ', $encabezados)
            );
        }

        $idx = array_flip($encabezados);

        // 7) Procesar filas
        while (($fila = fgetcsv($tmp, 0, $delimitador)) !== false) {
            // Saltar filas completamente vacías
            if (count($fila) === 1 && ($fila[0] === null || trim((string) $fila[0]) === '')) {
                continue;
            }

            // Rellenar con null si vienen menos columnas
            $fila = array_pad($fila, count($encabezados), null);

            $clean = function ($value) {
                if ($value === null) return null;
                $value = (string) $value;
                $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
                return trim($value);
            };

            $idEstudiante  = $clean($fila[$idx['id_estudiante']] ?? null);
            $nombre        = $clean($fila[$idx['nombre']] ?? '');
            $grado         = $clean($fila[$idx['grado']] ?? '');
            $grupo         = $clean($fila[$idx['grupo']] ?? '');
            $telEstudiante = isset($idx['telefono_estudiante']) ? $clean($fila[$idx['telefono_estudiante']] ?? null) : null;
            $telPadre      = isset($idx['telefono_padre']) ? $clean($fila[$idx['telefono_padre']] ?? null) : null;

            // Normalizar números de teléfono (por si Excel los puso como número científico)
            $telEstudiante = $this->normalizarTelefono($telEstudiante);
            $telPadre      = $this->normalizarTelefono($telPadre);

            // Validar campos obligatorios
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

        fclose($tmp);

        $this->mensaje = "Importación completada: $insertados insertados, $actualizados actualizados";
        if ($saltados > 0) {
            $this->mensaje .= ", $saltados filas omitidas (datos incompletos).";
        } else {
            $this->mensaje .= ".";
        }
    }

    /**
     * Detecta el encoding y lo convierte a UTF-8
     */
    private function normalizarEncoding($contenido)
    {
        // BOM UTF-8
        if (substr($contenido, 0, 3) === "\xEF\xBB\xBF") {
            return substr($contenido, 3);
        }

        // BOM UTF-16 LE
        if (substr($contenido, 0, 2) === "\xFF\xFE") {
            $contenido = mb_convert_encoding(substr($contenido, 2), 'UTF-8', 'UTF-16LE');
            return $contenido;
        }

        // BOM UTF-16 BE
        if (substr($contenido, 0, 2) === "\xFE\xFF") {
            $contenido = mb_convert_encoding(substr($contenido, 2), 'UTF-8', 'UTF-16BE');
            return $contenido;
        }

        // Detectar encoding con mb_detect_encoding
        $encodings = ['UTF-8', 'Windows-1252', 'ISO-8859-1', 'UTF-16', 'UTF-16LE', 'UTF-16BE'];
        $detectado = mb_detect_encoding($contenido, $encodings, true);

        if ($detectado && strtoupper($detectado) !== 'UTF-8') {
            $contenido = mb_convert_encoding($contenido, 'UTF-8', $detectado);
        }

        return $contenido;
    }

    /**
     * Detecta el delimitador analizando la primera línea
     */
    private function detectarDelimitador($linea)
    {
        $candidatos = [
            "\t" => substr_count($linea, "\t"),
            ","  => substr_count($linea, ','),
            ";"  => substr_count($linea, ';'),
            "|"  => substr_count($linea, '|'),
        ];

        arsort($candidatos);
        $delimitador = array_key_first($candidatos);

        // Si no se detectó ninguno, usar coma por defecto
        return $candidatos[$delimitador] > 0 ? $delimitador : ',';
    }

    /**
     * Limpia un número de teléfono:
     * - Quita espacios, guiones, paréntesis
     * - Si Excel lo convirtió a número científico (ej. "2.7116E+09"), reconstruye los dígitos
     */
    private function normalizarTelefono($tel)
    {
        if (empty($tel)) return null;

        $tel = trim((string) $tel);
        $tel = str_replace([' ', '-', '(', ')', '+'], '', $tel);

        // Si quedó en notación científica (Excel lo hace a veces)
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
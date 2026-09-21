<?php
// app/Imports/EstudiantesCsvImport.php

namespace App\Imports;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EstudiantesCsvImport
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
     * Campos obligatorios (si falta alguno, se aborta la importación).
     */
    private const CAMPOS_OBLIGATORIOS = [
        'id_estudiante',
        'nombre',
        'grado',
        'grupo',
    ];

    /**
     * Lee un archivo de texto (CSV, TXT, TSV) y lo importa a la tabla estudiantes.
     * - Detecta encoding: UTF-8 (con/sin BOM), UTF-16, Latin-1, Windows-1252
     * - Detecta delimitador: , ; tab |
     * - Solo lee las columnas conocidas (id_estudiante, nombre, grado, grupo, telefono_estudiante, telefono_padre).
     *   Cualquier otra columna del archivo se ignora sin afectar el proceso.
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
        $encabezadosRaw = fgetcsv($tmp, 0, $delimitador);
        if ($encabezadosRaw === false) {
            fclose($tmp);
            throw new \Exception('El archivo está vacío o no se pudo leer.');
        }

        // 6) Normalizar encabezados (espacios → _, guiones → _, minúsculas, sin BOM/comillas)
        $encabezados = array_map([$this, 'normalizarEncabezado'], $encabezadosRaw);

        // 7) Verificar columnas obligatorias
        $faltantes = array_diff(self::CAMPOS_OBLIGATORIOS, $encabezados);
        if (!empty($faltantes)) {
            fclose($tmp);
            throw new \Exception(
                'Faltan columnas obligatorias: ' . implode(', ', $faltantes) .
                '. Columnas detectadas: ' . implode(', ', $encabezados)
            );
        }

        // 8) Mapear nombre de columna → índice
        //    Solo nos interesa conservar los índices de las columnas permitidas.
        $idx = [];
        foreach ($encabezados as $i => $nombre) {
            if (in_array($nombre, self::CAMPOS_PERMITIDOS, true)) {
                $idx[$nombre] = $i;
            }
        }

        // 9) Log de columnas ignoradas (útil para debugging)
        $columnasIgnoradas = array_diff($encabezados, self::CAMPOS_PERMITIDOS);
        if (!empty($columnasIgnoradas)) {
            Log::info('Importación CSV: columnas ignoradas', [
                'columnas' => array_values($columnasIgnoradas),
            ]);
        }

        // 10) Procesar filas
        while (($fila = fgetcsv($tmp, 0, $delimitador)) !== false) {
            // Saltar filas completamente vacías
            if (count($fila) === 1 && ($fila[0] === null || trim((string) $fila[0]) === '')) {
                continue;
            }

            // Obtener cada campo por su índice (o null si no existe la columna)
            $idEstudiante  = $this->valorFila($fila, $idx, 'id_estudiante');
            $nombre        = $this->valorFila($fila, $idx, 'nombre') ?? '';
            $grado         = $this->valorFila($fila, $idx, 'grado') ?? '';
            $grupo         = $this->valorFila($fila, $idx, 'grupo') ?? '';
            $telEstudiante = $this->valorFila($fila, $idx, 'telefono_estudiante');
            $telPadre      = $this->valorFila($fila, $idx, 'telefono_padre');

            // Normalizar teléfonos
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
     * Normaliza el nombre de una columna del encabezado.
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

    /**
     * Lee el valor de un campo de una fila usando el índice de su columna.
     * Devuelve null si la columna no existe en el archivo.
     */
    private function valorFila($fila, $idx, $campo)
    {
        if (!isset($idx[$campo])) {
            return null;
        }
        $valor = $fila[$idx[$campo]] ?? null;
        if ($valor === null) return null;
        $valor = (string) $valor;
        $valor = preg_replace('/^\xEF\xBB\xBF/', '', $valor);
        return trim($valor);
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
            return mb_convert_encoding(substr($contenido, 2), 'UTF-8', 'UTF-16LE');
        }

        // BOM UTF-16 BE
        if (substr($contenido, 0, 2) === "\xFE\xFF") {
            return mb_convert_encoding(substr($contenido, 2), 'UTF-8', 'UTF-16BE');
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

        return $candidatos[$delimitador] > 0 ? $delimitador : ',';
    }

    /**
     * Limpia un número de teléfono
     */
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
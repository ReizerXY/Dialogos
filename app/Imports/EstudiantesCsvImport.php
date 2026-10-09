<?php
// app/Imports/EstudiantesCsvImport.php

namespace App\Imports;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EstudiantesCsvImport
{
    protected $mensaje;

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

    // Aliases: acepta headers viejos y nuevos (retrocompatible)
    private const ALIAS_ENCABEZADOS = [
        'id'                     => 'id_estudiante',
        'paterno'                => 'apellido_paterno',
        'materno'                => 'apellido_materno',
        'contacto_de_emergencia' => 'contacto_emergencia',
        'telefono'               => 'contacto',
        'tel_estudiante'         => 'contacto',
        'telefono_estudiante'    => 'contacto',           // compat. archivos viejos
        'tel_padre'              => 'contacto_emergencia',
        'telefono_tutor'         => 'contacto_emergencia',
        'telefono_padre'         => 'contacto_emergencia', // compat. archivos viejos
    ];

    // Importa un archivo CSV/TXT con estudiantes
    public function import($filePath)
    {
        $insertados = 0;
        $actualizados = 0;
        $saltados = 0;

        $contenido = @file_get_contents($filePath);
        if ($contenido === false) {
            throw new \Exception('No se pudo leer el archivo.');
        }

        $contenido = $this->normalizarEncoding($contenido);

        $tmp = tmpfile();
        fwrite($tmp, $contenido);
        rewind($tmp);

        $primeraLinea = fgets($tmp);
        rewind($tmp);
        $delimitador = $this->detectarDelimitador($primeraLinea);

        $encabezadosRaw = fgetcsv($tmp, 0, $delimitador);
        if ($encabezadosRaw === false) {
            fclose($tmp);
            throw new \Exception('El archivo está vacío o no se pudo leer.');
        }

        $encabezados = array_map([$this, 'normalizarEncabezado'], $encabezadosRaw);

        $faltantes = array_diff(self::CAMPOS_OBLIGATORIOS, $encabezados);
        if (!empty($faltantes)) {
            fclose($tmp);
            throw new \Exception(
                'Faltan columnas obligatorias: ' . implode(', ', $faltantes) .
                '. Columnas detectadas: ' . implode(', ', $encabezados)
            );
        }

        $idx = [];
        foreach ($encabezados as $i => $nombre) {
            if (in_array($nombre, self::CAMPOS_PERMITIDOS, true)) {
                $idx[$nombre] = $i;
            }
        }

        $columnasIgnoradas = array_diff($encabezados, self::CAMPOS_PERMITIDOS);
        if (!empty($columnasIgnoradas)) {
            Log::info('Importación CSV: columnas ignoradas', [
                'columnas' => array_values($columnasIgnoradas),
            ]);
        }

        while (($fila = fgetcsv($tmp, 0, $delimitador)) !== false) {
            if (count($fila) === 1 && ($fila[0] === null || trim((string) $fila[0]) === '')) {
                continue;
            }

            $idEstudiante     = $this->valorFila($fila, $idx, 'id_estudiante');
            $nombre           = $this->valorFila($fila, $idx, 'nombre') ?? '';
            $apellidoPaterno  = $this->valorFila($fila, $idx, 'apellido_paterno') ?? '';
            $apellidoMaterno  = $this->valorFila($fila, $idx, 'apellido_materno') ?? '';
            $grado            = $this->valorFila($fila, $idx, 'grado') ?? '';
            $grupo            = $this->valorFila($fila, $idx, 'grupo') ?? '';
            $contacto         = $this->valorFila($fila, $idx, 'contacto');
            $contactoEmerg    = $this->valorFila($fila, $idx, 'contacto_emergencia');

            $contacto      = $this->normalizarTelefono($contacto);
            $contactoEmerg = $this->normalizarTelefono($contactoEmerg);

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

        fclose($tmp);

        $this->mensaje = "Importación completada: $insertados insertados, $actualizados actualizados";
        if ($saltados > 0) {
            $this->mensaje .= ", $saltados filas omitidas (datos incompletos).";
        } else {
            $this->mensaje .= ".";
        }
    }

    // Normaliza el nombre de una columna del encabezado
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

    // Devuelve el valor de una columna en la fila actual
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

    // Normaliza el encoding del contenido a UTF-8
    private function normalizarEncoding($contenido)
    {
        if (substr($contenido, 0, 3) === "\xEF\xBB\xBF") {
            return substr($contenido, 3);
        }

        if (substr($contenido, 0, 2) === "\xFF\xFE") {
            return mb_convert_encoding(substr($contenido, 2), 'UTF-8', 'UTF-16LE');
        }

        if (substr($contenido, 0, 2) === "\xFE\xFF") {
            return mb_convert_encoding(substr($contenido, 2), 'UTF-8', 'UTF-16BE');
        }

        $encodings = ['UTF-8', 'Windows-1252', 'ISO-8859-1', 'UTF-16', 'UTF-16LE', 'UTF-16BE'];
        $detectado = mb_detect_encoding($contenido, $encodings, true);

        if ($detectado && strtoupper($detectado) !== 'UTF-8') {
            $contenido = mb_convert_encoding($contenido, 'UTF-8', $detectado);
        }

        return $contenido;
    }

    // Detecta el delimitador de un CSV (tab, coma, punto y coma, pipe)
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

    // Limpia un número de teléfono
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
<?php
// app/Imports/EstudiantesCsvImport.php

namespace App\Imports;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EstudiantesCsvImport
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
            throw new \Exception('El archivo esta vacio o no se pudo leer.');
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
            Log::info('Importacion CSV: columnas ignoradas', [
                'columnas' => array_values($columnasIgnoradas),
            ]);
        }

        $numeroFila = 1;
        while (($fila = fgetcsv($tmp, 0, $delimitador)) !== false) {
            $numeroFila++;

            if ($numeroFila > self::MAX_FILAS) {
                fclose($tmp);
                throw new \Exception(
                    'El archivo excede el limite de ' . self::MAX_FILAS . ' filas.'
                );
            }

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

        fclose($tmp);

        // Mensaje con detalle de motivos
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

    private function valorFila($fila, $idx, $campo)
    {
        if (!isset($idx[$campo])) {
            return null;
        }
        $valor = $fila[$idx[$campo]] ?? null;
        if ($valor === null) return null;
        $valor = (string) $valor;
        $valor = preg_replace('/^\xEF\xBB\xBF/', '', $valor);
        $valor = trim($valor);

        if (mb_strlen($valor) > self::MAX_LARGO_CELDA) {
            $valor = mb_substr($valor, 0, self::MAX_LARGO_CELDA);
        }

        return $this->sanitizarCsvInjection($valor);
    }

    private function sanitizarCsvInjection($valor): string
    {
        if ($valor === '') return '';

        $primerCaracter = substr($valor, 0, 1);
        if (in_array($primerCaracter, ['=', '+', '-', '@'], true)) {
            return "'" . $valor;
        }

        return $valor;
    }

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
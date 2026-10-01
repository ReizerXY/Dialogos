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
        'fecha_nacimiento',
        'sexo',
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
     * Alias de encabezados → nombre canónico de la columna.
     * Se aplican tras normalizar (minúsculas, espacios→_, sin acentos).
     */
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

            $idEstudiante  = $this->valorFila($fila, $idx, 'id_estudiante');
            $nombre        = $this->valorFila($fila, $idx, 'nombre') ?? '';
            $grado         = $this->valorFila($fila, $idx, 'grado') ?? '';
            $grupo         = $this->valorFila($fila, $idx, 'grupo') ?? '';
            $fechaNacRaw   = $this->valorFila($fila, $idx, 'fecha_nacimiento');
            $sexoRaw       = $this->valorFila($fila, $idx, 'sexo');
            $telEstudiante = $this->valorFila($fila, $idx, 'telefono_estudiante');
            $telPadre      = $this->valorFila($fila, $idx, 'telefono_padre');

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
     * Además de limpiar, aplica aliases (fecha de nacimiento → fecha_nacimiento, etc.)
     */
    private function normalizarEncabezado($header): string
    {
        $h = (string) $header;
        $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);
        $h = str_replace(['"', "'"], '', $h);
        $h = str_replace([' ', '-'], '_', $h);
        $h = strtolower(trim($h));

        // Quitar acentos (fecha → fecha, género → genero)
        $h = strtr($h, [
            'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ñ'=>'n','ü'=>'u',
        ]);

        // Aplicar alias si existe
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
        return trim($valor);
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

    /**
     * Normaliza una fecha de nacimiento a formato YYYY-MM-DD o null.
     *
     * Acepta:
     *  - Número de serie de Excel (ej. 40000) → convierte
     *  - YYYY-MM-DD
     *  - DD/MM/YYYY, DD-MM-YYYY
     *  - YYYY/MM/DD
     *  - DateTime textual
     */
    private function normalizarFecha($valor): ?string
    {
        if ($valor === null) return null;

        $valor = trim((string) $valor);
        if ($valor === '') return null;

        // 1) ¿Es un número de serie de Excel? (rango razonable: 10000 = 1927, 60000 = 2064)
        if (is_numeric($valor)) {
            $num = (int) $valor;
            if ($num > 1000 && $num < 80000) {
                // Excel cuenta desde 1900-01-01 con un bug histórico (trata 1900 como bisiesto).
                // La fórmula estándar es: date = 1899-12-30 + días
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

        // 2) Probar formatos comunes
        $formatos = [
            'Y-m-d',
            'd/m/Y',
            'd-m-Y',
            'Y/m/d',
            'd.m.Y',
            'm/d/Y',   // Americano (último recurso)
        ];

        foreach ($formatos as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $valor);
            if ($dt && $dt->format($fmt) === $valor) {
                // Sanity: no fechas futuras
                if ($dt->getTimestamp() > time()) return null;
                return $dt->format('Y-m-d');
            }
        }

        // 3) Último intento con strtotime (por si viene "January 1, 2008" u otro)
        $ts = strtotime($valor);
        if ($ts !== false && $ts < time()) {
            return date('Y-m-d', $ts);
        }

        return null;
    }

    /**
     * Normaliza el sexo/género.
     * Mapea valores comunes a las opciones base y deja el resto tal cual (truncado a 50 chars).
     */
    private function normalizarSexo($valor): ?string
    {
        if ($valor === null) return null;

        $valor = trim((string) $valor);
        if ($valor === '') return null;

        // Truncar a 50 caracteres para no exceder la columna
        if (mb_strlen($valor) > 50) {
            $valor = mb_substr($valor, 0, 50);
        }

        $lower = mb_strtolower($valor, 'UTF-8');

        // Mapeos comunes → valor canónico
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

        // No matchea con ninguno → devolver tal cual (para que "Otro", "No binario", etc. se guarden)
        return $valor;
    }

    public function getMensaje()
    {
        return $this->mensaje;
    }
}
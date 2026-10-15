<?php
// app/Http/Controllers/Panel/BackupController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Ifsnop\Mysqldump\Mysqldump;

class BackupController extends Controller
{
    // Tablas que NO se incluyen en el backup completo
    // (datos runtime que no sirven para restaurar)
    private const TABLAS_EXCLUIDAS_COMPLETO = [
        'sessions',
        'jobs',
        'failed_jobs',
        'personal_access_tokens',
    ];

    // Ruta donde el cron guarda los backups automaticos
    private const DIR_BACKUPS_CRON = '/home/sebastian/backups';

    // Pagina de copias de seguridad con los botones de descarga.
    public function index()
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] !== 'Coordinador') {
            abort(403, 'Solo coordinadores pueden acceder a las copias de seguridad.');
        }

        return inertia('Panel/Backups', [
            'user'          => $user,
            'estadoBackups' => $this->estadoBackups(),
            'tablasExcluidas' => self::TABLAS_EXCLUIDAS_COMPLETO,
        ]);
    }

    // Verifica que el usuario en sesion sea Coordinador.
    private function verificarCoordinador(): void
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] !== 'Coordinador') {
            abort(403, 'Solo coordinadores pueden generar backups.');
        }
    }

    // Genera el dump y lo devuelve como string.
    // Si $soloTablas es null → toda la BD excepto tablas excluidas.
    private function generarDump(?array $soloTablas = null): string
    {
        $host   = config('database.connections.mysql.host');
        $port   = config('database.connections.mysql.port', '3306');
        $db     = config('database.connections.mysql.database');
        $userDb = config('database.connections.mysql.username');
        $pass   = config('database.connections.mysql.password');

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

        // Si es backup completo, excluir tablas runtime
        $excluir = empty($soloTablas) ? self::TABLAS_EXCLUIDAS_COMPLETO : [];

        $dumpSettings = [
            'include-tables'     => $soloTablas ?: [],
            'exclude-tables'     => $excluir,
            'compress'           => 'None',
            'no-data'            => false,
            'add-drop-table'     => true,
            'single-transaction' => true,
            'skip-comments'      => true,
            'routines'           => false,
            'events'             => false,
            'extended-insert'    => false,
        ];

        $dumper = new Mysqldump($dsn, $userDb, $pass, $dumpSettings);

        ob_start();
        $dumper->start('php://output');
        return ob_get_clean();
    }

    // Envia el contenido SQL como descarga.
    private function descargar(string $sqlContent, string $nombreArchivo)
    {
        return response()->streamDownload(function () use ($sqlContent) {
            echo $sqlContent;
        }, $nombreArchivo, [
            'Content-Type'        => 'application/sql',
            'Content-Disposition' => 'attachment; filename="' . $nombreArchivo . '"',
            'Cache-Control'       => 'no-store, no-cache, must-revalidate',
            'Pragma'              => 'no-cache',
        ]);
    }

    // Descarga SOLO la tabla citas.
    public function descargarCitas()
    {
        $this->verificarCoordinador();
        set_time_limit(0);
        ini_set('memory_limit', '512M');

        try {
            $sqlContent = $this->generarDump(['citas']);
        } catch (\Exception $e) {
            Log::error('Error al generar backup de citas', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Error al generar el backup. Revisa los logs.',
            ], 500);
        }

        $user = Session::get('user');
        Log::warning('Backup DESCARGADO: citas', [
            'por_usuario' => $user['usuario'] ?? null,
            'id_usuario'  => $user['id_usuario'] ?? null,
            'ip'          => request()->ip(),
            'bytes'       => strlen($sqlContent),
        ]);

        $fecha = now()->format('Y-m-d_H-i-s');
        return $this->descargar($sqlContent, "backup_citas_{$fecha}.sql");
    }

    // Descarga la BD completa (excepto tablas runtime).
    public function descargarCompleto()
    {
        $this->verificarCoordinador();
        set_time_limit(0);
        ini_set('memory_limit', '512M');

        try {
            $sqlContent = $this->generarDump(null);
        } catch (\Exception $e) {
            Log::error('Error al generar backup completo', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Error al generar el backup completo. Revisa los logs.',
            ], 500);
        }

        $user = Session::get('user');
        Log::warning('Backup DESCARGADO: completo', [
            'por_usuario'      => $user['usuario'] ?? null,
            'id_usuario'       => $user['id_usuario'] ?? null,
            'ip'               => request()->ip(),
            'bytes'            => strlen($sqlContent),
            'tablas_excluidas' => self::TABLAS_EXCLUIDAS_COMPLETO,
        ]);

        $fecha = now()->format('Y-m-d_H-i-s');
        return $this->descargar($sqlContent, "backup_completo_{$fecha}.sql");
    }

    // Lee el estado actual de los backups automaticos en el VPS.
    // Devuelve null en 'ultimo' si no hay archivos validos o si el directorio
    // no es accesible (por ejemplo, en local Windows).
    private function estadoBackups(): array
    {
        $dir = self::DIR_BACKUPS_CRON;

        // Si el directorio no existe o no es legible, devolver estado "no disponible"
        if (!is_dir($dir) || !is_readable($dir)) {
            return [
                'accesible'   => false,
                'ultimo'      => null,
                'fallidos'    => 0,
                'total'       => 0,
            ];
        }

        // Buscar archivos del cron diario (db-YYYYMMDD.sql)
        $archivos = glob($dir . '/db-*.sql') ?: [];

        if (empty($archivos)) {
            return [
                'accesible'   => true,
                'ultimo'      => null,
                'fallidos'    => 0,
                'total'       => 0,
            ];
        }

        $validos  = [];
        $fallidos = 0;

        foreach ($archivos as $archivo) {
            $size = @filesize($archivo);
            if ($size === false) continue;

            if ($size === 0) {
                $fallidos++;
            } else {
                $validos[] = $archivo;
            }
        }

        if (empty($validos)) {
            return [
                'accesible'   => true,
                'ultimo'      => null,
                'fallidos'    => $fallidos,
                'total'       => count($archivos),
            ];
        }

        // Ordenar por fecha de modificacion descendente
        usort($validos, fn($a, $b) => filemtime($b) - filemtime($a));

        $ultimo = $validos[0];
        $mtime  = filemtime($ultimo);
        $size   = filesize($ultimo);

        // Cuanto tiempo ha pasado desde el ultimo backup
        $segundosTranscurridos = time() - $mtime;
        $horasTranscurridas = round($segundosTranscurridos / 3600, 1);

        // Alerta si el ultimo backup tiene mas de 48 horas
        $desactualizado = $segundosTranscurridos > (48 * 3600);

        return [
            'accesible' => true,
            'ultimo'    => [
                'nombre'             => basename($ultimo),
                'fecha'              => date('d/m/Y H:i', $mtime),
                'hace_horas'         => $horasTranscurridas,
                'peso_bytes'         => $size,
                'peso_formateado'    => $this->formatearBytes($size),
            ],
            'fallidos'       => $fallidos,
            'total'          => count($archivos),
            'desactualizado' => $desactualizado,
        ];
    }

    // Formatea bytes a KB/MB legibles
    private function formatearBytes(int $bytes): string
    {
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1024 * 1024) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / (1024 * 1024), 2) . ' MB';
    }
}
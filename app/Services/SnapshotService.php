<?php
// app/Services/SnapshotService.php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Ifsnop\Mysqldump\Mysqldump;

class SnapshotService
{
    // Directorio dentro de storage donde se guardan los snapshots
    private const DIR_SNAPSHOTS = 'app/snapshots';

    // Tablas que NO se incluyen (mismas que el backup completo)
    private const TABLAS_EXCLUIDAS = [
        'sessions',
        'jobs',
        'failed_jobs',
        'personal_access_tokens',
    ];

    /**
     * Crea un snapshot de la BD antes de una operacion destructiva.
     * NO lanza excepcion si falla: solo registra en log.
     * Retorna el nombre del archivo generado o null si fallo.
     */
    public static function crear(string $accion, array $contexto = []): ?string
    {
        try {
            $sqlContent = self::generarDump();
        } catch (\Exception $e) {
            Log::error('[Snapshot] Fallo al generar dump', [
                'accion' => $accion,
                'error'  => $e->getMessage(),
            ]);
            return null;
        }

        try {
            $dir = storage_path(self::DIR_SNAPSHOTS);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $timestamp = now()->format('Y-m-d_H-i-s');
            $accionLimpia = preg_replace('/[^a-z0-9_]/i', '_', $accion);
            $nombreArchivo = "snapshot_{$accionLimpia}_{$timestamp}.sql";

            $path = $dir . '/' . $nombreArchivo;
            file_put_contents($path, $sqlContent);

            Log::info('[Snapshot] Snapshot creado', [
                'accion'         => $accion,
                'nombre'         => $nombreArchivo,
                'bytes'          => strlen($sqlContent),
                'contexto'       => $contexto,
                'usuario'        => session('user')['usuario'] ?? null,
                'ip'             => request()->ip(),
            ]);

            return $nombreArchivo;
        } catch (\Exception $e) {
            Log::error('[Snapshot] Fallo al guardar archivo', [
                'accion' => $accion,
                'error'  => $e->getMessage(),
            ]);
            return null;
        }
    }

    // Genera el dump SQL completo (excepto tablas runtime)
    private static function generarDump(): string
    {
        $host   = config('database.connections.mysql.host');
        $port   = config('database.connections.mysql.port', '3306');
        $db     = config('database.connections.mysql.database');
        $userDb = config('database.connections.mysql.username');
        $pass   = config('database.connections.mysql.password');

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

        $dumpSettings = [
            'include-tables'     => [],
            'exclude-tables'     => self::TABLAS_EXCLUIDAS,
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

    // Cuenta cuantos snapshots existen y cuanto pesan (para mostrar en UI)
    public static function estado(): array
    {
        $dir = storage_path(self::DIR_SNAPSHOTS);

        if (!is_dir($dir)) {
            return ['total' => 0, 'peso_bytes' => 0];
        }

        $archivos = glob($dir . '/*.sql') ?: [];
        $pesoTotal = 0;

        foreach ($archivos as $a) {
            $size = @filesize($a);
            if ($size !== false) $pesoTotal += $size;
        }

        return [
            'total'      => count($archivos),
            'peso_bytes' => $pesoTotal,
        ];
    }
}
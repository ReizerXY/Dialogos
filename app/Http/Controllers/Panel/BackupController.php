<?php
// app/Http/Controllers/Panel/BackupController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Session;
use Ifsnop\Mysqldump\Mysqldump;

class BackupController extends Controller
{
    /**
     * Página de copias de seguridad con los botones de descarga.
     */
    public function index()
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] !== 'Coordinador') {
            abort(403, 'Solo coordinadores pueden acceder a las copias de seguridad.');
        }

        return inertia('Panel/Backups', [
            'user' => $user,
        ]);
    }

    /**
     * Verifica que el usuario en sesión sea Coordinador.
     */
    private function verificarCoordinador(): void
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] !== 'Coordinador') {
            abort(403, 'Solo coordinadores pueden generar backups.');
        }
    }

    /**
     * Genera el dump y lo devuelve como string.
     * Si $soloTablas es null → toda la BD. Si es array → solo esas tablas.
     */
    private function generarDump(?array $soloTablas = null): string
    {
        $host   = config('database.connections.mysql.host');
        $port   = config('database.connections.mysql.port', '3306');
        $db     = config('database.connections.mysql.database');
        $userDb = config('database.connections.mysql.username');
        $pass   = config('database.connections.mysql.password');

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

        $dumpSettings = [
            'include-tables'     => $soloTablas ?: [],
            'exclude-tables'     => [],
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

    /**
     * Envía el contenido SQL como descarga.
     */
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

    /**
     * Descarga SOLO la tabla `citas`.
     */
    public function descargarCitas()
    {
        $this->verificarCoordinador();
        set_time_limit(0);
        ini_set('memory_limit', '512M');

        try {
            $sqlContent = $this->generarDump(['citas']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al generar el backup: ' . $e->getMessage(),
            ], 500);
        }

        $fecha = now()->format('Y-m-d_H-i-s');
        return $this->descargar($sqlContent, "backup_citas_{$fecha}.sql");
    }

    /**
     * Descarga TODAS las tablas de la base de datos.
     */
    public function descargarCompleto()
    {
        $this->verificarCoordinador();
        set_time_limit(0);
        ini_set('memory_limit', '512M');

        try {
            $sqlContent = $this->generarDump(null);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al generar el backup completo: ' . $e->getMessage(),
            ], 500);
        }

        $fecha = now()->format('Y-m-d_H-i-s');
        return $this->descargar($sqlContent, "backup_completo_{$fecha}.sql");
    }
}
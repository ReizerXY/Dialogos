<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Expediente - {{ $estudiante->nombre }}</title>
    <style>
        @page { margin: 25px 30px 50px 30px; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10.5px;
            color: #374151;
            margin: 0;
        }
        .header {
            border-bottom: 3px solid #FF5900;
            padding-bottom: 14px;
            margin-bottom: 18px;
            display: table;
            width: 100%;
        }
        .header-left { display: table-cell; vertical-align: middle; width: 60px; }
        .header-left img { width: 52px; height: 52px; object-fit: contain; }
        .header-right { display: table-cell; vertical-align: middle; padding-left: 12px; }
        .header-right h1 { font-size: 20px; color: #111827; margin: 0 0 3px 0; font-weight: bold; }
        .header-right .subtitle { font-size: 11px; color: #6B7280; margin: 0; }
        .header-meta { text-align: right; font-size: 9px; color: #9CA3AF; margin-top: 6px; }

        .info-box {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        .info-title { font-size: 14px; font-weight: bold; color: #111827; margin-bottom: 4px; }
        .info-sub { font-size: 11px; color: #6B7280; }
        .badge-egresado {
            display: inline-block; background: #FEF3C7; color: #92400E;
            padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold;
            margin-left: 8px; vertical-align: middle;
        }

        .cards { display: table; width: 100%; margin-bottom: 15px; border-spacing: 6px 0; page-break-inside: avoid; }
        .card { display: table-cell; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px 4px; text-align: center; width: 14%; }
        .card .value { font-size: 16px; font-weight: bold; color: #FF5900; line-height: 1.1; }
        .card .label { font-size: 8px; color: #6B7280; text-transform: uppercase; margin-top: 3px; }
        .card.completadas .value { color: #059669; }
        .card.programadas .value { color: #D97706; }
        .card.canceladas .value { color: #DC2626; }
        .card.asistio .value { color: #059669; }
        .card.falto .value { color: #DC2626; }
        .card.pendiente .value { color: #6B7280; }

        .section-title {
            font-size: 13px; color: #FF5900; font-weight: bold; margin-bottom: 8px;
            padding-bottom: 5px; border-bottom: 1.5px solid #FFE4D0; text-transform: uppercase;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; page-break-inside: auto; }
        table thead { display: table-header-group; }
        table tr { page-break-inside: avoid; }
        table th { background-color: #F3F4F6; text-align: left; padding: 8px 10px; border-bottom: 1.5px solid #E5E7EB; font-weight: bold; font-size: 9px; text-transform: uppercase; color: #4B5563; }
        table td { padding: 7px 10px; border-bottom: none; font-size: 10px; color: #374151; }
        table tr:nth-child(even) td { background-color: #FBFBFB; }

        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 8.5px; font-weight: bold; }
        .badge-programada { background: #FEF3C7; color: #92400E; }
        .badge-cancelada { background: #FEE2E2; color: #991B1B; }
        .badge-cancelada_liberada { background: #FED7AA; color: #9A3412; }
        .badge-completada { background: #D1FAE5; color: #065F46; }
        .badge-pendiente { background: #F3F4F6; color: #4B5563; }
        .badge-asistio { background: #D1FAE5; color: #065F46; }
        .badge-no-asistio { background: #FEE2E2; color: #991B1B; }

        .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
        .dot-academica { background: #3B82F6; }
        .dot-familiar { background: #22C55E; }
        .dot-emocional { background: #A855F7; }
        .dot-espiritual { background: #EC4899; }
        .dot-institucional { background: #F59E0B; }
        .dot-sin { background: #D1D5DB; }

        .footer { position: fixed; bottom: -35px; left: 0; right: 0; text-align: center; font-size: 8px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 6px; }
    </style>
</head>
<body>

    @php
        function formatFechaExp($fecha) {
            if (!$fecha) return '';
            $p = explode('-', $fecha);
            if (count($p) !== 3) return $fecha;
            return "{$p[2]}-{$p[1]}-{$p[0]}";
        }
        function labelEstadoExp($estado) {
            $map = ['programada' => 'Programada', 'cancelada' => 'Cancelada', 'cancelada_liberada' => 'Cancelada (liberada)', 'completada' => 'Completada'];
            return $map[$estado] ?? $estado;
        }
        function labelAsistenciaExp($asistencia) {
            $map = ['asistió' => 'Asistió', 'no asistió' => 'No asistió', 'pendiente' => 'Pendiente'];
            return $map[$asistencia] ?? ucfirst($asistencia);
        }
        function classDotExp($clas) {
            $map = ['académica' => 'dot-academica', 'familiar' => 'dot-familiar', 'emocional' => 'dot-emocional', 'espiritual' => 'dot-espiritual', 'institucional' => 'dot-institucional'];
            return $map[$clas] ?? 'dot-sin';
        }
    @endphp

    {{-- ENCABEZADO --}}
    <div class="header">
        <div class="header-left">
            @if(file_exists(public_path('images/logo.jpg')))
                <img src="{{ public_path('images/logo.jpg') }}" alt="Logo">
            @endif
        </div>
        <div class="header-right">
            <h1>Expediente del Estudiante</h1>
            <p class="subtitle">Sistema Diálogos — Prepa Anáhuac Veracruz campus Córdoba-Orizaba</p>
            <p class="header-meta">Generado el {{ now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>

    {{-- DATOS DEL ESTUDIANTE --}}
    <div class="info-box">
        <div class="info-title">
            {{ $estudiante->nombre }}
            @if($egresado)
                <span class="badge-egresado">Egresado</span>
            @endif
        </div>
        <div class="info-sub">
            <strong>Matrícula:</strong> {{ $estudiante->id_estudiante }} 
            @if(!$egresado)
                · <strong>Grado:</strong> {{ $estudiante->grado }} {{ $estudiante->grupo }}
                @if($estudiante->contacto)
                    · <strong>Contacto:</strong> {{ $estudiante->contacto }}
                @endif
                @if($estudiante->contacto_emergencia)
                    · <strong>Emergencia:</strong> {{ $estudiante->contacto_emergencia }}
                @endif
            @endif
        </div>
    </div>

    {{-- KPIs --}}
    <div class="cards">
        <div class="card">
            <div class="value">{{ $totalCitas }}</div>
            <div class="label">Total citas</div>
        </div>
        <div class="card programadas">
            <div class="value">{{ $citasProgramadas }}</div>
            <div class="label">Programadas</div>
        </div>
        <div class="card completadas">
            <div class="value">{{ $citasCompletadas }}</div>
            <div class="label">Completadas</div>
        </div>
        <div class="card canceladas">
            <div class="value">{{ $citasCanceladas }}</div>
            <div class="label">Canceladas</div>
        </div>
        <div class="card asistio">
            <div class="value">{{ $asistencias }}</div>
            <div class="label">Asistió</div>
        </div>
        <div class="card falto">
            <div class="value">{{ $faltas }}</div>
            <div class="label">No asistió</div>
        </div>
        <div class="card pendiente">
            <div class="value">{{ $pendientesAsistencia }}</div>
            <div class="label">Pendientes</div>
        </div>
    </div>

    {{-- HISTORIAL DE CITAS --}}
    <div class="section-title">Historial de citas ({{ count($citas) }})</div>
    <table>
        <thead>
            <tr>
                <th style="width:12%;">Fecha</th>
                <th style="width:8%;">Hora</th>
                <th style="width:20%;">Formador</th>
                <th style="width:10%;" class="text-center">Clasificación</th>
                <th style="width:15%;">Estado</th>
                <th style="width:12%;">Asistencia</th>
                <th style="width:23%;">Notas</th>
            </tr>
        </thead>
        <tbody>
            @forelse($citas as $cita)
                <tr>
                    <td>{{ formatFechaExp($cita->fecha) }}</td>
                    <td>{{ substr($cita->hora, 0, 5) }}</td>
                    <td>{{ $cita->nombre_formador ?? '—' }}</td>
                    <td class="text-center"><span class="dot {{ classDotExp($cita->clasificacion) }}"></span></td>
                    <td><span class="badge badge-{{ $cita->estado }}">{{ labelEstadoExp($cita->estado) }}</span></td>
                    <td>
                        @php
                            $asistClass = $cita->asistencia === 'asistió' ? 'asistio' : ($cita->asistencia === 'no asistió' ? 'no-asistio' : 'pendiente');
                        @endphp
                        <span class="badge badge-{{ $asistClass }}">{{ labelAsistenciaExp($cita->asistencia ?? 'pendiente') }}</span>
                    </td>
                    <td style="font-size: 9px; color: #6B7280;">{{ $cita->notas ?? '—' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 15px;">No hay citas registradas en el historial.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Documento confidencial generado desde el Sistema Diálogos. Uso exclusivo del personal autorizado.
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $text = "Página {PAGE_NUM} de {PAGE_COUNT}";
            $size = 8;
            $font = $fontMetrics->getFont("DejaVu Sans");
            $width = $fontMetrics->getTextWidth($text, $font, $size) / 2;
            $x = ($pdf->get_width() - $width) / 2;
            $y = $pdf->get_height() - 25;
            $pdf->page_text($x, $y, $text, $font, $size, [0.6, 0.6, 0.6]);
        }
    </script>

</body>
</html>
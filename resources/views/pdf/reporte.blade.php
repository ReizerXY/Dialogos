<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $titulo }}</title>
    <style>
        @page { margin: 25px 30px 50px 30px; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10.5px;
            color: #374151;
            margin: 0;
        }

        /* ---------- HEADER ---------- */
        .header {
            border-bottom: 3px solid #FF5900;
            padding-bottom: 14px;
            margin-bottom: 18px;
            display: table;
            width: 100%;
        }
        .header-left {
            display: table-cell;
            vertical-align: middle;
            width: 60px;
        }
        .header-left img {
            width: 52px;
            height: 52px;
            object-fit: contain;
        }
        .header-right {
            display: table-cell;
            vertical-align: middle;
            padding-left: 12px;
        }
        .header-right h1 {
            font-size: 20px;
            color: #111827;
            margin: 0 0 3px 0;
            font-weight: bold;
        }
        .header-right .subtitle {
            font-size: 11px;
            color: #6B7280;
            margin: 0;
        }
        .header-meta {
            text-align: right;
            font-size: 9px;
            color: #9CA3AF;
            margin-top: 6px;
        }

        /* ---------- PERIODO ---------- */
        .periodo-bar {
            background: #FFF7ED;
            border-left: 4px solid #FF5900;
            padding: 8px 12px;
            margin-bottom: 18px;
            border-radius: 3px;
            font-size: 10.5px;
            color: #7C2D12;
        }
        .periodo-bar strong { color: #9A3412; }

        /* ---------- SECCIONES ---------- */
        .section { margin-bottom: 20px; }
        .section-title {
            font-size: 13px;
            color: #FF5900;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1.5px solid #FFE4D0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* ---------- TARJETAS RESUMEN ---------- */
        .cards {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            border-spacing: 8px 0;
        }
        .card {
            display: table-cell;
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 10px 8px;
            text-align: center;
            width: 25%;
        }
        .card .value {
            font-size: 18px;
            font-weight: bold;
            color: #FF5900;
            line-height: 1.1;
        }
        .card .label {
            font-size: 8.5px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-top: 3px;
        }

        /* ---------- TABLAS ---------- */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table th {
            background-color: #F3F4F6;
            text-align: left;
            padding: 7px 9px;
            border-bottom: 1.5px solid #E5E7EB;
            font-weight: bold;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: #4B5563;
        }
        table td {
            padding: 6px 9px;
            border-bottom: 1px solid #F3F4F6;
            font-size: 10px;
            color: #374151;
        }
        table tr:nth-child(even) td { background-color: #FAFAFA; }
        table tr.total-row td {
            background: #FFF7ED !important;
            font-weight: bold;
            color: #7C2D12;
            border-top: 1.5px solid #FF5900;
        }

        /* ---------- BARRAS DE PORCENTAJE ---------- */
        .bar-container {
            width: 100%;
            background: #F3F4F6;
            border-radius: 4px;
            height: 8px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
        }
        .bar-fill {
            height: 8px;
            background: #FF5900;
            border-radius: 4px;
        }
        .bar-blue { background: #3B82F6; }
        .bar-green { background: #22C55E; }
        .bar-purple { background: #A855F7; }
        .bar-pink { background: #EC4899; }
        .bar-amber { background: #F59E0B; }
        .bar-orange { background: #F97316; }

        /* ---------- BADGES ---------- */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: capitalize;
        }
        .badge-programada { background: #FEF3C7; color: #92400E; }
        .badge-cancelada { background: #FEE2E2; color: #991B1B; }
        .badge-cancelada_liberada { background: #FED7AA; color: #9A3412; }
        .badge-completada { background: #D1FAE5; color: #065F46; }
        .badge-pendiente { background: #F3F4F6; color: #4B5563; }
        .badge-asistio { background: #D1FAE5; color: #065F46; }
        .badge-no-asistio { background: #FEE2E2; color: #991B1B; }

        /* ---------- CLASSIFICATION DOTS ---------- */
        .dot {
            display: inline-block;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            margin-right: 5px;
            vertical-align: middle;
        }
        .dot-academica     { background: #3B82F6; }
        .dot-familiar      { background: #22C55E; }
        .dot-emocional     { background: #A855F7; }
        .dot-espiritual    { background: #EC4899; }
        .dot-institucional { background: #F59E0B; }
        .dot-sin           { background: #D1D5DB; }

        /* ---------- MEDALLAS ---------- */
        .medal {
            display: inline-block;
            width: 18px;
            height: 18px;
            line-height: 18px;
            border-radius: 50%;
            text-align: center;
            font-size: 9px;
            font-weight: bold;
            color: white;
            margin-right: 6px;
        }
        .medal-1 { background: #EAB308; }
        .medal-2 { background: #9CA3AF; }
        .medal-3 { background: #D97706; }
        .medal-x { background: #E5E7EB; color: #6B7280; }

        /* ---------- FOOTER ---------- */
        .footer {
            position: fixed;
            bottom: -35px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8.5px;
            color: #9CA3AF;
            border-top: 1px solid #E5E7EB;
            padding-top: 6px;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .muted { color: #9CA3AF; font-size: 9px; }
    </style>
</head>
<body>

    @php
        function formatFechaPDF($fecha) {
            if (!$fecha) return '';
            $p = explode('-', $fecha);
            if (count($p) !== 3) return $fecha;
            return "{$p[2]}-{$p[1]}-{$p[0]}";
        }

        function pct($valor, $total) {
            if (!$total || $total == 0) return '0%';
            return round(($valor / $total) * 100, 1) . '%';
        }

        function labelEstado($estado) {
            $map = [
                'programada'         => 'Programada',
                'cancelada'          => 'Cancelada',
                'cancelada_liberada' => 'Cancelada (hora liberada)',
                'completada'         => 'Completada',
            ];
            return $map[$estado] ?? $estado;
        }

        function classEstadoBadge($estado) {
            return 'badge badge-' . $estado;
        }

        function classAsistenciaBadge($asistencia) {
            $map = [
                'asistió'    => 'badge badge-asistio',
                'no asistió' => 'badge badge-no-asistio',
                'pendiente'  => 'badge badge-pendiente',
            ];
            return $map[$asistencia] ?? 'badge badge-pendiente';
        }

        function classDotClasificacion($clas) {
            $map = [
                'académica'     => 'dot dot-academica',
                'familiar'      => 'dot dot-familiar',
                'emocional'     => 'dot dot-emocional',
                'espiritual'    => 'dot dot-espiritual',
                'institucional' => 'dot dot-institucional',
            ];
            return $map[$clas] ?? 'dot dot-sin';
        }

        function tieneSeccion($secciones, $nombre) {
            return in_array($nombre, $secciones);
        }
    @endphp

    {{-- ============ HEADER ============ --}}
    <div class="header">
        <div class="header-left">
            @if(file_exists(public_path('images/logo.jpg')))
                <img src="{{ public_path('images/logo.jpg') }}" alt="Logo">
            @endif
        </div>
        <div class="header-right">
            <h1>{{ $titulo }}</h1>
            <p class="subtitle">Sistema Diálogos — Prepa Anáhuac Veracruz campus Córdoba-Orizaba</p>
            <p class="header-meta">Generado: {{ $fechaGeneracion }} @if(!empty($generadoPor)) · Por: {{ $generadoPor }} @endif</p>
        </div>
    </div>

    {{-- ============ PERIODO ============ --}}
    <div class="periodo-bar">
        <strong>Periodo del reporte:</strong>
        {{ formatFechaPDF($datos['fecha_inicio'] ?? null) }} al {{ formatFechaPDF($datos['fecha_fin'] ?? null) }}
        @if(!empty($datos['periodo_label']))
            <span style="color:#9CA3AF;"> ({{ $datos['periodo_label'] }})</span>
        @endif
    </div>

    {{-- ============ RESUMEN ============ --}}
    @if(tieneSeccion($secciones, 'resumen'))
        @php
            $totalCitas  = $datos['total_citas'];
            $completadas = $datos['completadas'];
            $programadas = $datos['programadas'];
            $canceladas  = $datos['canceladas'];

            // El título cambia según el tipo:
            // - Reporte ejecutivo → "Resumen ejecutivo general"
            // - Otros reportes   → "Resumen del periodo"
            $tituloResumen = ($tipo === 'ejecutivo')
                ? 'Resumen ejecutivo general'
                : 'Resumen del periodo';
        @endphp
        <div class="section">
            <div class="section-title">{{ $tituloResumen }}</div>
            <div class="cards">
                <div class="card">
                    <div class="value">{{ $totalCitas }}</div>
                    <div class="label">Total citas</div>
                </div>
                <div class="card">
                    <div class="value">{{ $completadas }}</div>
                    <div class="label">Completadas</div>
                </div>
                <div class="card">
                    <div class="value">{{ $programadas }}</div>
                    <div class="label">Programadas</div>
                </div>
                <div class="card">
                    <div class="value">{{ $canceladas }}</div>
                    <div class="label">Canceladas</div>
                </div>
            </div>
            <div class="cards" style="margin-top:-8px;">
                <div class="card">
                    <div class="value">{{ $datos['estudiantes_atendidos'] }}</div>
                    <div class="label">Estudiantes atendidos</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['tasa_completacion'] }}%</div>
                    <div class="label">Tasa completación</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['tasa_cancelacion'] }}%</div>
                    <div class="label">Tasa cancelación</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['tasa_asistencia'] }}%</div>
                    <div class="label">Tasa asistencia</div>
                </div>
            </div>
        </div>
    @endif

    {{-- ============ CITAS POR ESTADO ============ --}}
    @if(tieneSeccion($secciones, 'por_estado') && !empty($datos['citas_por_estado']))
        @php $total = $datos['total_citas']; @endphp
        <div class="section">
            <div class="section-title">Cantidad de citas agrupadas por estado</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:35%;">Estado de la cita</th>
                        <th style="width:15%;" class="text-center">Total citas</th>
                        <th style="width:15%;" class="text-center">% del total</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(['completada','programada','cancelada','cancelada_liberada'] as $estado)
                        @if(isset($datos['citas_por_estado'][$estado]))
                            @php $t = $datos['citas_por_estado'][$estado]; @endphp
                            <tr>
                                <td><span class="{{ classEstadoBadge($estado) }}">{{ labelEstado($estado) }}</span></td>
                                <td class="text-center"><strong>{{ $t }}</strong></td>
                                <td class="text-center">{{ pct($t, $total) }}</td>
                                <td><div class="bar-container"><div class="bar-fill" style="width: {{ pct($t, $total) }};"></div></div></td>
                            </tr>
                        @endif
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL DE CITAS</td>
                        <td class="text-center">{{ $total }}</td>
                        <td class="text-center">100%</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ CITAS POR CLASIFICACIÓN ============ --}}
    @if(tieneSeccion($secciones, 'por_clasificacion') && !empty($datos['citas_por_clasificacion']))
        @php $total = $datos['total_citas']; @endphp
        <div class="section">
            <div class="section-title">Cantidad de citas agrupadas por tipo de clasificación</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:35%;">Tipo de clasificación</th>
                        <th style="width:15%;" class="text-center">Total citas</th>
                        <th style="width:15%;" class="text-center">% del total</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['citas_por_clasificacion'] as $clas => $t)
                        <tr>
                            <td><span class="{{ classDotClasificacion($clas) }}"></span>{{ ucfirst($clas) }}</td>
                            <td class="text-center"><strong>{{ $t }}</strong></td>
                            <td class="text-center">{{ pct($t, $total) }}</td>
                            <td><div class="bar-container"><div class="bar-fill" style="width: {{ pct($t, $total) }};"></div></div></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ CITAS POR ASISTENCIA ============ --}}
    @if(tieneSeccion($secciones, 'por_asistencia') && !empty($datos['citas_por_asistencia']))
        @php $total = $datos['total_citas']; @endphp
        <div class="section">
            <div class="section-title">Cantidad de citas agrupadas por asistencia del estudiante</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:35%;">Asistencia del estudiante</th>
                        <th style="width:15%;" class="text-center">Total citas</th>
                        <th style="width:15%;" class="text-center">% del total</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(['asistió','no asistió','pendiente'] as $asis)
                        @if(isset($datos['citas_por_asistencia'][$asis]))
                            @php $t = $datos['citas_por_asistencia'][$asis]; @endphp
                            <tr>
                                <td><span class="{{ classAsistenciaBadge($asis) }}">{{ $asis }}</span></td>
                                <td class="text-center"><strong>{{ $t }}</strong></td>
                                <td class="text-center">{{ pct($t, $total) }}</td>
                                <td><div class="bar-container"><div class="bar-fill" style="width: {{ pct($t, $total) }};"></div></div></td>
                            </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ ESTUDIANTES POR GRADO ============ --}}
    @if(tieneSeccion($secciones, 'por_grado') && !empty($datos['estudiantes_por_grado']) && count($datos['estudiantes_por_grado']) > 0)
        @php $totalG = array_sum((array) collect($datos['estudiantes_por_grado'])->pluck('total')->toArray()); @endphp
        <div class="section">
            <div class="section-title">Estudiantes atendidos agrupados por grado</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:30%;">Grado</th>
                        <th style="width:20%;" class="text-center">Estudiantes atendidos</th>
                        <th style="width:15%;" class="text-center">% del total</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['estudiantes_por_grado'] as $item)
                        <tr>
                            <td>{{ $item->grado }}</td>
                            <td class="text-center"><strong>{{ $item->total }}</strong></td>
                            <td class="text-center">{{ pct($item->total, $totalG) }}</td>
                            <td><div class="bar-container"><div class="bar-fill bar-blue" style="width: {{ pct($item->total, $totalG) }};"></div></div></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ ESTUDIANTES POR GRUPO ============ --}}
    @if(tieneSeccion($secciones, 'por_grupo') && !empty($datos['estudiantes_por_grupo']) && count($datos['estudiantes_por_grupo']) > 0)
        @php $totalGr = array_sum((array) collect($datos['estudiantes_por_grupo'])->pluck('total')->toArray()); @endphp
        <div class="section">
            <div class="section-title">Estudiantes atendidos agrupados por grupo</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:30%;">Grupo</th>
                        <th style="width:20%;" class="text-center">Estudiantes atendidos</th>
                        <th style="width:15%;" class="text-center">% del total</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['estudiantes_por_grupo'] as $item)
                        <tr>
                            <td>Grupo {{ $item->grupo }}</td>
                            <td class="text-center"><strong>{{ $item->total }}</strong></td>
                            <td class="text-center">{{ pct($item->total, $totalGr) }}</td>
                            <td><div class="bar-container"><div class="bar-fill bar-green" style="width: {{ pct($item->total, $totalGr) }};"></div></div></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ TOP FORMADORES ============ --}}
    @if(tieneSeccion($secciones, 'top_formadores') && !empty($datos['top_formadores']) && count($datos['top_formadores']) > 0)
        <div class="section">
            <div class="section-title">Ranking de formadores por cantidad de citas atendidas</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:8%;" class="text-center">Pos.</th>
                        <th style="width:62%;">Nombre del formador</th>
                        <th style="width:30%;" class="text-center">Citas atendidas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['top_formadores'] as $i => $f)
                        <tr>
                            <td class="text-center"><span class="medal medal-{{ $i < 3 ? ($i + 1) : 'x' }}">{{ $i + 1 }}</span></td>
                            <td>{{ $f->formador }}</td>
                            <td class="text-center"><strong>{{ $f->total_citas }}</strong></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ TOP ESTUDIANTES ============ --}}
    @if(tieneSeccion($secciones, 'top_estudiantes') && !empty($datos['top_estudiantes']) && count($datos['top_estudiantes']) > 0)
        <div class="section">
            <div class="section-title">Ranking de estudiantes por cantidad de citas recibidas</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:8%;" class="text-center">Pos.</th>
                        <th style="width:62%;">Nombre del estudiante</th>
                        <th style="width:30%;" class="text-center">Citas recibidas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['top_estudiantes'] as $i => $e)
                        <tr>
                            <td class="text-center"><span class="medal medal-{{ $i < 3 ? ($i + 1) : 'x' }}">{{ $i + 1 }}</span></td>
                            <td>{{ $e->nombre_estudiante }}</td>
                            <td class="text-center"><strong>{{ $e->total_citas }}</strong></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ DETALLE POR FORMADOR ============ --}}
    @if(tieneSeccion($secciones, 'detalle_formador') && !empty($datos['detalles_formador']) && count($datos['detalles_formador']) > 0)
        <div class="section">
            <div class="section-title">Desglose de citas por formador (estados y asistencia)</div>
            <table>
                <thead>
                    <tr>
                        <th>Formador</th>
                        <th class="text-center" style="width:10%;">Total citas</th>
                        <th class="text-center" style="width:12%;">Completadas</th>
                        <th class="text-center" style="width:12%;">Programadas</th>
                        <th class="text-center" style="width:12%;">Canceladas</th>
                        <th class="text-center" style="width:12%;">Asistencias</th>
                        <th class="text-center" style="width:10%;">Faltas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['detalles_formador'] as $d)
                        <tr>
                            <td>{{ $d->formador }}</td>
                            <td class="text-center"><strong>{{ $d->total }}</strong></td>
                            <td class="text-center" style="color:#065F46;">{{ $d->completadas }}</td>
                            <td class="text-center" style="color:#92400E;">{{ $d->programadas }}</td>
                            <td class="text-center" style="color:#991B1B;">{{ $d->canceladas }}</td>
                            <td class="text-center" style="color:#065F46;">{{ $d->asistencias }}</td>
                            <td class="text-center" style="color:#991B1B;">{{ $d->faltas }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ LISTADO DE CITAS ============ --}}
    @if(tieneSeccion($secciones, 'listado_citas') && !empty($datos['citas']))
        <div class="section">
            <div class="section-title">Listado detallado de citas registradas ({{ count($datos['citas']) }} en total)</div>
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Formador</th>
                        <th style="width:12%;" class="text-center">Fecha</th>
                        <th style="width:8%;" class="text-center">Hora</th>
                        <th style="width:18%;">Estado</th>
                        <th style="width:14%;">Asistencia</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['citas'] as $cita)
                        <tr>
                            <td>{{ $cita->nombre_estudiante }}</td>
                            <td>{{ $cita->nombre_formador }}</td>
                            <td class="text-center">{{ formatFechaPDF($cita->fecha) }}</td>
                            <td class="text-center">{{ substr($cita->hora, 0, 5) }}</td>
                            <td><span class="{{ classEstadoBadge($cita->estado) }}">{{ labelEstado($cita->estado) }}</span></td>
                            <td><span class="{{ classAsistenciaBadge($cita->asistencia ?? 'pendiente') }}">{{ $cita->asistencia ?? 'pendiente' }}</span></td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="text-center muted">No hay citas en el periodo seleccionado.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

    <div class="footer">
        Reporte generado desde la plataforma Diálogos — Prepa Anáhuac Veracruz campus Córdoba-Orizaba
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
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
    </div>

    {{-- =========================================================== --}}
    {{-- ==================== REPORTE DE CITAS ===================== --}}
    {{-- =========================================================== --}}
    @if($tipo == 'citas')
        @php
            $totalCitas = $datos['total_citas'];
            $completadas = $datos['citas_por_estado']['completada'] ?? 0;
            $programadas = $datos['citas_por_estado']['programada'] ?? 0;
            $canceladas  = ($datos['citas_por_estado']['cancelada'] ?? 0) + ($datos['citas_por_estado']['cancelada_liberada'] ?? 0);
            $tasaCompletacion = $totalCitas > 0 ? round(($completadas / $totalCitas) * 100, 1) : 0;
            $tasaCancelacion  = $totalCitas > 0 ? round(($canceladas  / $totalCitas) * 100, 1) : 0;
        @endphp

        <div class="section">
            <div class="section-title">Resumen ejecutivo</div>
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
            <table>
                <tr>
                    <td style="width:50%; border:none; padding-left:0;">
                        <strong>Tasa de completación:</strong>
                        <span style="color:#065F46; font-weight:bold;">{{ $tasaCompletacion }}%</span>
                    </td>
                    <td style="width:50%; border:none; text-align:right; padding-right:0;">
                        <strong>Tasa de cancelación:</strong>
                        <span style="color:#991B1B; font-weight:bold;">{{ $tasaCancelacion }}%</span>
                    </td>
                </tr>
            </table>
        </div>

        {{-- Distribución por estado --}}
        <div class="section">
            <div class="section-title">Distribución por estado</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:35%;">Estado</th>
                        <th style="width:15%;" class="text-center">Total</th>
                        <th style="width:15%;" class="text-center">%</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(['completada','programada','cancelada','cancelada_liberada'] as $estado)
                        @if(isset($datos['citas_por_estado'][$estado]))
                            @php $total = $datos['citas_por_estado'][$estado]; @endphp
                            <tr>
                                <td><span class="{{ classEstadoBadge($estado) }}">{{ labelEstado($estado) }}</span></td>
                                <td class="text-center"><strong>{{ $total }}</strong></td>
                                <td class="text-center">{{ pct($total, $totalCitas) }}</td>
                                <td>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: {{ pct($total, $totalCitas) }};"></div>
                                    </div>
                                </td>
                            </tr>
                        @endif
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL</td>
                        <td class="text-center">{{ $totalCitas }}</td>
                        <td class="text-center">100%</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>

        {{-- Distribución por clasificación --}}
        <div class="section">
            <div class="section-title">Distribución por clasificación</div>
            @if(count($datos['citas_por_clasificacion']) > 0)
                <table>
                    <thead>
                        <tr>
                            <th style="width:35%;">Clasificación</th>
                            <th style="width:15%;" class="text-center">Total</th>
                            <th style="width:15%;" class="text-center">%</th>
                            <th style="width:35%;">Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($datos['citas_por_clasificacion'] as $clas => $total)
                            <tr>
                                <td>
                                    <span class="{{ classDotClasificacion($clas) }}"></span>
                                    {{ ucfirst($clas) }}
                                </td>
                                <td class="text-center"><strong>{{ $total }}</strong></td>
                                <td class="text-center">{{ pct($total, $totalCitas) }}</td>
                                <td>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: {{ pct($total, $totalCitas) }};"></div>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="muted">No hay clasificaciones registradas en el periodo.</p>
            @endif
        </div>

        {{-- Distribución por asistencia --}}
        <div class="section">
            <div class="section-title">Distribución por asistencia</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:35%;">Asistencia</th>
                        <th style="width:15%;" class="text-center">Total</th>
                        <th style="width:15%;" class="text-center">%</th>
                        <th style="width:35%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(['asistió','no asistió','pendiente'] as $asis)
                        @if(isset($datos['citas_por_asistencia'][$asis]))
                            @php $total = $datos['citas_por_asistencia'][$asis]; @endphp
                            <tr>
                                <td><span class="{{ classAsistenciaBadge($asis) }}">{{ $asis }}</span></td>
                                <td class="text-center"><strong>{{ $total }}</strong></td>
                                <td class="text-center">{{ pct($total, $totalCitas) }}</td>
                                <td>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: {{ pct($total, $totalCitas) }};"></div>
                                    </div>
                                </td>
                            </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- Top formadores --}}
        @if(!empty($datos['top_formadores']) && count($datos['top_formadores']) > 0)
            <div class="section">
                <div class="section-title">Formadores con más citas en el periodo</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:10%;" class="text-center">#</th>
                            <th>Formador</th>
                            <th style="width:20%;" class="text-center">Citas</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($datos['top_formadores'] as $i => $f)
                            <tr>
                                <td class="text-center">
                                    <span class="medal medal-{{ $i < 3 ? ($i + 1) : 'x' }}">{{ $i + 1 }}</span>
                                </td>
                                <td>{{ $f->formador }}</td>
                                <td class="text-center"><strong>{{ $f->total_citas }}</strong></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        {{-- Listado detallado --}}
        <div class="section">
            <div class="section-title">Listado detallado de citas ({{ count($datos['citas']) }})</div>
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

    {{-- =========================================================== --}}
    {{-- ================= REPORTE DE ESTUDIANTES ================== --}}
    {{-- =========================================================== --}}
    @if($tipo == 'estudiantes')
        @php
            $totalEst = $datos['total_estudiantes'];
            $totalCitas = $datos['total_citas'];
            $promedio = $totalEst > 0 ? round($totalCitas / $totalEst, 1) : 0;
            $topEstudiante = count($datos['estudiantes']) > 0 ? $datos['estudiantes'][0] : null;
        @endphp

        <div class="section">
            <div class="section-title">Resumen ejecutivo</div>
            <div class="cards">
                <div class="card">
                    <div class="value">{{ $totalEst }}</div>
                    <div class="label">Estudiantes atendidos</div>
                </div>
                <div class="card">
                    <div class="value">{{ $totalCitas }}</div>
                    <div class="label">Total citas</div>
                </div>
                <div class="card">
                    <div class="value">{{ $promedio }}</div>
                    <div class="label">Promedio citas / estudiante</div>
                </div>
                <div class="card">
                    <div class="value">{{ count($datos['clasificaciones']) }}</div>
                    <div class="label">Clasificaciones usadas</div>
                </div>
            </div>
            @if($topEstudiante)
                <p style="font-size:10px; color:#6B7280;">
                    <strong>Estudiante con más citas:</strong>
                    <span style="color:#FF5900; font-weight:bold;">{{ $topEstudiante->nombre_estudiante }}</span>
                    ({{ $topEstudiante->total_citas }} citas)
                </p>
            @endif
        </div>

        {{-- Por grado --}}
        @if(!empty($datos['estudiantes_por_grado']) && count($datos['estudiantes_por_grado']) > 0)
            <div class="section">
                <div class="section-title">Distribución por grado</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:30%;">Grado</th>
                            <th style="width:15%;" class="text-center">Total</th>
                            <th style="width:15%;" class="text-center">%</th>
                            <th style="width:40%;">Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $totalAlumnos = array_sum((array) collect($datos['estudiantes_por_grado'])->pluck('total')->toArray()); @endphp
                        @foreach($datos['estudiantes_por_grado'] as $item)
                            <tr>
                                <td>{{ $item->grado }}</td>
                                <td class="text-center"><strong>{{ $item->total }}</strong></td>
                                <td class="text-center">{{ pct($item->total, $totalAlumnos) }}</td>
                                <td>
                                    <div class="bar-container">
                                        <div class="bar-fill bar-blue" style="width: {{ pct($item->total, $totalAlumnos) }};"></div>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        {{-- Por grupo --}}
        @if(!empty($datos['estudiantes_por_grupo']) && count($datos['estudiantes_por_grupo']) > 0)
            <div class="section">
                <div class="section-title">Distribución por grupo</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:30%;">Grupo</th>
                            <th style="width:15%;" class="text-center">Total</th>
                            <th style="width:15%;" class="text-center">%</th>
                            <th style="width:40%;">Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $totalGrupos = array_sum((array) collect($datos['estudiantes_por_grupo'])->pluck('total')->toArray()); @endphp
                        @foreach($datos['estudiantes_por_grupo'] as $item)
                            <tr>
                                <td>{{ $item->grupo }}</td>
                                <td class="text-center"><strong>{{ $item->total }}</strong></td>
                                <td class="text-center">{{ pct($item->total, $totalGrupos) }}</td>
                                <td>
                                    <div class="bar-container">
                                        <div class="bar-fill bar-green" style="width: {{ pct($item->total, $totalGrupos) }};"></div>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        {{-- Clasificaciones --}}
        <div class="section">
            <div class="section-title">Clasificaciones más frecuentes</div>
            @if(count($datos['clasificaciones']) > 0)
                <table>
                    <thead>
                        <tr>
                            <th style="width:40%;">Clasificación</th>
                            <th style="width:20%;" class="text-center">Total</th>
                            <th style="width:40%;">Visual</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $totalClas = array_sum((array) collect($datos['clasificaciones'])->pluck('total')->toArray()); @endphp
                        @foreach($datos['clasificaciones'] as $clas)
                            <tr>
                                <td>
                                    <span class="{{ classDotClasificacion($clas->clasificacion) }}"></span>
                                    {{ ucfirst($clas->clasificacion) }}
                                </td>
                                <td class="text-center"><strong>{{ $clas->total }}</strong></td>
                                <td>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: {{ pct($clas->total, $totalClas) }};"></div>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="muted">No hay clasificaciones registradas en el periodo.</p>
            @endif
        </div>

        {{-- Top estudiantes --}}
        <div class="section">
            <div class="section-title">Estudiantes con más citas</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:10%;" class="text-center">#</th>
                        <th>Estudiante</th>
                        <th style="width:20%;" class="text-center">Total citas</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['estudiantes'] as $i => $est)
                        <tr>
                            <td class="text-center">
                                <span class="medal medal-{{ $i < 3 ? ($i + 1) : 'x' }}">{{ $i + 1 }}</span>
                            </td>
                            <td>{{ $est->nombre_estudiante }}</td>
                            <td class="text-center"><strong>{{ $est->total_citas }}</strong></td>
                        </tr>
                    @empty
                        <tr><td colspan="3" class="text-center muted">No hay datos.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

    {{-- =========================================================== --}}
    {{-- ================= REPORTE DE FORMADORES =================== --}}
    {{-- =========================================================== --}}
    @if($tipo == 'formadores')
        @php
            $topFormador = count($datos['formadores']) > 0 ? $datos['formadores'][0] : null;
        @endphp

        <div class="section">
            <div class="section-title">Resumen ejecutivo</div>
            <div class="cards">
                <div class="card">
                    <div class="value">{{ $datos['formadores_activos'] }}</div>
                    <div class="label">Formadores activos</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['total_citas'] }}</div>
                    <div class="label">Total citas</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['promedio'] }}</div>
                    <div class="label">Promedio citas / formador</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['total_formadores'] }}</div>
                    <div class="label">Formadores registrados</div>
                </div>
            </div>
            @if($topFormador)
                <p style="font-size:10px; color:#6B7280;">
                    <strong>Formador más productivo:</strong>
                    <span style="color:#FF5900; font-weight:bold;">{{ $topFormador->formador }}</span>
                    ({{ $topFormador->total_citas }} citas)
                </p>
            @endif
        </div>

        {{-- Ranking con barras --}}
        <div class="section">
            <div class="section-title">Ranking de productividad</div>
            @php $maxCitas = count($datos['formadores']) > 0 ? $datos['formadores'][0]->total_citas : 1; @endphp
            <table>
                <thead>
                    <tr>
                        <th style="width:8%;" class="text-center">#</th>
                        <th style="width:32%;">Formador</th>
                        <th style="width:12%;" class="text-center">Citas</th>
                        <th style="width:12%;" class="text-center">%</th>
                        <th style="width:36%;">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['formadores'] as $i => $f)
                        <tr>
                            <td class="text-center">
                                <span class="medal medal-{{ $i < 3 ? ($i + 1) : 'x' }}">{{ $i + 1 }}</span>
                            </td>
                            <td>{{ $f->formador }}</td>
                            <td class="text-center"><strong>{{ $f->total_citas }}</strong></td>
                            <td class="text-center">{{ pct($f->total_citas, $datos['total_citas']) }}</td>
                            <td>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: {{ $maxCitas > 0 ? ($f->total_citas / $maxCitas) * 100 : 0 }}%;"></div>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="text-center muted">No hay datos.</td></tr>
                    @endforelse
                    <tr class="total-row">
                        <td colspan="2">TOTAL</td>
                        <td class="text-center">{{ $datos['total_citas'] }}</td>
                        <td class="text-center">100%</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>

        {{-- Detalles por formador --}}
        @if(!empty($datos['detalles_formador']))
            <div class="section">
                <div class="section-title">Detalle por formador</div>
                <table>
                    <thead>
                        <tr>
                            <th>Formador</th>
                            <th class="text-center" style="width:12%;">Total</th>
                            <th class="text-center" style="width:14%;">Completadas</th>
                            <th class="text-center" style="width:14%;">Canceladas</th>
                            <th class="text-center" style="width:14%;">Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($datos['detalles_formador'] as $d)
                            <tr>
                                <td>{{ $d->formador }}</td>
                                <td class="text-center"><strong>{{ $d->total }}</strong></td>
                                <td class="text-center" style="color:#065F46;">{{ $d->completadas }}</td>
                                <td class="text-center" style="color:#991B1B;">{{ $d->canceladas }}</td>
                                <td class="text-center" style="color:#065F46;">{{ $d->asistencias }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
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
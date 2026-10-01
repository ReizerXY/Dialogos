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

        /* ---------- ENCABEZADO ---------- */
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
            page-break-inside: avoid;
        }
        .periodo-bar strong { color: #9A3412; }

        /* ---------- SECCIONES ---------- */
        .section { margin-bottom: 22px; }

        /* Solo para secciones chicas: no partirse entre páginas.
           No usar en secciones con muchas filas: en DomPDF empuja todo a la
           siguiente página y deja un hueco feo. */
        .section--keep {
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 13px;
            color: #FF5900;
            font-weight: bold;
            margin-bottom: 6px;
            padding-bottom: 5px;
            border-bottom: 1.5px solid #FFE4D0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
            page-break-inside: avoid;
        }
        .section-subtitle {
            font-size: 10px;
            color: #6B7280;
            margin: 0 0 10px 0;
            line-height: 1.4;
            page-break-after: avoid;
            page-break-inside: avoid;
        }
        /* Aviso para secciones que usan histórico completo */
        .section-aviso {
            font-size: 9.5px;
            color: #9A3412;
            background: #FFF7ED;
            border-left: 3px solid #FF5900;
            padding: 6px 10px;
            border-radius: 3px;
            margin: 0 0 10px 0;
            page-break-inside: avoid;
        }

        /* ---------- TARJETAS RESUMEN ---------- */
        .cards {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            border-spacing: 8px 0;
            page-break-inside: avoid;
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
            page-break-inside: auto;
        }
        table thead {
            display: table-header-group;
        }
        table tr {
            page-break-inside: avoid;
        }
        table tfoot {
            display: table-footer-group;
        }
        table th {
            background-color: #F3F4F6;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1.5px solid #E5E7EB;
            font-weight: bold;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: #4B5563;
        }
        table td {
            padding: 7px 10px;
            border-bottom: none;
            font-size: 10px;
            color: #374151;
        }
        table tr:nth-child(even) td { background-color: #FBFBFB; }

        table tr.total-row td {
            background: #FFF7ED !important;
            font-weight: bold;
            color: #7C2D12;
            border-top: 1px solid #FFD5B0;
            padding-top: 9px;
            padding-bottom: 9px;
        }

        /* ---------- BADGES ---------- */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-programada { background: #FEF3C7; color: #92400E; }
        .badge-cancelada { background: #FEE2E2; color: #991B1B; }
        .badge-cancelada_liberada { background: #FED7AA; color: #9A3412; }
        .badge-completada { background: #D1FAE5; color: #065F46; }
        .badge-pendiente { background: #F3F4F6; color: #4B5563; }
        .badge-asistio { background: #D1FAE5; color: #065F46; }
        .badge-no-asistio { background: #FEE2E2; color: #991B1B; }

        /* ---------- PUNTOS DE CLASIFICACIÓN ---------- */
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

        /* ---------- PIE DE PÁGINA ---------- */
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

        /* Porcentaje destacado dentro de las tablas */
        .pct-cell {
            font-weight: bold;
            color: #7C2D12;
        }
        /* % de cobertura: verde si >= 70, naranja si >= 40, rojo si < 40 */
        .cob-alta { color: #065F46; font-weight: bold; }
        .cob-media { color: #92400E; font-weight: bold; }
        .cob-baja { color: #991B1B; font-weight: bold; }

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

        function labelAsistencia($asistencia) {
            $map = [
                'asistió'    => 'Asistió',
                'no asistió' => 'No asistió',
                'pendiente'  => 'Pendiente',
            ];
            return $map[$asistencia] ?? ucfirst($asistencia);
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

        function labelClasificacion($clas) {
            $map = [
                'académica'     => 'Académica',
                'familiar'      => 'Familiar',
                'emocional'     => 'Emocional',
                'espiritual'    => 'Espiritual',
                'institucional' => 'Institucional',
            ];
            return $map[$clas] ?? ucfirst($clas);
        }

        function classCobertura($pct) {
            if ($pct >= 70) return 'cob-alta';
            if ($pct >= 40) return 'cob-media';
            return 'cob-baja';
        }

        function tieneSeccion($secciones, $nombre) {
            return in_array($nombre, $secciones);
        }

        $tiposClasificacion = ['académica', 'familiar', 'emocional', 'espiritual', 'institucional'];
    @endphp

    {{-- ENCABEZADO --}}
    <div class="header">
        <div class="header-left">
            @if(file_exists(public_path('images/logo.jpg')))
                <img src="{{ public_path('images/logo.jpg') }}" alt="Logo">
            @endif
        </div>
        <div class="header-right">
            <h1>{{ $titulo }}</h1>
            <p class="subtitle">Sistema Diálogos — Prepa Anáhuac Veracruz campus Córdoba-Orizaba</p>
            <p class="header-meta">Generado el {{ $fechaGeneracion }} @if(!empty($generadoPor)) · Por: {{ $generadoPor }} @endif</p>
        </div>
    </div>

    {{-- PERIODO --}}
    <div class="periodo-bar">
        <strong>Periodo del reporte:</strong>
        del {{ formatFechaPDF($datos['fecha_inicio'] ?? null) }} al {{ formatFechaPDF($datos['fecha_fin'] ?? null) }}
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

            $tituloResumen = ($tipo === 'ejecutivo')
                ? 'Resumen ejecutivo general'
                : 'Resumen del periodo';
        @endphp
        <div class="section">
            <div class="section-title">{{ $tituloResumen }}</div>
            <p class="section-subtitle">
                Números principales del programa en el periodo seleccionado: total de citas registradas, cómo se distribuyen por estado, estudiantes atendidos y las tasas clave de cumplimiento, cancelación y asistencia.
            </p>
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
            <div class="cards" style="margin-top:-8px;">
                <div class="card">
                    <div class="value">{{ $datos['citas_por_estudiante'] }}</div>
                    <div class="label">Citas por estudiante</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['formadores_activos'] }}</div>
                    <div class="label">Formadores activos</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['total_estudiantes'] }}</div>
                    <div class="label">Estudiantes inscritos</div>
                </div>
                <div class="card">
                    <div class="value">{{ $datos['total_formadores'] }}</div>
                    <div class="label">Formadores habilitados</div>
                </div>
            </div>
        </div>
    @endif

    {{-- ============ RESUMEN DE COBERTURA (histórico total) ============ --}}
    @if(tieneSeccion($secciones, 'resumen_cobertura'))
        @php
            $inscritos   = $datos['total_estudiantes'];
            $atendidos   = $datos['estudiantes_atendidos_historico'];
            $sinAtencion = $datos['estudiantes_sin_atencion_count'];
            $pctCob      = $datos['pct_cobertura_historica'];
        @endphp
        <div class="section section--keep">
            <div class="section-title">Resumen de cobertura del programa</div>
            <p class="section-subtitle">
                Panorama general del alcance del programa en toda su historia. Mide a cuántos estudiantes ha llegado el servicio desde su creación.
            </p>
            <div class="section-aviso">
                Esta sección usa el histórico completo (no depende del periodo seleccionado).
            </div>
            <div class="cards">
                <div class="card">
                    <div class="value">{{ $inscritos }}</div>
                    <div class="label">Estudiantes inscritos</div>
                </div>
                <div class="card">
                    <div class="value">{{ $atendidos }}</div>
                    <div class="label">Atendidos alguna vez</div>
                </div>
                <div class="card">
                    <div class="value">{{ $sinAtencion }}</div>
                    <div class="label">Nunca han venido</div>
                </div>
                <div class="card">
                    <div class="value">{{ $pctCob }}%</div>
                    <div class="label">% Cobertura</div>
                </div>
            </div>
            <p style="font-size:9.5px; color:#6B7280; margin-top:4px;">
                <strong>Cómo leerlo:</strong> el % de cobertura indica qué fracción del alumnado ha recibido acompañamiento al menos una vez desde que existe el programa.
            </p>
        </div>
    @endif

    {{-- ============ CITAS POR ESTADO ============ --}}
    @if(tieneSeccion($secciones, 'por_estado') && !empty($datos['citas_por_estado']))
        @php $total = $datos['total_citas']; @endphp
        <div class="section section--keep">
            <div class="section-title">Citas agrupadas por estado</div>
            <p class="section-subtitle">
                Distribución de las citas según su estado actual. Útil para saber cuántas ya se atendieron, cuántas están por atender y cuántas se perdieron por cancelación.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:50%;">Estado de la cita</th>
                        <th style="width:25%;" class="text-center">Total citas</th>
                        <th style="width:25%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(['completada','programada','cancelada','cancelada_liberada'] as $estado)
                        @if(isset($datos['citas_por_estado'][$estado]))
                            @php $t = $datos['citas_por_estado'][$estado]; @endphp
                            <tr>
                                <td><span class="{{ classEstadoBadge($estado) }}">{{ labelEstado($estado) }}</span></td>
                                <td class="text-center"><strong>{{ $t }}</strong></td>
                                <td class="text-center pct-cell">{{ pct($t, $total) }}</td>
                            </tr>
                        @endif
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL DE CITAS</td>
                        <td class="text-center">{{ $total }}</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ CITAS POR CLASIFICACIÓN ============ --}}
    @if(tieneSeccion($secciones, 'por_clasificacion') && !empty($datos['citas_por_clasificacion']))
        @php
            $total = $datos['total_citas'];
            $totalClas = array_sum($datos['citas_por_clasificacion']);
        @endphp
        <div class="section section--keep">
            <div class="section-title">Citas agrupadas por tipo de clasificación</div>
            <p class="section-subtitle">
                Distribución de las citas según el tema tratado en cada sesión. Permite ver qué tipo de acompañamiento es el más solicitado por los estudiantes.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:50%;">Tipo de clasificación</th>
                        <th style="width:25%;" class="text-center">Total citas</th>
                        <th style="width:25%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['citas_por_clasificacion'] as $clas => $t)
                        <tr>
                            <td><span class="{{ classDotClasificacion($clas) }}"></span>{{ labelClasificacion($clas) }}</td>
                            <td class="text-center"><strong>{{ $t }}</strong></td>
                            <td class="text-center pct-cell">{{ pct($t, $total) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL DE CITAS CLASIFICADAS</td>
                        <td class="text-center">{{ $totalClas }}</td>
                        <td class="text-center">{{ pct($totalClas, $total) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ CITAS POR ASISTENCIA ============ --}}
    @if(tieneSeccion($secciones, 'por_asistencia') && !empty($datos['citas_por_asistencia']))
        @php
            $total = $datos['total_citas'];
            $totalAsis = array_sum($datos['citas_por_asistencia']);
        @endphp
        <div class="section section--keep">
            <div class="section-title">Citas agrupadas por asistencia del estudiante</div>
            <p class="section-subtitle">
                Distribución de las citas según si el estudiante asistió, no asistió o quedó pendiente de registrar su asistencia. La tasa de asistencia solo cuenta las citas con asistencia ya registrada.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:50%;">Asistencia del estudiante</th>
                        <th style="width:25%;" class="text-center">Total citas</th>
                        <th style="width:25%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(['asistió','no asistió','pendiente'] as $asis)
                        @if(isset($datos['citas_por_asistencia'][$asis]))
                            @php $t = $datos['citas_por_asistencia'][$asis]; @endphp
                            <tr>
                                <td><span class="{{ classAsistenciaBadge($asis) }}">{{ labelAsistencia($asis) }}</span></td>
                                <td class="text-center"><strong>{{ $t }}</strong></td>
                                <td class="text-center pct-cell">{{ pct($t, $total) }}</td>
                            </tr>
                        @endif
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL DE CITAS</td>
                        <td class="text-center">{{ $totalAsis }}</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ ESTUDIANTES POR GRADO (con cobertura) ============ --}}
    @if(tieneSeccion($secciones, 'por_grado') && !empty($datos['estudiantes_por_grado']) && count($datos['estudiantes_por_grado']) > 0)
        @php $totalG = array_sum((array) collect($datos['estudiantes_por_grado'])->pluck('total')->toArray()); @endphp
        <div class="section section--keep">
            <div class="section-title">Estudiantes atendidos por grado</div>
            <p class="section-subtitle">
                Estudiantes distintos que recibieron al menos una cita, agrupados por grado escolar. Incluye cuántos están inscritos en cada grado y el porcentaje de cobertura del programa.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:20%;">Grado</th>
                        <th style="width:20%;" class="text-center">Inscritos</th>
                        <th style="width:20%;" class="text-center">Atendidos</th>
                        <th style="width:20%;" class="text-center">% Cobertura</th>
                        <th style="width:20%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['estudiantes_por_grado'] as $item)
                        <tr>
                            <td>Grado {{ $item->grado }}</td>
                            <td class="text-center">{{ $item->inscritos }}</td>
                            <td class="text-center"><strong>{{ $item->total }}</strong></td>
                            <td class="text-center {{ classCobertura($item->pct_cobertura) }}">{{ $item->pct_cobertura }}%</td>
                            <td class="text-center pct-cell">{{ pct($item->total, $totalG) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL</td>
                        <td class="text-center">{{ $datos['total_estudiantes'] }}</td>
                        <td class="text-center">{{ $totalG }}</td>
                        <td class="text-center">{{ $datos['pct_cobertura_historica'] }}%</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ ESTUDIANTES POR GRADO Y GRUPO (con cobertura) ============ --}}
    @if(tieneSeccion($secciones, 'por_grado_grupo') && !empty($datos['estudiantes_por_grado_grupo']) && count($datos['estudiantes_por_grado_grupo']) > 0)
        @php $totalGG = array_sum((array) collect($datos['estudiantes_por_grado_grupo'])->pluck('total')->toArray()); @endphp
        <div class="section">
            <div class="section-title">Estudiantes atendidos por grado y grupo</div>
            <p class="section-subtitle">
                Estudiantes distintos con al menos una cita, agrupados por grado + grupo. Incluye inscritos y % de cobertura para detectar qué grupos específicos tienen menos presencia del programa.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:22%;">Grado y grupo</th>
                        <th style="width:19%;" class="text-center">Inscritos</th>
                        <th style="width:19%;" class="text-center">Atendidos</th>
                        <th style="width:20%;" class="text-center">% Cobertura</th>
                        <th style="width:20%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['estudiantes_por_grado_grupo'] as $item)
                        <tr>
                            <td>{{ $item->grado }} {{ $item->grupo }}</td>
                            <td class="text-center">{{ $item->inscritos }}</td>
                            <td class="text-center"><strong>{{ $item->total }}</strong></td>
                            <td class="text-center {{ classCobertura($item->pct_cobertura) }}">{{ $item->pct_cobertura }}%</td>
                            <td class="text-center pct-cell">{{ pct($item->total, $totalGG) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL</td>
                        <td class="text-center">{{ $datos['total_estudiantes'] }}</td>
                        <td class="text-center">{{ $totalGG }}</td>
                        <td class="text-center">{{ $datos['pct_cobertura_historica'] }}%</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ COBERTURA POR GRADO (reporte cobertura) ============ --}}
    @if(tieneSeccion($secciones, 'cobertura_por_grado') && !empty($datos['cobertura_por_grado']))
        @php
            $totalInsc = array_sum(array_map(fn($x) => $x->inscritos, $datos['cobertura_por_grado']));
            $totalAten = array_sum(array_map(fn($x) => $x->atendidos, $datos['cobertura_por_grado']));
            $totalSin  = array_sum(array_map(fn($x) => $x->sin_atencion, $datos['cobertura_por_grado']));
            $pctTotal  = $totalInsc > 0 ? round(($totalAten / $totalInsc) * 100, 1) : 0;
        @endphp
        <div class="section section--keep">
            <div class="section-title">Cobertura por grado</div>
            <p class="section-subtitle">
                Para cada grado: cuántos estudiantes están inscritos, cuántos han sido atendidos en el periodo, cuántos no, y qué porcentaje representan. Un % bajo indica que el programa casi no llega a ese grado.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:18%;">Grado</th>
                        <th style="width:16%;" class="text-center">Inscritos</th>
                        <th style="width:16%;" class="text-center">Atendidos</th>
                        <th style="width:18%;" class="text-center">Sin atención</th>
                        <th style="width:16%;" class="text-center">% Cobertura</th>
                        <th style="width:16%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['cobertura_por_grado'] as $item)
                        <tr>
                            <td>Grado {{ $item->grado }}</td>
                            <td class="text-center">{{ $item->inscritos }}</td>
                            <td class="text-center"><strong>{{ $item->atendidos }}</strong></td>
                            <td class="text-center" style="color:#991B1B;">{{ $item->sin_atencion }}</td>
                            <td class="text-center {{ classCobertura($item->pct_cobertura) }}">{{ $item->pct_cobertura }}%</td>
                            <td class="text-center pct-cell">{{ pct($item->atendidos, $totalAten) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL</td>
                        <td class="text-center">{{ $totalInsc }}</td>
                        <td class="text-center">{{ $totalAten }}</td>
                        <td class="text-center">{{ $totalSin }}</td>
                        <td class="text-center">{{ $pctTotal }}%</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ COBERTURA POR GRADO Y GRUPO (reporte cobertura) ============ --}}
    @if(tieneSeccion($secciones, 'cobertura_por_grado_grupo') && !empty($datos['cobertura_por_grado_grupo']))
        @php
            $totalInscGG = array_sum(array_map(fn($x) => $x->inscritos, $datos['cobertura_por_grado_grupo']));
            $totalAtenGG = array_sum(array_map(fn($x) => $x->atendidos, $datos['cobertura_por_grado_grupo']));
            $totalSinGG  = array_sum(array_map(fn($x) => $x->sin_atencion, $datos['cobertura_por_grado_grupo']));
            $pctGG = $totalInscGG > 0 ? round(($totalAtenGG / $totalInscGG) * 100, 1) : 0;
        @endphp
        <div class="section">
            <div class="section-title">Cobertura por grado y grupo</div>
            <p class="section-subtitle">
                Detalle por grupo específico: cuántos inscritos, cuántos atendidos, cuántos sin atención y el % de cobertura. Ayuda a identificar los grupos a los que el programa casi no ha llegado.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:18%;">Grado y grupo</th>
                        <th style="width:16%;" class="text-center">Inscritos</th>
                        <th style="width:16%;" class="text-center">Atendidos</th>
                        <th style="width:18%;" class="text-center">Sin atención</th>
                        <th style="width:16%;" class="text-center">% Cobertura</th>
                        <th style="width:16%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['cobertura_por_grado_grupo'] as $item)
                        <tr>
                            <td>{{ $item->grado }} {{ $item->grupo }}</td>
                            <td class="text-center">{{ $item->inscritos }}</td>
                            <td class="text-center"><strong>{{ $item->atendidos }}</strong></td>
                            <td class="text-center" style="color:#991B1B;">{{ $item->sin_atencion }}</td>
                            <td class="text-center {{ classCobertura($item->pct_cobertura) }}">{{ $item->pct_cobertura }}%</td>
                            <td class="text-center pct-cell">{{ pct($item->atendidos, $totalAtenGG) }}</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL</td>
                        <td class="text-center">{{ $totalInscGG }}</td>
                        <td class="text-center">{{ $totalAtenGG }}</td>
                        <td class="text-center">{{ $totalSinGG }}</td>
                        <td class="text-center">{{ $pctGG }}%</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ FRECUENCIA DE USO (reporte cobertura) ============ --}}
    @if(tieneSeccion($secciones, 'frecuencia_uso') && !empty($datos['frecuencia_uso']))
        @php
            $fu = $datos['frecuencia_uso'];
            $totalFu = $fu['total_estudiantes'] ?? 0;
        @endphp
        <div class="section section--keep">
            <div class="section-title">Frecuencia de uso del programa</div>
            <p class="section-subtitle">
                Cuántos estudiantes vinieron una sola vez, cuántos entre 2 y 3 veces, y cuántos 4 o más veces dentro del periodo. Ayuda a ver si el programa logra retener a los estudiantes o solo es una visita única.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:50%;">Frecuencia de visitas en el periodo</th>
                        <th style="width:25%;" class="text-center">Estudiantes</th>
                        <th style="width:25%;" class="text-center">% del total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1 cita (visita única)</td>
                        <td class="text-center"><strong>{{ $fu['una'] }}</strong></td>
                        <td class="text-center pct-cell">{{ pct($fu['una'], $totalFu) }}</td>
                    </tr>
                    <tr>
                        <td>2 a 3 citas (seguimiento)</td>
                        <td class="text-center"><strong>{{ $fu['dos_tres'] }}</strong></td>
                        <td class="text-center pct-cell">{{ pct($fu['dos_tres'], $totalFu) }}</td>
                    </tr>
                    <tr>
                        <td>4 o más citas (acompañamiento continuo)</td>
                        <td class="text-center"><strong>{{ $fu['cuatro_mas'] }}</strong></td>
                        <td class="text-center pct-cell">{{ pct($fu['cuatro_mas'], $totalFu) }}</td>
                    </tr>
                    <tr class="total-row">
                        <td>TOTAL ESTUDIANTES ATENDIDOS EN EL PERIODO</td>
                        <td class="text-center">{{ $totalFu }}</td>
                        <td class="text-center">100%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ TEMAS POR GRADO ============ --}}
    @if(tieneSeccion($secciones, 'temas_por_grado') && !empty($datos['temas_por_grado']))
        @php
            // Sumar cada columna de clasificación y el total general
            $totalPorClas = [];
            foreach ($tiposClasificacion as $tc) $totalPorClas[$tc] = 0;
            $totalGeneral = 0;
            foreach ($datos['temas_por_grado'] as $grado => $temas) {
                foreach ($tiposClasificacion as $tc) {
                    $totalPorClas[$tc] += $temas[$tc] ?? 0;
                }
                $totalGeneral += array_sum($temas);
            }
        @endphp
        <div class="section section--keep">
            <div class="section-title">Temas tratados por grado</div>
            <p class="section-subtitle">
                Tabla cruzada: qué tipo de tema consultan los estudiantes de cada grado. Sirve para planear intervenciones específicas por etapa (por ejemplo, más talleres emocionales para 1ro o más asesoría académica para 6to).
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:16%;">Grado</th>
                        @foreach($tiposClasificacion as $tipoClas)
                            <th class="text-center" style="width:14%;">{{ labelClasificacion($tipoClas) }}</th>
                        @endforeach
                        <th class="text-center" style="width:14%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['temas_por_grado'] as $grado => $temas)
                        <tr>
                            <td>Grado {{ $grado }}</td>
                            @foreach($tiposClasificacion as $tipoClas)
                                <td class="text-center">{{ $temas[$tipoClas] ?? 0 }}</td>
                            @endforeach
                            <td class="text-center"><strong>{{ array_sum($temas) }}</strong></td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL</td>
                        @foreach($tiposClasificacion as $tipoClas)
                            <td class="text-center">{{ $totalPorClas[$tipoClas] }}</td>
                        @endforeach
                        <td class="text-center">{{ $totalGeneral }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ ESTUDIANTES NUEVOS VS RECURRENTES POR MES ============ --}}
    @if(tieneSeccion($secciones, 'estudiantes_nuevos_mes') && !empty($datos['estudiantes_nuevos_mes']))
        <div class="section">
            <div class="section-title">Estudiantes nuevos vs recurrentes por mes</div>
            <p class="section-subtitle">
                Cada mes del periodo: cuántos estudiantes vinieron por primera vez al programa (nuevos) y cuántos ya tenían historial previo (recurrentes). Sirve para saber si el programa atrae gente nueva o solo atiende a los mismos.
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:22%;">Mes</th>
                        <th style="width:18%;" class="text-center">Estudiantes nuevos</th>
                        <th style="width:18%;" class="text-center">Estudiantes recurrentes</th>
                        <th style="width:18%;" class="text-center">Total estudiantes</th>
                        <th style="width:24%;" class="text-center">Citas registradas en el mes</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['estudiantes_nuevos_mes'] as $m)
                        <tr>
                            <td>{{ $m->mes_label }}</td>
                            <td class="text-center" style="color:#065F46;"><strong>{{ $m->nuevos }}</strong></td>
                            <td class="text-center">{{ $m->recurrentes }}</td>
                            <td class="text-center">{{ $m->nuevos + $m->recurrentes }}</td>
                            <td class="text-center">{{ $m->total_citas }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ RANKING DE FORMADORES ============ --}}
    @if(tieneSeccion($secciones, 'top_formadores') && !empty($datos['top_formadores']) && count($datos['top_formadores']) > 0)
        <div class="section">
            <div class="section-title">Ranking de formadores por citas atendidas</div>
            <p class="section-subtitle">
                Los 10 formadores con más citas atendidas en el periodo, ordenados de mayor a menor. Los tres primeros aparecen con medalla. Útil para reconocer la carga de trabajo del equipo.
            </p>
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

    {{-- ============ RANKING DE ESTUDIANTES (con contexto) ============ --}}
    @if(tieneSeccion($secciones, 'top_estudiantes') && !empty($datos['top_estudiantes']) && count($datos['top_estudiantes']) > 0)
        <div class="section">
            <div class="section-title">Ranking de estudiantes por citas recibidas</div>
            <p class="section-subtitle">
                Los 10 estudiantes con más citas en el periodo. Además del total, se muestran los temas que han tratado y la fecha de su última sesión, para identificar quién necesita seguimiento (por ejemplo, alguien con muchas citas pero cuya última sesión fue hace mucho).
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width:6%;" class="text-center">Pos.</th>
                        <th style="width:34%;">Nombre del estudiante</th>
                        <th style="width:30%;">Temas tratados</th>
                        <th style="width:16%;" class="text-center">Última sesión</th>
                        <th style="width:14%;" class="text-center">Citas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['top_estudiantes'] as $i => $e)
                        <tr>
                            <td class="text-center"><span class="medal medal-{{ $i < 3 ? ($i + 1) : 'x' }}">{{ $i + 1 }}</span></td>
                            <td>{{ $e->nombre_estudiante }}</td>
                            <td>
                                @if(!empty($e->temas))
                                    @foreach($e->temas as $tema)
                                        <span class="{{ classDotClasificacion($tema) }}"></span>{{ labelClasificacion($tema) }}@if(!$loop->last), @endif
                                    @endforeach
                                @else
                                    <span class="muted">Sin clasificar</span>
                                @endif
                            </td>
                            <td class="text-center">{{ $e->ultima_sesion ? formatFechaPDF($e->ultima_sesion) : '—' }}</td>
                            <td class="text-center"><strong>{{ $e->total_citas }}</strong></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ DESGLOSE POR FORMADOR (mejorado) ============ --}}
    @if(tieneSeccion($secciones, 'detalle_formador') && !empty($datos['detalles_formador']) && count($datos['detalles_formador']) > 0)
        @php
            // Totales del programa para la fila de cierre
            $tTotal = 0; $tCompl = 0; $tProg = 0; $tCanc = 0; $tCancLib = 0;
            $tAsist = 0; $tFaltas = 0; $tPend = 0;
            foreach ($datos['detalles_formador'] as $d) {
                $tTotal   += $d->total;
                $tCompl   += $d->completadas;
                $tProg    += $d->programadas;
                $tCanc    += $d->canceladas;
                $tCancLib += $d->canceladas_liberadas;
                $tAsist   += $d->asistencias;
                $tFaltas  += $d->faltas;
                $tPend    += $d->pendientes;
            }
            $baseAsistTotal = $tAsist + $tFaltas;
            $tPctAsist = $baseAsistTotal > 0 ? round(($tAsist / $baseAsistTotal) * 100, 1) : 0;
        @endphp
        <div class="section">
            <div class="section-title">Desglose de citas por formador (estados y asistencia)</div>
            <p class="section-subtitle">
                Detalle por formador: total, completadas, programadas, canceladas (que bloquean el horario), canceladas con horario liberado, asistencias, faltas, pendientes y % de asistencia. Ayuda a supervisar la carga real de trabajo y la calidad del servicio.
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Formador</th>
                        <th class="text-center" style="width:8%;">Total</th>
                        <th class="text-center" style="width:9%;">Complet.</th>
                        <th class="text-center" style="width:9%;">Program.</th>
                        <th class="text-center" style="width:9%;">Cancel.</th>
                        <th class="text-center" style="width:9%;">Cancel. lib.</th>
                        <th class="text-center" style="width:8%;">Asist.</th>
                        <th class="text-center" style="width:8%;">Faltas</th>
                        <th class="text-center" style="width:8%;">Pend.</th>
                        <th class="text-center" style="width:11%;">% Asistencia</th>
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
                            <td class="text-center" style="color:#9A3412;">{{ $d->canceladas_liberadas }}</td>
                            <td class="text-center" style="color:#065F46;">{{ $d->asistencias }}</td>
                            <td class="text-center" style="color:#991B1B;">{{ $d->faltas }}</td>
                            <td class="text-center" style="color:#6B7280;">{{ $d->pendientes }}</td>
                            <td class="text-center {{ classCobertura($d->pct_asistencia) }}">{{ $d->pct_asistencia }}%</td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td>TOTAL DEL PROGRAMA</td>
                        <td class="text-center">{{ $tTotal }}</td>
                        <td class="text-center">{{ $tCompl }}</td>
                        <td class="text-center">{{ $tProg }}</td>
                        <td class="text-center">{{ $tCanc }}</td>
                        <td class="text-center">{{ $tCancLib }}</td>
                        <td class="text-center">{{ $tAsist }}</td>
                        <td class="text-center">{{ $tFaltas }}</td>
                        <td class="text-center">{{ $tPend }}</td>
                        <td class="text-center">{{ $tPctAsist }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    {{-- ============ LISTADO DETALLADO DE CITAS ============ --}}
    @if(tieneSeccion($secciones, 'listado_citas') && !empty($datos['citas']))
        <div class="section">
            <div class="section-title">Listado detallado de citas registradas ({{ count($datos['citas']) }} en total)</div>
            <p class="section-subtitle">
                Cada cita registrada en el periodo, con estudiante, formador, fecha, hora, estado y asistencia. El encabezado se repite en cada página para facilitar la lectura cuando la tabla es larga.
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Formador</th>
                        <th style="width:12%;" class="text-center">Fecha</th>
                        <th style="width:8%;" class="text-center">Hora</th>
                        <th style="width:20%;">Estado</th>
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
                            <td><span class="{{ classAsistenciaBadge($cita->asistencia ?? 'pendiente') }}">{{ labelAsistencia($cita->asistencia ?? 'pendiente') }}</span></td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="text-center muted">No hay citas registradas en el periodo seleccionado.</td></tr>
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
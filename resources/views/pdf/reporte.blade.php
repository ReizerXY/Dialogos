<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $titulo }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #FF5900;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 22px;
            color: #FF5900;
            margin: 0;
        }
        .header p {
            font-size: 14px;
            color: #666;
            margin: 5px 0 0;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            font-size: 16px;
            color: #FF5900;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table th {
            background-color: #f8f8f8;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #ddd;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }
        table td {
            padding: 6px 10px;
            border: 1px solid #ddd;
        }
        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total {
            font-weight: bold;
            font-size: 14px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #999;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-programada { background: #FEF3C7; color: #92400E; }
        .badge-cancelada { background: #FEE2E2; color: #991B1B; }
        .badge-cancelada_liberada { background: #FED7AA; color: #9A3412; }
        .badge-completada { background: #D1FAE5; color: #065F46; }
        .badge-pendiente { background: #F3F4F6; color: #4B5563; }
        .badge-asistio { background: #D1FAE5; color: #065F46; }
        .badge-no-asistio { background: #FEE2E2; color: #991B1B; }
    </style>
</head>
<body>

    @php
        // Helper para formatear fecha YYYY-MM-DD → DD-MM-YYYY
        function formatFechaPDF($fecha) {
            if (!$fecha) return '';
            $p = explode('-', $fecha);
            if (count($p) !== 3) return $fecha;
            return "{$p[2]}-{$p[1]}-{$p[0]}";
        }
    @endphp

    <div class="header">
        <h1>{{ $titulo }}</h1>
        <p>Periodo: {{ formatFechaPDF($datos['fecha_inicio'] ?? null) }} al {{ formatFechaPDF($datos['fecha_fin'] ?? null) }}</p>
        <p style="font-size: 11px; color: #999;">Generado: {{ $fechaGeneracion }}</p>
    </div>

    @if($tipo == 'estudiantes')
        <div class="section">
            <h2>Resumen</h2>
            <p><strong>Total de estudiantes atendidos:</strong> {{ $datos['total_estudiantes'] }}</p>
        </div>

        <div class="section">
            <h2>Estudiantes con mayor número de citas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Total citas</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['estudiantes'] as $est)
                        <tr>
                            <td>{{ $est->nombre_estudiante }}</td>
                            <td>{{ $est->total_citas }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2">No hay datos.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Clasificaciones más frecuentes</h2>
            <table>
                <thead>
                    <tr>
                        <th>Clasificación</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['clasificaciones'] as $clas)
                        <tr>
                            <td>{{ $clas->clasificacion }}</td>
                            <td>{{ $clas->total }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2">No hay datos.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

    @if($tipo == 'citas')
        <div class="section">
            <h2>Resumen</h2>
            <p><strong>Total de citas:</strong> {{ $datos['total_citas'] }}</p>
        </div>

        <div class="section">
            <h2>Distribución por estado</h2>
            <table>
                <thead>
                    <tr>
                        <th>Estado</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['citas_por_estado'] as $estado => $total)
                        <tr>
                            <td>
                                <span class="badge badge-{{ $estado }}">{{ $estado === 'cancelada_liberada' ? 'Cancelada (liberada)' : $estado }}</span>
                            </td>
                            <td>{{ $total }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Distribución por clasificación</h2>
            <table>
                <thead>
                    <tr>
                        <th>Clasificación</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['citas_por_clasificacion'] as $clas => $total)
                        <tr>
                            <td>{{ $clas }}</td>
                            <td>{{ $total }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="2">No hay clasificaciones registradas.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Distribución por asistencia</h2>
            <table>
                <thead>
                    <tr>
                        <th>Asistencia</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($datos['citas_por_asistencia'] as $asis => $total)
                        <tr>
                            <td>
                                <span class="badge badge-{{ $asis }}">{{ $asis }}</span>
                            </td>
                            <td>{{ $total }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Listado de citas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Formador</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Asistencia</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['citas'] as $cita)
                        <tr>
                            <td>{{ $cita->nombre_estudiante }}</td>
                            <td>{{ $cita->nombre_formador }}</td>
                            <td>{{ formatFechaPDF($cita->fecha) }}</td>
                            <td>{{ substr($cita->hora, 0, 5) }}</td>
                            <td>
                                <span class="badge badge-{{ $cita->estado }}">
                                    {{ $cita->estado === 'cancelada_liberada' ? 'Cancelada (liberada)' : $cita->estado }}
                                </span>
                            </td>
                            <td><span class="badge badge-{{ $cita->asistencia ?? 'pendiente' }}">{{ $cita->asistencia ?? 'pendiente' }}</span></td>
                        </tr>
                    @empty
                        <tr><td colspan="6">No hay citas en el periodo seleccionado.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

    @if($tipo == 'formadores')
        <div class="section">
            <h2>Resumen</h2>
            <p><strong>Total de formadores activos:</strong> {{ $datos['formadores_activos'] }}</p>
            <p><strong>Total de citas:</strong> {{ $datos['total_citas'] }}</p>
            <p><strong>Promedio de citas por formador:</strong> {{ $datos['promedio'] }}</p>
        </div>

        <div class="section">
            <h2>Productividad por formador</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Formador</th>
                        <th>Total citas</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($datos['formadores'] as $index => $f)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>{{ $f->formador }}</td>
                            <td>{{ $f->total_citas }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="3">No hay datos.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

    <div class="footer">
        <p>Reporte generado desde la plataforma Diálogos - Prepa Anáhuac Veracruz</p>
    </div>

</body>
</html>
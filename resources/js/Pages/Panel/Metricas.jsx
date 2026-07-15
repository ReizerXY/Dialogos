import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Metricas({
    totalFormadores,
    totalEstudiantes,
    totalCitas,
    estudiantesPorGrado,
    estudiantesPorGrupo,
    citasPorEstado,
    citasPorClasificacion,
    citasPorAsistencia,
    formadoresTop,
    promedioCitasPorFormador,
    citasPorMes,
    citasSemanaActual,
    citasSemanaAnterior,
    proximasCitas,
    estudiantesTop,
    citasPorDiaSemana,
    user,
    filtroMes,
    filtroSemana
}) {
    // Estado para los filtros
    const [mes, setMes] = useState(filtroMes || '');
    const [semana, setSemana] = useState(filtroSemana || '');

    // Colores para estados de citas
    const estadoColores = {
        programada: 'bg-yellow-100 text-yellow-800',
        cancelada: 'bg-red-100 text-red-800',
        completada: 'bg-green-100 text-green-800',
    };

    // Colores para clasificación
    const clasificacionColores = {
        académica: 'bg-blue-100 text-blue-800',
        familiar: 'bg-indigo-100 text-indigo-800',
        emocional: 'bg-purple-100 text-purple-800',
        espiritual: 'bg-pink-100 text-pink-800',
        institucional: 'bg-teal-100 text-teal-800',
    };

    // Colores para asistencia
    const asistenciaColores = {
        pendiente: 'bg-gray-100 text-gray-600',
        asistió: 'bg-green-100 text-green-800',
        'no asistió': 'bg-red-100 text-red-800',
    };

    // Función para renderizar barras
    const renderBar = (value, max, color = 'bg-[#FF5900]') => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
        );
    };

    // Máximo para barras
    const maxCitasPorMes = citasPorMes.length > 0 ? Math.max(...citasPorMes.map(item => item.total)) : 1;
    const maxDiaSemana = Object.values(citasPorDiaSemana).length > 0 ? Math.max(...Object.values(citasPorDiaSemana)) : 1;

    // Aplicar filtros
    const aplicarFiltros = () => {
        let url = '/metricas?';
        if (mes) url += `mes=${mes}&`;
        if (semana) url += `semana=${semana}&`;
        window.location.href = url.slice(0, -1);
    };

    const limpiarFiltros = () => {
        window.location.href = '/metricas';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Métricas" />
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <h1 className="text-2xl font-bold">Métricas generales</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="month"
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            className="border rounded p-2"
                        />
                        <input
                            type="week"
                            value={semana}
                            onChange={(e) => setSemana(e.target.value)}
                            className="border rounded p-2"
                        />
                        <button onClick={aplicarFiltros} className="bg-[#FF5900] text-white px-4 py-2 rounded">Filtrar</button>
                        <button onClick={limpiarFiltros} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Limpiar</button>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Tarjetas de resumen */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded shadow text-center">
                        <div className="text-3xl font-bold text-[#FF5900]">{totalFormadores}</div>
                        <div className="text-gray-600">Formadores</div>
                    </div>
                    <div className="bg-white p-4 rounded shadow text-center">
                        <div className="text-3xl font-bold text-[#FF5900]">{totalEstudiantes}</div>
                        <div className="text-gray-600">Estudiantes</div>
                    </div>
                    <div className="bg-white p-4 rounded shadow text-center">
                        <div className="text-3xl font-bold text-[#FF5900]">{totalCitas}</div>
                        <div className="text-gray-600">Total citas</div>
                    </div>
                    <div className="bg-white p-4 rounded shadow text-center">
                        <div className="text-3xl font-bold text-[#FF5900]">{promedioCitasPorFormador}</div>
                        <div className="text-gray-600">Promedio citas / formador</div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Sección: Estudiantes */}
                {/* ========================================== */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Estudiantes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Por grado</h3>
                            {estudiantesPorGrado.length > 0 ? (
                                <div className="space-y-2">
                                    {estudiantesPorGrado.map(item => (
                                        <div key={item.grado}>
                                            <div className="flex justify-between text-sm">
                                                <span>{item.grado}</span>
                                                <span>{item.total}</span>
                                            </div>
                                            {renderBar(item.total, Math.max(...estudiantesPorGrado.map(i => i.total)), 'bg-blue-500')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Por grupo</h3>
                            {estudiantesPorGrupo.length > 0 ? (
                                <div className="space-y-2">
                                    {estudiantesPorGrupo.map(item => (
                                        <div key={item.grupo}>
                                            <div className="flex justify-between text-sm">
                                                <span>{item.grupo}</span>
                                                <span>{item.total}</span>
                                            </div>
                                            {renderBar(item.total, Math.max(...estudiantesPorGrupo.map(i => i.total)), 'bg-green-500')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Sección: Formadores */}
                {/* ========================================== */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Formadores</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Top formadores (más citas)</h3>
                            {formadoresTop.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {formadoresTop.map((item, index) => (
                                        <li key={index} className="py-2 flex justify-between items-center">
                                            <span className="flex items-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FF5900] text-white text-xs mr-2">
                                                    {index + 1}
                                                </span>
                                                {item.nombre}
                                            </span>
                                            <span className="font-semibold">{item.total} citas</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Top estudiantes (más citas)</h3>
                            {estudiantesTop.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {estudiantesTop.map((item, index) => (
                                        <li key={index} className="py-2 flex justify-between items-center">
                                            <span className="flex items-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs mr-2">
                                                    {index + 1}
                                                </span>
                                                {item.nombre_estudiante}
                                            </span>
                                            <span className="font-semibold">{item.total} citas</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Sección: Citas - Distribución */}
                {/* ========================================== */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Distribución de citas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Por estado</h3>
                            {Object.keys(citasPorEstado).length > 0 ? (
                                Object.entries(citasPorEstado).map(([estado, total]) => (
                                    <div key={estado} className="flex justify-between items-center py-1">
                                        <span className={`px-2 py-0.5 rounded text-xs ${estadoColores[estado] || 'bg-gray-100'}`}>
                                            {estado}
                                        </span>
                                        <span>{total}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Por clasificación</h3>
                            {Object.keys(citasPorClasificacion).length > 0 ? (
                                Object.entries(citasPorClasificacion).map(([clasif, total]) => (
                                    <div key={clasif} className="flex justify-between items-center py-1">
                                        <span className={`px-2 py-0.5 rounded text-xs ${clasificacionColores[clasif] || 'bg-gray-100'}`}>
                                            {clasif}
                                        </span>
                                        <span>{total}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Por asistencia</h3>
                            {Object.keys(citasPorAsistencia).length > 0 ? (
                                Object.entries(citasPorAsistencia).map(([asis, total]) => (
                                    <div key={asis} className="flex justify-between items-center py-1">
                                        <span className={`px-2 py-0.5 rounded text-xs ${asistenciaColores[asis] || 'bg-gray-100'}`}>
                                            {asis}
                                        </span>
                                        <span>{total}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Sección: Tendencias */}
                {/* ========================================== */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Tendencias</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Citas por mes (últimos 6 meses)</h3>
                            {citasPorMes.length > 0 ? (
                                <div className="space-y-2">
                                    {citasPorMes.map(item => (
                                        <div key={item.mes}>
                                            <div className="flex justify-between text-sm">
                                                <span>{item.mes}</span>
                                                <span>{item.total}</span>
                                            </div>
                                            {renderBar(item.total, maxCitasPorMes, 'bg-[#FF5900]')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Citas por día de la semana</h3>
                            {Object.keys(citasPorDiaSemana).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorDiaSemana).map(([dia, total]) => (
                                        <div key={dia}>
                                            <div className="flex justify-between text-sm">
                                                <span>{dia}</span>
                                                <span>{total}</span>
                                            </div>
                                            {renderBar(total, maxDiaSemana, 'bg-purple-500')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay datos</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded text-center">
                            <div className="text-sm text-gray-500">Esta semana</div>
                            <div className="text-2xl font-bold text-[#FF5900]">{citasSemanaActual}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                            <div className="text-sm text-gray-500">Semana pasada</div>
                            <div className="text-2xl font-bold text-gray-700">{citasSemanaAnterior}</div>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* Sección: Próximas citas */}
                {/* ========================================== */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Próximas citas (7 días)</h2>
                    {proximasCitas.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Estudiante</th>
                                        <th className="px-4 py-2 text-left">Formador</th>
                                        <th className="px-4 py-2 text-left">Fecha</th>
                                        <th className="px-4 py-2 text-left">Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proximasCitas.map(c => (
                                        <tr key={c.id}>
                                            <td className="px-4 py-2">{c.nombre_estudiante}</td>
                                            <td className="px-4 py-2">{c.nombre_formador}</td>
                                            <td className="px-4 py-2">{c.fecha}</td>
                                            <td className="px-4 py-2">{c.hora?.substring(0,5)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay citas programadas en los próximos 7 días.</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
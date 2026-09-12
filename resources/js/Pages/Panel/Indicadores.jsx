// resources/js/Pages/Panel/Indicadores.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';

// Paleta consistente con Citas / Expediente / NotasModal
const CLASIFICACION_COLOR_BLOCK = {
    'académica':     'bg-blue-500',
    'familiar':      'bg-green-500',
    'emocional':     'bg-purple-500',
    'espiritual':    'bg-pink-500',
    'institucional': 'bg-amber-500',
};

export default function Indicadores({
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
    const [mes, setMes] = useState(filtroMes || '');
    const [semana, setSemana] = useState(filtroSemana || '');

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    const estadoColores = {
        programada: 'bg-yellow-100 text-yellow-800',
        cancelada: 'bg-red-100 text-red-800',
        cancelada_liberada: 'bg-orange-100 text-orange-800',
        completada: 'bg-green-100 text-green-800',
    };

    const estadoLabels = {
        programada: 'Programada',
        cancelada: 'Cancelada',
        cancelada_liberada: 'Cancelada (hora liberada)',
        completada: 'Completada',
    };

    const asistenciaColores = {
        pendiente: 'bg-gray-100 text-gray-600',
        asistió: 'bg-green-100 text-green-800',
        'no asistió': 'bg-red-100 text-red-800',
    };

    const renderBar = (value, max, color = 'bg-[#FF5900]') => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
        );
    };

    const maxCitasPorMes = citasPorMes.length > 0 ? Math.max(...citasPorMes.map(item => item.total)) : 1;
    const maxDiaSemana = Object.values(citasPorDiaSemana).length > 0 ? Math.max(...Object.values(citasPorDiaSemana)) : 1;

    const aplicarFiltros = () => {
        let url = '/indicadores?';
        if (mes) url += `mes=${mes}&`;
        if (semana) url += `semana=${semana}&`;
        window.location.href = url.slice(0, -1);
    };

    const limpiarFiltros = () => {
        window.location.href = '/indicadores';
    };

    // Título dinámico de la sección de citas según filtro activo
    const tituloCitas = filtroMes
        ? `Citas del mes (${filtroMes})`
        : filtroSemana
            ? `Citas de la semana (${filtroSemana})`
            : 'Próximas citas (7 días)';

    const mensajeSinCitas = filtroMes
        ? 'No hay citas registradas en este mes.'
        : filtroSemana
            ? 'No hay citas registradas en esta semana.'
            : 'No hay citas programadas en los próximos 7 días.';

    return (
        <AuthenticatedLayout>
            <Head title="Indicadores" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Indicadores generales</h1>
                    <p className="text-gray-500 mt-1">Visualiza el rendimiento y las estadísticas del programa</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Periodo</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="month"
                                        value={mes}
                                        onChange={(e) => setMes(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                        placeholder="Mes específico"
                                    />
                                </div>
                                <div className="flex-1">
                                    <SelectorSemana
                                        value={semana}
                                        onChange={(nuevaSemana) => setSemana(nuevaSemana)}
                                        label=""
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={aplicarFiltros}
                                className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                            >
                                Aplicar
                            </button>
                            <button
                                onClick={limpiarFiltros}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                    {((mes || semana) || (filtroMes || filtroSemana)) && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                            {filtroMes && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF5900]/10 text-[#CC4700]">
                                    📅 {filtroMes}
                                </span>
                            )}
                            {filtroSemana && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF5900]/10 text-[#CC4700]">
                                    📅 Semana {filtroSemana}
                                </span>
                            )}
                            <span className="text-xs text-gray-400">Filtros activos</span>
                        </div>
                    )}
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-[#FF5900]">{totalFormadores}</div>
                        <div className="text-sm text-gray-500 mt-1">Formadores</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-[#FF5900]">{totalEstudiantes}</div>
                        <div className="text-sm text-gray-500 mt-1">Estudiantes</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-[#FF5900]">{totalCitas}</div>
                        <div className="text-sm text-gray-500 mt-1">Total citas</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-[#FF5900]">{promedioCitasPorFormador}</div>
                        <div className="text-sm text-gray-500 mt-1">Promedio citas / formador</div>
                    </div>
                </div>

                {/* Sección: Estudiantes */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                        Estudiantes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Por grado</h3>
                            {estudiantesPorGrado.length > 0 ? (
                                <div className="space-y-2">
                                    {estudiantesPorGrado.map(item => (
                                        <div key={`grado-${item.grado}`}>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.grado}</span>
                                                <span className="font-medium text-gray-800">{item.total}</span>
                                            </div>
                                            {renderBar(item.total, Math.max(...estudiantesPorGrado.map(i => i.total)), 'bg-blue-500')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Por grupo</h3>
                            {estudiantesPorGrupo.length > 0 ? (
                                <div className="space-y-2">
                                    {estudiantesPorGrupo.map(item => (
                                        <div key={`grupo-${item.grupo}`}>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.grupo}</span>
                                                <span className="font-medium text-gray-800">{item.total}</span>
                                            </div>
                                            {renderBar(item.total, Math.max(...estudiantesPorGrupo.map(i => i.total)), 'bg-green-500')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sección: Formadores y Estudiantes Top */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                            Top formadores
                        </h2>
                        {formadoresTop.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {formadoresTop.map((item, index) => (
                                    <li key={`formador-${item.nombre}-${index}`} className="py-3 flex justify-between items-center">
                                        <span className="flex items-center gap-3">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                                index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-400' :
                                                'bg-gray-300'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700">{item.nombre}</span>
                                        </span>
                                        <span className="font-medium text-gray-800">{item.total} citas</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm">No hay datos</p>
                        )}
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                            Top estudiantes
                        </h2>
                        {estudiantesTop.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {estudiantesTop.map((item, index) => (
                                    <li key={`estudiante-${item.nombre_estudiante}-${index}`} className="py-3 flex justify-between items-center">
                                        <span className="flex items-center gap-3">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                                index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-400' :
                                                'bg-gray-300'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700">{item.nombre_estudiante}</span>
                                        </span>
                                        <span className="font-medium text-gray-800">{item.total} citas</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm">No hay datos</p>
                        )}
                    </div>
                </div>

                {/* Sección: Distribución de citas */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                        Distribución de citas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Por estado</h3>
                            {Object.keys(citasPorEstado).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorEstado).map(([estado, total]) => (
                                        <div key={`estado-${estado}`} className="flex justify-between items-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${estadoColores[estado] || 'bg-gray-100 text-gray-700'}`}>
                                                {estadoLabels[estado] || estado}
                                            </span>
                                            <span className="font-medium text-gray-800">{total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Por clasificación</h3>
                            {Object.keys(citasPorClasificacion).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorClasificacion).map(([clasif, total]) => (
                                        <div key={`clasif-${clasif}`} className="flex justify-between items-center">
                                            <div
                                                className={`inline-block w-7 h-7 rounded-lg ${CLASIFICACION_COLOR_BLOCK[clasif] || 'bg-gray-400'} shadow-sm`}
                                                title={clasif}
                                                aria-label={`Clasificación: ${clasif}`}
                                            />
                                            <span className="font-medium text-gray-800">{total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Por asistencia</h3>
                            {Object.keys(citasPorAsistencia).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorAsistencia).map(([asis, total]) => (
                                        <div key={`asistencia-${asis}`} className="flex justify-between items-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${asistenciaColores[asis] || 'bg-gray-100 text-gray-700'}`}>
                                                {asis}
                                            </span>
                                            <span className="font-medium text-gray-800">{total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sección: Tendencias */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                        Tendencias
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Citas por mes</h3>
                            {citasPorMes.length > 0 ? (
                                <div className="space-y-2">
                                    {citasPorMes.map(item => (
                                        <div key={`mes-${item.mes}`}>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.mes}</span>
                                                <span className="font-medium text-gray-800">{item.total}</span>
                                            </div>
                                            {renderBar(item.total, maxCitasPorMes, 'bg-[#FF5900]')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Citas por día de la semana</h3>
                            {Object.keys(citasPorDiaSemana).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorDiaSemana).map(([dia, total]) => (
                                        <div key={`dia-${dia}`}>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700 capitalize">{dia}</span>
                                                <span className="font-medium text-gray-800">{total}</span>
                                            </div>
                                            {renderBar(total, maxDiaSemana, 'bg-purple-500')}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No hay datos</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="text-sm text-gray-500">Esta semana</div>
                            <div className="text-2xl font-bold text-[#FF5900]">{citasSemanaActual}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className="text-sm text-gray-500">Semana pasada</div>
                            <div className="text-2xl font-bold text-gray-700">{citasSemanaAnterior}</div>
                        </div>
                    </div>
                </div>

                {/* Sección: Citas del periodo (dinámico según filtro) */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">{tituloCitas}</h2>
                    </div>
                    {proximasCitas.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formador</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {proximasCitas.map(c => (
                                        <tr key={`cita-${c.id_cita}`} className="hover:bg-[#FF5900]/5 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-700">{c.nombre_estudiante}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{c.nombre_formador}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{formatFecha(c.fecha)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{c.hora?.substring(0,5)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500">{mensajeSinCitas}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
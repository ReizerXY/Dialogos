// resources/js/Pages/Panel/Indicadores/Secciones/SeccionCitas.jsx
import { useState, useEffect } from 'react';
import SeccionPanel from '../Componentes/SeccionPanel';
import ClasificacionDot from '@/Components/ClasificacionDot';
import { formatFecha } from '../helpers';

// Detecta móvil / pantalla chica
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

export default function SeccionCitas({
    citasDelPeriodo,
    tituloCitas,
    mensajeSinCitas,
}) {
    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Colores para los estados de las citas
    const estadoColores = {
        programada:         'bg-yellow-50 border-yellow-200 text-yellow-800',
        cancelada:          'bg-red-50 border-red-200 text-red-800',
        cancelada_liberada: 'bg-orange-50 border-orange-200 text-orange-800',
        completada:         'bg-green-50 border-green-200 text-green-800',
    };

    // Etiquetas de texto para los estados
    const estadoLabels = {
        programada: 'Programada',
        cancelada: 'Cancelada',
        cancelada_liberada: 'Cancelada (hora liberada)',
        completada: 'Completada',
    };

    return (
        <SeccionPanel titulo={tituloCitas}>
            {citasDelPeriodo.length > 0 ? (
                <>
                    {/* 📱 VISTA MÓVIL: Tarjetas */}
                    {esMovil && (
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            {citasDelPeriodo.map(c => {
                                const estadoColor = estadoColores[c.estado] || 'bg-gray-50 border-gray-200 text-gray-700';
                                const estadoLabel = estadoLabels[c.estado] || c.estado;

                                return (
                                    <div key={`card-${c.id_cita}`} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start gap-3 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                                                    {c.nombre_estudiante}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {c.nombre_formador || 'Sin formador asignado'}
                                                </p>
                                            </div>
                                            <ClasificacionDot clasificacion={c.clasificacion} size="md" />
                                        </div>
                                        
                                        <div className="flex items-center justify-between gap-2 mt-3">
                                            <span className="text-xs text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                {formatFecha(c.fecha)} · {c.hora?.substring(0,5)}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${estadoColor}`}>
                                                {estadoLabel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 💻 VISTA ESCRITORIO: Tabla */}
                    {!esMovil && (
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estudiante</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Formador</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Clasificación</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {citasDelPeriodo.map(c => {
                                        const estadoColor = estadoColores[c.estado] || 'bg-gray-50 border-gray-200 text-gray-700';
                                        const estadoLabel = estadoLabels[c.estado] || c.estado;

                                        return (
                                            <tr key={`row-${c.id_cita}`} className="hover:bg-gray-50 transition-colors">
                                                {/* Estudiante */}
                                                <td className="px-6 py-3.5 text-base font-medium text-gray-800">
                                                    {c.nombre_estudiante}
                                                </td>
                                                
                                                {/* Formador */}
                                                <td className="px-6 py-3.5 text-sm text-gray-600">
                                                    {c.nombre_formador || '—'}
                                                </td>
                                                
                                                {/* Fecha y Hora */}
                                                <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                                                    <span className="font-medium text-gray-800">{formatFecha(c.fecha)}</span>
                                                    <span className="text-gray-400 mx-1">·</span>
                                                    {c.hora?.substring(0,5)}
                                                </td>

                                                {/* Clasificación (Solo color) */}
                                                <td className="px-6 py-3.5 text-center">
                                                    <div className="flex justify-center">
                                                        <ClasificacionDot clasificacion={c.clasificacion} size="md" />
                                                    </div>
                                                </td>

                                                {/* Estado (Píldora) */}
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${estadoColor}`}>
                                                        {estadoLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                /* Empty State estándar */
                <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 text-lg font-semibold">Sin citas registradas</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">{mensajeSinCitas}</p>
                </div>
            )}
        </SeccionPanel>
    );
}
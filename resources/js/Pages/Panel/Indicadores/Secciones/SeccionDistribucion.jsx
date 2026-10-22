// resources/js/Pages/Panel/Indicadores/Secciones/SeccionDistribucion.jsx
import { useState } from 'react';
import SeccionPanel from '../Componentes/SeccionPanel';
import ClasificacionDot from '@/Components/ClasificacionDot';

export default function SeccionDistribucion({
    citasPorEstado = {},
    citasPorClasificacion = {},
    citasPorAsistencia = {},
    periodoTexto,
    contextoGradoGrupo,
}) {
    // Estado local para controlar la pestaña activa
    const [activeTab, setActiveTab] = useState('estado');

    const estadoColores = {
        programada:         { pill: 'bg-yellow-50 border-yellow-200 text-yellow-800', dot: 'bg-yellow-400' },
        cancelada:          { pill: 'bg-red-50 border-red-200 text-red-800',           dot: 'bg-red-400' },
        cancelada_liberada: { pill: 'bg-orange-50 border-orange-200 text-orange-800',  dot: 'bg-orange-400' },
        completada:         { pill: 'bg-green-50 border-green-200 text-green-800',     dot: 'bg-green-400' },
    };
    const estadoLabels = {
        programada: 'Programada',
        cancelada: 'Cancelada',
        cancelada_liberada: 'Cancelada (hora liberada)',
        completada: 'Completada',
    };
    const asistenciaColores = {
        pendiente:    { pill: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
        asistió:      { pill: 'bg-green-50 border-green-200 text-green-800', dot: 'bg-green-400' },
        'no asistió': { pill: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-400' },
    };

    const tabs = [
        { id: 'estado', label: 'Por Estado' },
        { id: 'clasificacion', label: 'Por Clasificación' },
        { id: 'asistencia', label: 'Por Asistencia' }
    ];

    return (
        <SeccionPanel titulo={`Distribución de citas de ${periodoTexto}${contextoGradoGrupo}`}>
            
            {/* Navegación de Pestañas */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-5 pb-3">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-[#FF5900] text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido de las Pestañas */}
            <div className="min-h-[120px]">
                
                {/* Pestaña: Estado */}
                {activeTab === 'estado' && (
                    <div className="animate-fadeIn">
                        {Object.keys(citasPorEstado).length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {['completada', 'programada', 'cancelada', 'cancelada_liberada'].map(estado => {
                                    if (!citasPorEstado[estado]) return null;
                                    const col = estadoColores[estado];
                                    return (
                                        <div key={estado} className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 ${col.pill} min-w-[200px]`}>
                                            <span className={`w-3 h-3 rounded-full ${col.dot}`}></span>
                                            <span className="text-sm font-medium flex-1">{estadoLabels[estado]}</span>
                                            <span className="text-lg font-bold">{citasPorEstado[estado]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-gray-400 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

                {/* Pestaña: Clasificación (Solo colores, como pediste) */}
                {activeTab === 'clasificacion' && (
                    <div className="animate-fadeIn">
                        {Object.keys(citasPorClasificacion).length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(citasPorClasificacion).map(([clasif, total]) => (
                                    <div
                                        key={`c-${clasif}`}
                                        className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm min-w-[120px]"
                                    >
                                        <ClasificacionDot clasificacion={clasif} size="md" />
                                        <span className="text-xl font-bold text-gray-800">{total}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

                {/* Pestaña: Asistencia */}
                {activeTab === 'asistencia' && (
                    <div className="animate-fadeIn">
                        {Object.keys(citasPorAsistencia).length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {['asistió', 'no asistió', 'pendiente'].map(asis => {
                                    if (!citasPorAsistencia[asis]) return null;
                                    const col = asistenciaColores[asis];
                                    return (
                                        <div key={asis} className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 ${col.pill} min-w-[200px]`}>
                                            <span className={`w-3 h-3 rounded-full ${col.dot}`}></span>
                                            <span className="text-sm font-medium capitalize flex-1">{asis}</span>
                                            <span className="text-lg font-bold">{citasPorAsistencia[asis]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-gray-400 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

            </div>
        </SeccionPanel>
    );
}
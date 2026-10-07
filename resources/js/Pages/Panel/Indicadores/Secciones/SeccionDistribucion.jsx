// resources/js/Pages/Panel/Indicadores/Secciones/SeccionDistribucion.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import { CLASIFICACION_COLOR_BLOCK, capitalizar } from '../helpers';

export default function SeccionDistribucion({
    citasPorEstado,
    citasPorClasificacion,
    citasPorAsistencia,
    subDistExpandido,
    toggleSubDist,
    periodoTexto,
    contextoGradoGrupo,
}) {
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

    return (
        <SeccionPanel titulo={`Distribución de citas de ${periodoTexto}${contextoGradoGrupo}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                {/* Tarjeta: Estado */}
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/40">
                    <button
                        onClick={() => toggleSubDist('estado')}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/60 transition text-left"
                    >
                        <span className="text-base font-medium text-gray-700">Cantidad de citas por estado</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${subDistExpandido === 'estado' ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${subDistExpandido === 'estado' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-4 pb-4 pt-1">
                            {Object.keys(citasPorEstado).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {['completada', 'programada', 'cancelada', 'cancelada_liberada'].map(estado => {
                                        if (!citasPorEstado[estado]) return null;
                                        const col = estadoColores[estado];
                                        return (
                                            <div key={estado} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${col.pill}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                                                <span className="text-sm font-medium">{estadoLabels[estado]}</span>
                                                <span className="text-base font-bold">{citasPorEstado[estado]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Clasificación */}
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/40">
                    <button
                        onClick={() => toggleSubDist('clasificacion')}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/60 transition text-left"
                    >
                        <span className="text-base font-medium text-gray-700">Cantidad de citas por tipo de clasificación</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${subDistExpandido === 'clasificacion' ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${subDistExpandido === 'clasificacion' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-4 pb-4 pt-1">
                            {Object.keys(citasPorClasificacion).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(citasPorClasificacion).map(([clasif, total]) => (
                                        <div
                                            key={`c-${clasif}`}
                                            className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-help"
                                            title={capitalizar(clasif)}
                                        >
                                            <div className={`w-4 h-4 rounded ${CLASIFICACION_COLOR_BLOCK[clasif] || 'bg-gray-400'}`}></div>
                                            <span className="text-base font-bold text-gray-800">{total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Asistencia */}
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/40">
                    <button
                        onClick={() => toggleSubDist('asistencia')}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/60 transition text-left"
                    >
                        <span className="text-base font-medium text-gray-700">Cantidad de citas por asistencia del estudiante</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${subDistExpandido === 'asistencia' ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${subDistExpandido === 'asistencia' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-4 pb-4 pt-1">
                            {Object.keys(citasPorAsistencia).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {['asistió', 'no asistió', 'pendiente'].map(asis => {
                                        if (!citasPorAsistencia[asis]) return null;
                                        const col = asistenciaColores[asis];
                                        return (
                                            <div key={asis} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${col.pill}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                                                <span className="text-sm font-medium capitalize">{asis}</span>
                                                <span className="text-base font-bold">{citasPorAsistencia[asis]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </div>
                    </div>
                </div>
            </div>
        </SeccionPanel>
    );
}
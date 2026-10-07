// resources/js/Pages/Panel/Indicadores/Secciones/SeccionFormadores.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import MiniStat from '../Componentes/MiniStat';
import Medal from '../Componentes/Medal';
import { CLASIFICACION_COLOR_BLOCK, capitalizar } from '../helpers';

export default function SeccionFormadores({
    detalleFormadores,
    formadoresExpandidos,
    toggleFormador,
    periodoTexto,
    contextoGradoGrupo,
}) {
    return (
        <SeccionPanel titulo={`Datos por formador de ${periodoTexto}${contextoGradoGrupo}`}>
            <div className="space-y-3">
                {detalleFormadores.map((f, idx) => {
                    const expandido = !!formadoresExpandidos[f.nombre];
                    return (
                        <div key={`det-${f.nombre}-${idx}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <button onClick={() => toggleFormador(f.nombre)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Medal position={idx} />
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold text-gray-800 truncate">{f.nombre}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">
                                            Atendió a {f.estudiantesUnicos} estudiante{f.estudiantesUnicos === 1 ? '' : 's'} en el periodo
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 whitespace-nowrap">
                                        <span className="font-bold text-gray-800">{f.total}</span>
                                        <span>cita{f.total === 1 ? '' : 's'}</span>
                                    </span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${expandido ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        <MiniStat label="Completadas" value={f.completadas} accent="green" />
                                        <MiniStat label="Programadas" value={f.programadas} accent="yellow" />
                                        <MiniStat label="Canceladas" value={f.canceladas} accent="red" />
                                        <MiniStat label="Tasa de asistencia" value={`${f.tasaAsistencia}%`} accent="orange" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <MiniStat label="Sí asistió" value={f.asistencias} />
                                        <MiniStat label="No asistió" value={f.faltas} />
                                    </div>
                                    {f.clasificaciones.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-600 mb-2">Temas más tratados</div>
                                            <div className="flex flex-wrap gap-2">
                                                {f.clasificaciones.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 cursor-help"
                                                        title={capitalizar(c.clasificacion)}
                                                    >
                                                        <div className={`w-4 h-4 rounded ${CLASIFICACION_COLOR_BLOCK[c.clasificacion] || 'bg-gray-400'}`}></div>
                                                        <span className="text-base font-bold text-gray-800">{c.total}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </SeccionPanel>
    );
}
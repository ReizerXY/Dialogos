// resources/js/Pages/Panel/Indicadores/Secciones/SeccionFormadores.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import MiniStat from '../Componentes/MiniStat';
import Medal from '../Componentes/Medal';
import ClasificacionDot from '@/Components/ClasificacionDot';

export default function SeccionFormadores({
    detalleFormadores,
    formadoresExpandidos,
    toggleFormador,
    periodoTexto,
    contextoGradoGrupo,
}) {
    return (
        <SeccionPanel titulo={`Datos por formador de ${periodoTexto}${contextoGradoGrupo}`}>
            <div className="space-y-4">
                {detalleFormadores.map((f, idx) => {
                    const expandido = !!formadoresExpandidos[f.nombre];
                    return (
                        <div key={`det-${f.nombre}-${idx}`} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-200 hover:border-[#FF5900]/30">
                            
                            {/* Cabecera del Acordeón */}
                            <button 
                                onClick={() => toggleFormador(f.nombre)} 
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <Medal position={idx} />
                                    <div className="min-w-0">
                                        <div className="text-lg font-bold text-gray-800 truncate">{f.nombre}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">
                                            Atendió a {f.estudiantesUnicos} estudiante{f.estudiantesUnicos === 1 ? '' : 's'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#CC4700] bg-[#FF5900]/10 border border-[#FF5900]/20 rounded-full px-4 py-1.5 whitespace-nowrap">
                                        <span className="text-base font-extrabold">{f.total}</span>
                                        <span>cita{f.total === 1 ? '' : 's'}</span>
                                    </span>
                                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Contenido del Acordeón */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandido ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 py-5 border-t border-gray-100 bg-gray-50/40">
                                    
                                    {/* Fila 1: Estatus de las citas */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <MiniStat label="Completadas" value={f.completadas} accent="green" />
                                        <MiniStat label="Programadas" value={f.programadas} accent="yellow" />
                                        <MiniStat label="Canceladas" value={f.canceladas} accent="red" />
                                    </div>

                                    {/* Fila 2: Asistencia */}
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sí asistió</div>
                                                <div className="text-xl font-bold text-gray-800">{f.asistencias}</div>
                                            </div>
                                            <div className="w-px h-8 bg-gray-200"></div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">No asistió</div>
                                                <div className="text-xl font-bold text-gray-800">{f.faltas}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Tasa de asistencia:</span>
                                            <span className="text-xl font-extrabold text-[#FF5900]">{f.tasaAsistencia}%</span>
                                        </div>
                                    </div>

                                    {/* Fila 3: Temas (Solo color y número) */}
                                    {f.clasificaciones.length > 0 && (
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Temas más tratados</div>
                                            <div className="flex flex-wrap gap-2">
                                                {f.clasificaciones.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
                                                        title={c.clasificacion} /* Tooltip nativo por si acaso */
                                                    >
                                                        <ClasificacionDot clasificacion={c.clasificacion} size="sm" />
                                                        <span className="text-sm font-bold text-gray-900 bg-gray-100 rounded-md px-1.5 py-0.5 ml-1">
                                                            {c.total}
                                                        </span>
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
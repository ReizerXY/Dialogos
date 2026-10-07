// resources/js/Pages/Panel/Indicadores/Secciones/SeccionEstudiantes.jsx
import SeccionPanel from '../Componentes/SeccionPanel';

export default function SeccionEstudiantes({
    estudiantesAgrupados,
    estudiantesExpandidos,
    toggleGradoGrupo,
}) {
    return (
        <SeccionPanel titulo="Estudiantes atendidos por grado y grupo">
            <div className="space-y-4">
                {Object.entries(estudiantesAgrupados).map(([gradoKey, grupos]) => (
                    <div key={`grado-${gradoKey}`} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex items-center justify-between">
                            <span className="text-base font-semibold text-gray-800">Grado {gradoKey}</span>
                            <span className="text-sm text-gray-500">{grupos.reduce((s, g) => s + g.total, 0)} estudiantes atendidos</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
                            {grupos.map((g) => {
                                const key = `${gradoKey}-${g.grupo}`;
                                const expandido = !!estudiantesExpandidos[key];
                                return (
                                    <div key={key} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <button onClick={() => toggleGradoGrupo(key)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left">
                                            <div>
                                                <div className="text-base font-semibold text-gray-800">Grupo {g.grupo}</div>
                                                <div className="text-sm text-gray-500">{g.total} estudiantes</div>
                                            </div>
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${expandido ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <ul className="border-t border-gray-100 divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                                                {g.alumnos.map((al) => (
                                                    <li key={al.id_estudiante} className="px-4 py-2.5 text-sm text-gray-700 flex justify-between">
                                                        <span>{al.nombre}</span>
                                                        <span className="text-gray-400 font-mono text-xs">{al.id_estudiante}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {Object.keys(estudiantesAgrupados).length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                        No hay estudiantes atendidos para el filtro seleccionado.
                    </p>
                )}
            </div>
        </SeccionPanel>
    );
}
// resources/js/Pages/Panel/Indicadores/Secciones/SeccionEstudiantes.jsx
import { useState } from 'react';
import SeccionPanel from '../Componentes/SeccionPanel';

export default function SeccionEstudiantes({
    estudiantesAgrupados,
    estudiantesExpandidos,
    toggleGradoGrupo,
    periodoTexto,
    contextoGradoGrupo,
}) {
    // Estado para controlar qué grado se está viendo
    const [activeGrado, setActiveGrado] = useState(
        Object.keys(estudiantesAgrupados)[0] || ''
    );

    // Función para formatear el nombre del grado correctamente
    const formatGrado = (gradoKey) => {
        const map = {
            '1ro': '1er Grado',
            '2do': '2do Grado',
            '3ro': '3er Grado',
            '4to': '4to Grado',
            '5to': '5to Grado',
            '6to': '6to Grado',
        };
        return map[gradoKey] || `${gradoKey} Grado`;
    };

    const gradosKeys = Object.keys(estudiantesAgrupados);

    return (
        <SeccionPanel titulo={`Estudiantes atendidos por grado y grupo de ${periodoTexto}${contextoGradoGrupo || ''}`}>
            
            {gradosKeys.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-12 px-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 text-lg font-semibold">No hay estudiantes atendidos</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">No se encontraron registros para el filtro seleccionado.</p>
                </div>
            ) : (
                <>
                    {/* Navegación de Pestañas (Grados) */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-5 pb-3">
                        {gradosKeys.map(gradoKey => (
                            <button
                                key={gradoKey}
                                onClick={() => setActiveGrado(gradoKey)}
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    activeGrado === gradoKey
                                        ? 'bg-[#FF5900] text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {formatGrado(gradoKey)}
                            </button>
                        ))}
                    </div>

                    {/* Contenido del Grado Activo */}
                    <div className="min-h-[200px]">
                        {activeGrado && estudiantesAgrupados[activeGrado] && (
                            <div className="animate-fadeIn border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                
                                <div className="bg-gray-50 border-l-4 border-[#FF5900] px-5 py-4 flex items-center justify-between border-b border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {formatGrado(activeGrado)}
                                    </h3>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
                                        <span className="text-base font-bold text-gray-800">
                                            {estudiantesAgrupados[activeGrado].reduce((s, g) => s + g.total, 0)}
                                        </span>
                                        <span>estudiantes atendidos</span>
                                    </span>
                                </div>

                                {/* Cuadrícula de Grupos */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5">
                                    {estudiantesAgrupados[activeGrado].map((g) => {
                                        const key = `${activeGrado}-${g.grupo}`;
                                        const expandido = !!estudiantesExpandidos[key];
                                        
                                        return (
                                            <div key={key} className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-200 hover:border-[#FF5900]/40 hover:shadow-sm">
                                                <button 
                                                    onClick={() => toggleGradoGrupo(key)} 
                                                    className={`w-full flex items-center justify-between px-4 py-3 transition text-left ${expandido ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div>
                                                        <div className="text-base font-bold text-gray-800">
                                                            Grupo {g.grupo}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-0.5">
                                                            {g.total} {g.total === 1 ? 'estudiante' : 'estudiantes'}
                                                        </div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expandido ? 'bg-[#FF5900]/10 text-[#FF5900]' : 'bg-gray-100 text-gray-400'}`}>
                                                        <svg className={`w-4 h-4 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </button>
                                                
                                                {/* Lista de Alumnos */}
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandido ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <ul className="border-t border-gray-100 max-h-[350px] overflow-y-auto bg-white">
                                                        {g.alumnos.map((al) => (
                                                            <li key={al.id_estudiante} className="px-4 py-3 text-sm flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                                <span className="text-base font-medium text-gray-700 truncate pr-2">
                                                                    {al.nombre}
                                                                </span>
                                                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                                                                    {al.id_estudiante}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </SeccionPanel>
    );
}
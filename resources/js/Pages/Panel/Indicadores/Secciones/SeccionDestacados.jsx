// resources/js/Pages/Panel/Indicadores/Secciones/SeccionDestacados.jsx
import { useState } from 'react';
import SeccionPanel from '../Componentes/SeccionPanel';
import RankingItem from '../Componentes/RankingItem';

export default function SeccionDestacados({
    formadoresTop,
    estudiantesTop,
    periodoTexto,
    contextoGradoGrupo,
}) {
    // Estado para controlar la pestaña activa
    const [activeTab, setActiveTab] = useState('formadores');

    const tabs = [
        { id: 'formadores', label: 'Top Formadores' },
        { id: 'estudiantes', label: 'Top Estudiantes' }
    ];

    return (
        <SeccionPanel titulo={`Formadores y estudiantes con más citas de ${periodoTexto}${contextoGradoGrupo}`}>
            
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
            <div className="min-h-[150px]">
                
                {/* Pestaña: Formadores */}
                {activeTab === 'formadores' && (
                    <div className="animate-fadeIn">
                        {formadoresTop.length > 0 ? (
                            <div className="space-y-3">
                                {formadoresTop.map((item, i) => (
                                    <RankingItem
                                        key={`f-${i}`}
                                        posicion={i}
                                        nombre={item.nombre}
                                        total={item.total}
                                        unidad="cita"
                                    />
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

                {/* Pestaña: Estudiantes */}
                {activeTab === 'estudiantes' && (
                    <div className="animate-fadeIn">
                        {estudiantesTop.length > 0 ? (
                            <div className="space-y-3">
                                {estudiantesTop.map((item, i) => (
                                    <RankingItem
                                        key={`e-${i}`}
                                        posicion={i}
                                        nombre={item.nombre_estudiante}
                                        total={item.total}
                                        unidad="cita"
                                    />
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

            </div>

        </SeccionPanel>
    );
}
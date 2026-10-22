// resources/js/Pages/Panel/Indicadores/Secciones/SeccionTendencias.jsx
import { useState } from 'react';
import SeccionPanel from '../Componentes/SeccionPanel';
import TrendItem from '../Componentes/TrendItem';
import { mesTitulo, formatHora12 } from '../helpers';

export default function SeccionTendencias({
    citasPorMes,
    citasPorDiaSemana,
    citasPorHora,
    periodoTexto,
    contextoGradoGrupo,
    contextoSingular,
    contextoTexto,
    filtroSemana,
}) {
    // Estado para controlar la pestaña activa
    const [activeTab, setActiveTab] = useState('mes');

    const tabs = [
        { id: 'mes', label: 'Por Mes' },
        { id: 'dia', label: 'Por Día' },
        { id: 'hora', label: 'Por Hora' }
    ];

    return (
        <SeccionPanel titulo={`Tendencias de citas de ${periodoTexto}${contextoGradoGrupo}`}>
            
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
                
                {/* Pestaña: Por Mes */}
                {activeTab === 'mes' && (
                    <div className="animate-fadeIn">
                        {citasPorMes.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {citasPorMes.map(item => (
                                    <TrendItem
                                        key={`m-${item.mes}`}
                                        titulo={mesTitulo(item.mes)}
                                        descripcion={`${item.total} ${item.total === 1 ? 'cita registrada' : 'citas registradas'}`}
                                        total={item.total}
                                    />
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

                {/* Pestaña: Por Día de la semana */}
                {activeTab === 'dia' && (
                    <div className="animate-fadeIn">
                        {Object.keys(citasPorDiaSemana).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {Object.entries(citasPorDiaSemana).map(([dia, total]) => {
                                    const plural = total === 1 ? 'cita' : 'citas';
                                    const diaLower = dia.toLowerCase();
                                    const descripcion = filtroSemana
                                        ? `${total} ${plural} el ${diaLower} ${contextoSingular}`
                                        : `${total} ${plural} los ${diaLower} ${contextoSingular}`;
                                    return (
                                        <TrendItem
                                            key={`d-${dia}`}
                                            titulo={dia}
                                            descripcion={descripcion}
                                            total={total}
                                        />
                                    );
                                })}
                            </div>
                        ) : <p className="text-gray-500 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

                {/* Pestaña: Por Hora del día */}
                {activeTab === 'hora' && (
                    <div className="animate-fadeIn">
                        {Object.keys(citasPorHora).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Object.entries(citasPorHora).map(([hora, total]) => {
                                    const plural = total === 1 ? 'cita' : 'citas';
                                    const descripcion = `${total} ${plural} a las ${formatHora12(hora)} ${contextoTexto}`;
                                    return (
                                        <TrendItem
                                            key={`h-${hora}`}
                                            titulo={formatHora12(hora)}
                                            descripcion={descripcion}
                                            total={total}
                                        />
                                    );
                                })}
                            </div>
                        ) : <p className="text-gray-500 text-sm py-4">No hay datos para este periodo.</p>}
                    </div>
                )}

            </div>

        </SeccionPanel>
    );
}
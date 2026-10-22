// resources/js/Pages/Panel/Indicadores/Componentes/ComparativaCard.jsx

export default function ComparativaCard({ titulo, labelActual, labelAnterior, actual, anterior, diff, pct, claseDiff }) {
    // Determinamos si es positivo, negativo o neutro
    const esPositivo = diff > 0;
    const esNegativo = diff < 0;
    const esNeutro = diff === 0;

    // Colores para la píldora del footer
    const pillColor = esPositivo 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : esNegativo 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-base font-bold text-gray-800">{titulo}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Cantidad de citas registradas en cada periodo</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
                {/* Recuadro Periodo Actual (Destacado) */}
                <div className="bg-[#FF5900]/5 border border-[#FF5900]/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#FF5900]"></div>
                    <div className="text-sm font-medium text-[#CC4700] mb-1 text-center leading-tight">{labelActual}</div>
                    <div className="text-4xl font-extrabold text-[#FF5900]">{actual}</div>
                    <div className="text-xs text-[#CC4700]/70 mt-1">citas</div>
                </div>
                
                {/* Recuadro Periodo Anterior (Neutro) */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="text-sm font-medium text-gray-500 mb-1 text-center leading-tight">{labelAnterior}</div>
                    <div className="text-4xl font-extrabold text-gray-500">{anterior}</div>
                    <div className="text-xs text-gray-400 mt-1">citas</div>
                </div>
            </div>

            {/* Footer con la diferencia y flecha */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <span className="text-sm font-medium text-gray-500">
                    Diferencia
                </span>
                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-sm ${pillColor}`}>
                    {/* Flechas SVG */}
                    {esPositivo && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    )}
                    {esNegativo && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    )}
                    {esNeutro && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                        </svg>
                    )}
                    
                    <span>
                        {diff > 0 ? '+' : ''}{diff} ({pct > 0 ? '+' : ''}{pct}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
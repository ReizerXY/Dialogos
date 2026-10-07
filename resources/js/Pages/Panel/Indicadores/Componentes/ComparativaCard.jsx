// resources/js/Pages/Panel/Indicadores/Componentes/ComparativaCard.jsx

// Tarjeta comparativa entre dos periodos
export default function ComparativaCard({ titulo, labelActual, labelAnterior, actual, anterior, diff, pct, claseDiff }) {
    return (
        <div className="border border-gray-100 rounded-xl p-5 bg-white">
            <div className="mb-1">
                <h3 className="text-base font-semibold text-gray-800">{titulo}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Cantidad de citas registradas en cada periodo</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1.5">{labelActual}</div>
                    <div className="text-3xl font-bold text-[#FF5900]">{actual}</div>
                    <div className="text-xs text-gray-400 mt-1">citas registradas</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1.5">{labelAnterior}</div>
                    <div className="text-3xl font-bold text-gray-600">{anterior}</div>
                    <div className="text-xs text-gray-400 mt-1">citas registradas</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-base border-t border-gray-100 pt-3">
                <span className="text-gray-500">
                    Diferencia de citas
                </span>
                <span className={`font-bold ${claseDiff(diff)}`}>
                    {diff > 0 ? '+' : ''}{diff} ({pct > 0 ? '+' : ''}{pct}%)
                </span>
            </div>
        </div>
    );
}
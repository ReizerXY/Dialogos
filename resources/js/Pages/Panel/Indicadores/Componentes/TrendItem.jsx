// resources/js/Pages/Panel/Indicadores/Componentes/TrendItem.jsx

// Elemento de tendencia (fila con título, descripción y total)
export default function TrendItem({ titulo, descripcion, total }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-gray-800">{titulo}</div>
                <div className="text-sm text-gray-500 mt-0.5">{descripcion}</div>
            </div>
            <div className="text-2xl font-bold text-[#FF5900] shrink-0">{total}</div>
        </div>
    );
}
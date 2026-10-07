// resources/js/Pages/Panel/Indicadores/Componentes/RankingItem.jsx

// Elemento de ranking (posición + nombre + total)
export default function RankingItem({ posicion, nombre, etiqueta, total, unidad = 'cita' }) {
    const colores = ['bg-yellow-400', 'bg-gray-400', 'bg-orange-400'];
    const colorMedalla = posicion < 3 ? colores[posicion] : 'bg-gray-300';
    const plural = total === 1 ? '' : 's';

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shrink-0 ${colorMedalla}`}>
                    {posicion + 1}
                </span>
                <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-800 truncate">{nombre}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{etiqueta}</div>
                </div>
            </div>
            <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-2xl font-bold text-[#FF5900]">{total}</span>
                <span className="text-sm text-gray-500">{unidad}{plural}</span>
            </div>
        </div>
    );
}
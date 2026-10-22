// resources/js/Pages/Panel/Indicadores/Componentes/RankingItem.jsx

export default function RankingItem({ posicion, nombre, total, unidad = 'cita' }) {
    // Definimos el color según la posición
    const getMedallaColor = (pos) => {
        if (pos === 0) return 'bg-yellow-400 text-white shadow-md shadow-yellow-400/30'; // Oro
        if (pos === 1) return 'bg-slate-300 text-slate-800'; // Plata
        if (pos === 2) return 'bg-amber-600 text-white'; // Bronce
        return 'bg-white border border-gray-200 text-gray-400'; // Resto
    };

    const plural = total === 1 ? '' : 's';

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-[#FF5900]/30 transition-all duration-200 flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Círculo de la posición */}
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 ${getMedallaColor(posicion)}`}>
                    {posicion + 1}
                </span>
                {/* Nombre con mejor tipografía */}
                <div className="text-base font-bold text-gray-800 truncate group-hover:text-[#FF5900] transition-colors">
                    {nombre}
                </div>
            </div>
            <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-3xl font-extrabold text-[#FF5900] leading-none">{total}</span>
                <span className="text-sm text-gray-500 font-medium">{unidad}{plural}</span>
            </div>
        </div>
    );
}
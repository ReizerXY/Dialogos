// resources/js/Pages/Panel/Indicadores/Componentes/MiniStat.jsx

// Mini estadística dentro de una tarjeta expandible
export default function MiniStat({ label, value, accent = 'gray' }) {
    const accents = { gray: 'text-gray-700', green: 'text-green-600', yellow: 'text-yellow-600', red: 'text-red-600', orange: 'text-[#FF5900]' };
    return (
        <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-center">
            <div className={`text-xl font-bold ${accents[accent]}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1 leading-tight uppercase tracking-wide">{label}</div>
        </div>
    );
}
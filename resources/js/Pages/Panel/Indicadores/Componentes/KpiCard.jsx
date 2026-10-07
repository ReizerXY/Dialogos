// resources/js/Pages/Panel/Indicadores/Componentes/KpiCard.jsx

// Tarjeta de KPI
export default function KpiCard({ value, titulo, subtitulo, accent = 'orange' }) {
    const accents = { orange: 'text-[#FF5900]', blue: 'text-blue-600', green: 'text-green-600', red: 'text-red-600' };
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center hover:shadow-lg transition-shadow">
            <div className={`text-3xl font-bold ${accents[accent]}`}>{value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1.5 leading-tight">{titulo}</div>
            {subtitulo && <div className="text-xs text-gray-400 mt-1 leading-tight">{subtitulo}</div>}
        </div>
    );
}
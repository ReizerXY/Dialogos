// resources/js/Pages/Panel/Indicadores/Componentes/MiniStat.jsx

export default function MiniStat({ label, value, accent = 'gray' }) {
    // Mapeo de colores para darle un toque sutil a cada tarjeta
    const accentColors = {
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        yellow: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-rose-50 text-rose-700 border-rose-100',
        orange: 'bg-[#FF5900]/10 text-[#CC4700] border-[#FF5900]/20',
        gray: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    const style = accentColors[accent] || accentColors.gray;

    return (
        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center ${style}`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1 text-center leading-tight">
                {label}
            </span>
            <span className="text-2xl font-extrabold">
                {value}
            </span>
        </div>
    );
}
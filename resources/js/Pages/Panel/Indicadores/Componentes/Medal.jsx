// resources/js/Pages/Panel/Indicadores/Componentes/Medal.jsx

// Medalla de posición en un ranking
export default function Medal({ position }) {
    const colors = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-300'];
    const color = position < 3 ? colors[position] : 'bg-gray-200';
    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold text-white shrink-0 ${color}`}>
            {position + 1}
        </span>
    );
}
// resources/js/Pages/Panel/Indicadores/Componentes/SubDesplegable.jsx

// Sub-desplegable dentro de una sección
export default function SubDesplegable({ titulo, abierta, onToggle, children }) {
    return (
        <div className="border border-gray-100 rounded-xl mb-3 overflow-hidden bg-gray-50/40">
            <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/60 transition text-left">
                <span className="text-base font-medium text-gray-700">{titulo}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${abierta ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${abierta ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-4 pb-4 pt-1">{children}</div>
            </div>
        </div>
    );
}
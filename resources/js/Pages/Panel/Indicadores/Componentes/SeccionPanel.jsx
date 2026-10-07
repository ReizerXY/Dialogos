// resources/js/Pages/Panel/Indicadores/Componentes/SeccionPanel.jsx

// Panel contenedor de la sección activa
export default function SeccionPanel({ titulo, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                    {titulo}
                </h2>
            </div>
            <div className="px-6 pt-6 pb-6">{children}</div>
        </div>
    );
}
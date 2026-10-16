// resources/js/Pages/Panel/Indicadores/Componentes/SeccionPanel.jsx

// Panel contenedor de la sección activa
export default function SeccionPanel({ titulo, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                    {titulo}
                </h2>
                <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
            </div>
            <div className="px-6 pt-6 pb-6">{children}</div>
        </div>
    );
}
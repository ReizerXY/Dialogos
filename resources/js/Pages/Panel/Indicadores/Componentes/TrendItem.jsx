// resources/js/Pages/Panel/Indicadores/Componentes/TrendItem.jsx

export default function TrendItem({ titulo, descripcion, total }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-[#FF5900]/30 transition-all duration-200 group h-full">
            <div>
                {/* Título más grande, sin mayúsculas y más oscuro */}
                <p className="text-base font-bold text-gray-800 group-hover:text-[#FF5900] transition-colors capitalize">
                    {titulo}
                </p>
                {/* Descripción más grande y legible */}
                {descripcion && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {descripcion}
                    </p>
                )}
            </div>
            <div className="mt-4 flex justify-end items-end">
                <span className="text-4xl font-extrabold text-[#FF5900] leading-none">
                    {total}
                </span>
            </div>
        </div>
    );
}
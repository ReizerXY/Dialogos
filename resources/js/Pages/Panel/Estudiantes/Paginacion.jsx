// resources/js/Pages/Panel/Estudiantes/Paginacion.jsx
import { memo } from 'react';
import { OPCIONES_POR_PAGINA } from './helpers';

// Paginación reutilizable (arriba y abajo de la tabla)
const Paginacion = memo(function Paginacion({
    paginaActual, totalPaginas, porPagina, totalItems,
    inicio, fin,
    onCambiarPagina, onCambiarPorPagina,
    mostrarSelectorPorPagina = true,
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                    Mostrando <strong className="text-gray-700">{inicio}</strong>–<strong className="text-gray-700">{fin}</strong> de{' '}
                    <strong className="text-gray-700">{totalItems}</strong>
                </span>
                {mostrarSelectorPorPagina && (
                    <div className="flex items-center gap-2 ml-2">
                        <label className="text-xs text-gray-500">Por página:</label>
                        <select
                            value={porPagina}
                            onChange={(e) => onCambiarPorPagina(Number(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50"
                        >
                            {OPCIONES_POR_PAGINA.map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onCambiarPagina(1)}
                    disabled={paginaActual === 1}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Primera página"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={() => onCambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Anterior"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <span className="px-3 py-1 text-sm text-gray-700 font-medium">
                    Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
                </span>

                <button
                    onClick={() => onCambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Siguiente"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <button
                    onClick={() => onCambiarPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Última página"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
});

export default Paginacion;
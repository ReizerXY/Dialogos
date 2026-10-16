// resources/js/Components/Paginacion.jsx
import { useMemo } from 'react';

// Control de paginación reutilizable.
// Se oculta solo cuando hay una sola página.
export default function Paginacion({
    paginaActual,
    totalPaginas,
    totalRegistros,
    porPagina,
    onChange,
    className = '',
    etiqueta = 'registros',
    // Opcionales
    mostrarSelectorPorPagina = false,
    onCambiarPorPagina,
    opcionesPorPagina = [15, 25, 50, 100, 200],
    mostrarPrimeraUltima = false,
}) {
    if (totalPaginas <= 1 && !mostrarSelectorPorPagina) return null;

    const inicio = (paginaActual - 1) * porPagina + 1;
    const fin = Math.min(paginaActual * porPagina, totalRegistros);

    const paginas = useMemo(() => {
        if (totalPaginas <= 1) return [];

        const out = [];
        const maxVisible = 5;

        if (totalPaginas <= 7) {
            for (let i = 1; i <= totalPaginas; i++) out.push(i);
            return out;
        }

        out.push(1);
        let start = Math.max(2, paginaActual - 1);
        let end = Math.min(totalPaginas - 1, paginaActual + 1);

        if (paginaActual <= 3) { start = 2; end = Math.min(totalPaginas - 1, maxVisible); }
        if (paginaActual >= totalPaginas - 2) { start = Math.max(2, totalPaginas - maxVisible + 1); end = totalPaginas - 1; }

        if (start > 2) out.push('...');
        for (let i = start; i <= end; i++) out.push(i);
        if (end < totalPaginas - 1) out.push('...');
        out.push(totalPaginas);

        return out;
    }, [paginaActual, totalPaginas]);

    const btnBase = 'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center';

    return (
        <div className={`bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3 ${className}`}>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <p>
                    Mostrando <strong className="text-gray-800">{inicio}–{fin}</strong> de{' '}
                    <strong className="text-gray-800">{totalRegistros}</strong> {etiqueta}
                </p>

                {mostrarSelectorPorPagina && onCambiarPorPagina && (
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Por página:</label>
                        <select
                            value={porPagina}
                            onChange={(e) => onCambiarPorPagina(Number(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                        >
                            {opcionesPorPagina.map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {totalPaginas > 1 && (
                <div className="flex items-center gap-1">
                    {mostrarPrimeraUltima && (
                        <button
                            type="button"
                            onClick={() => onChange(1)}
                            disabled={paginaActual === 1}
                            className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Primera página"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onChange(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                        className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
                        title="Página anterior"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {paginas.map((p, i) => {
                        if (p === '...') {
                            return (
                                <span key={`dots-${i}`} className="min-w-[24px] text-center text-gray-400 text-sm">
                                    …
                                </span>
                            );
                        }
                        const activo = p === paginaActual;
                        return (
                            <button
                                key={`p-${p}`}
                                type="button"
                                onClick={() => onChange(p)}
                                className={`${btnBase} ${
                                    activo
                                        ? 'bg-[#FF5900] text-white border border-[#FF5900] shadow-sm'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => onChange(Math.min(totalPaginas, paginaActual + 1))}
                        disabled={paginaActual === totalPaginas}
                        className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
                        title="Página siguiente"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {mostrarPrimeraUltima && (
                        <button
                            type="button"
                            onClick={() => onChange(totalPaginas)}
                            disabled={paginaActual === totalPaginas}
                            className={`${btnBase} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Última página"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
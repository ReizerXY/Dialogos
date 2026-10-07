// resources/js/Pages/Panel/Indicadores/BannerSinDatos.jsx

// Banner de "sin datos" cuando el filtro no encuentra
export default function BannerSinDatos({ hayFiltros, descripcionFiltros, periodoTexto, onLimpiarFiltros }) {
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-yellow-800">
                    No hay citas para generar información
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                    {hayFiltros ? (
                        <>Con los filtros aplicados (<strong>{descripcionFiltros}</strong>) no se encontraron citas registradas en el sistema.</>
                    ) : (
                        <>Durante <strong>{periodoTexto}</strong> no se encontraron citas registradas en el sistema.</>
                    )}
                    {' '}Por eso los indicadores se muestran como <strong>—</strong> en lugar de mostrar números: no hay datos que analizar en este periodo.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                        onClick={onLimpiarFiltros}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-xl hover:bg-yellow-700 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Limpiar filtros y ver todo
                    </button>
                    <span className="text-xs text-yellow-700">
                        ¿Esperabas ver datos aquí? Revisa que el periodo y los filtros sean correctos.
                    </span>
                </div>
            </div>
        </div>
    );
}
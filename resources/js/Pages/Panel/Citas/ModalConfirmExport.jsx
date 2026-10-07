// resources/js/Pages/Panel/Citas/ModalConfirmExport.jsx

// Modal de confirmación de descarga de Excel (solo Coordinador)
export default function ModalConfirmExport({
    isOpen,
    onClose,
    haySeleccion,
    selectedIds,
    totalADescargar,
    resumenFiltros,
    ordenExport,
    setOrdenExport,
    onConfirmar,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Confirmar descarga</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Se descargará un archivo Excel (.xlsx)</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            aria-label="Cerrar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {haySeleccion ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Descarga por selección manual
                                    </p>
                                    <p className="text-sm text-green-700 mt-1">
                                        Se descargarán <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'cita' : 'citas'} que marcaste con el checkbox.
                                        Los filtros <strong>no se aplican</strong> en este modo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-700">
                                Se descargarán <strong className="text-[#FF5900]">{totalADescargar}</strong> {totalADescargar === 1 ? 'cita' : 'citas'} con {resumenFiltros.length === 0 ? 'todos los datos del sistema' : 'los siguientes filtros'}:
                            </p>

                            {resumenFiltros.length > 0 && (
                                <ul className="mt-3 space-y-1.5">
                                    {resumenFiltros.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5900]"></span>
                                            <span className="text-gray-500">{f.label}:</span>
                                            <span className="font-medium text-gray-800">{f.valor}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {resumenFiltros.length === 0 && (
                                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                                    ⚠️ No hay filtros aplicados. Se incluirán <strong>todas las citas registradas</strong>.
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ordenar las citas en el Excel por:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setOrdenExport('fecha')}
                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                                    ordenExport === 'fecha'
                                        ? 'bg-[#FF5900] border-[#FF5900] text-white shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Por fecha
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrdenExport('id')}
                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                                    ordenExport === 'id'
                                        ? 'bg-[#FF5900] border-[#FF5900] text-white shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                                Por ID de cita
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {ordenExport === 'fecha'
                                ? 'Más antigua primero (fecha → hora → ID)'
                                : 'Número de cita ascendente (1, 2, 3, …)'}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmar}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/25 transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Sí, descargar Excel
                    </button>
                </div>
            </div>
        </div>
    );
}
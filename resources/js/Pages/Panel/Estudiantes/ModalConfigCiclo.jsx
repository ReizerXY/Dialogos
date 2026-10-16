// resources/js/Pages/Panel/Estudiantes/ModalConfigCiclo.jsx

export default function ModalConfigCiclo({
    isOpen,
    onClose,
    inicioCiclo, setInicioCiclo,
    importacionManual, setImportacionManual,
    previewMostrar,
    config,
    guardandoConfig,
    onGuardar,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 leading-tight">Actualizar lista de estudiantes</h3>
                        <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                        aria-label="Cerrar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Fecha de inicio del ciclo
                        </label>
                        <input
                            type="date"
                            value={inicioCiclo || ''}
                            onChange={(e) => setInicioCiclo(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            A partir de esta fecha, el sistema mostrará un aviso al Coordinador para que suba la lista de estudiantes actualizada. El aviso se oculta automáticamente al completar la importación.
                        </p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition border border-gray-100">
                        <input
                            type="checkbox"
                            checked={importacionManual}
                            onChange={(e) => setImportacionManual(e.target.checked)}
                            className="w-4 h-4 mt-0.5 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900]"
                        />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">Mostrar el formulario de importación ahora</div>
                            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Úsalo solo si necesitas subir la lista fuera de la fecha programada (por ejemplo, cuando llegan estudiantes nuevos a mitad del ciclo). Desactívalo cuando termines.
                            </div>
                        </div>
                    </label>

                    <div className={`rounded-xl p-3.5 flex items-start gap-2.5 text-sm border ${
                        previewMostrar
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                        {previewMostrar ? (
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        )}
                        <span>
                            <strong>Estado actual:</strong> el formulario de importación{' '}
                            <strong>{previewMostrar ? 'estará visible' : 'estará oculto'}</strong>{' '}
                            en la página de Estudiantes.
                        </span>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={guardandoConfig}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onGuardar}
                        disabled={guardandoConfig}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {guardandoConfig ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : (
                            'Guardar y aplicar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
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
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Configurar ciclo escolar</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Fecha de inicio del ciclo escolar
                        </label>
                        <input
                            type="date"
                            value={inicioCiclo || ''}
                            onChange={(e) => setInicioCiclo(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Esta fecha determina cuándo se activa el aviso de "Actualización pendiente" en el menú lateral. Una vez que se importe el archivo de estudiantes, el aviso se ocultará automáticamente.
                        </p>
                    </div>

                    <div>
                        <label className="flex items-start gap-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition">
                            <input
                                type="checkbox"
                                checked={importacionManual}
                                onChange={(e) => setImportacionManual(e.target.checked)}
                                className="w-4 h-4 mt-0.5 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900]"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">Forzar mostrar importación</div>
                                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    Actívalo si necesitas importar estudiantes fuera del periodo habitual. Recuerda desactivarlo cuando termines.
                                </div>
                            </div>
                        </label>
                    </div>

                    <div className={`rounded-xl p-3 flex items-start gap-2 text-sm border ${
                        previewMostrar
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                        {previewMostrar ? (
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        )}
                        <span>
                            Con esta configuración, el bloque de importación <strong>{previewMostrar ? 'se mostrará' : 'no se mostrará'}</strong> en la página.
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onGuardar}
                        disabled={guardandoConfig}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
                    >
                        {guardandoConfig ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
}
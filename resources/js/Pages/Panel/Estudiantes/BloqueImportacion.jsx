// resources/js/Pages/Panel/Estudiantes/BloqueImportacion.jsx
import { formatFecha } from './helpers';

// Bloque condicional de actualización de estudiantes (solo visible en la ventana del ciclo escolar)
export default function BloqueImportacion({
    abierto, setAbierto,
    archivo, cargando, inputFileRef,
    onFileChange, onImport,
    config,
    totalEstudiantes,
    onEliminarTodos,
}) {
    return (
        <div className="bg-white rounded-2xl shadow-md border-2 border-amber-200 mb-6 overflow-hidden">
            <button
                onClick={() => setAbierto(!abierto)}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-amber-50/50 transition text-left"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-base font-semibold text-gray-800">Actualización de estudiantes</span>
                        <span className="ml-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
                            ⚠️ Realizar al inicio del ciclo
                        </span>
                    </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${abierto ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className={`transition-all duration-300 ease-in-out ${abierto ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 pb-6 border-t border-amber-100 bg-amber-50/30">
                    <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 mb-4 mt-4 flex items-start gap-3">
                        <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold text-amber-900">
                                Es momento de actualizar la lista de estudiantes
                            </p>
                            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                                Importa el archivo con los datos del ciclo actual. Las filas con ID existente se
                                <strong> actualizarán</strong> y las nuevas se <strong>insertarán</strong>.
                                {config?.inicio_ciclo_escolar && (
                                    <> Ciclo escolar configurado: <strong>{formatFecha(config.inicio_ciclo_escolar)}</strong>.</>
                                )}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={onImport} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Archivo (.xlsx, .xls, .csv, .txt)
                            </label>
                            <input
                                ref={inputFileRef}
                                type="file"
                                accept=".xlsx,.xls,.csv,.txt,.tsv"
                                onChange={onFileChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={cargando || !archivo}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {cargando ? 'Importando...' : 'Importar'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 mt-3">
                        Columnas esperadas: <strong>ID, Nombre, Apellido paterno, Apellido materno, Grado, Grupo, Contacto, Contacto de emergencia</strong>.
                    </p>

                    <div className="mt-5 pt-5 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-gray-600 max-w-md leading-relaxed">
                            <strong className="text-red-700">Zona de riesgo.</strong> Elimina toda la lista de estudiantes antes de importar el archivo nuevo. Sus citas históricas se conservarán.
                        </div>
                        <button
                            onClick={onEliminarTodos}
                            disabled={totalEstudiantes === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar lista de alumnos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
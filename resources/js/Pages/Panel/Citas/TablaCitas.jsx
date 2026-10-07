// resources/js/Pages/Panel/Citas/TablaCitas.jsx
import { CLASIFICACION_COLOR, formatFecha } from './helpers';

// Tabla reutilizable de citas (sirve para la principal y para "Citas por atender")
export default function TablaCitas({
    titulo,
    subtitulo,
    citas,
    selectedIds,
    setSelectedIds,
    esCoordinador,
    mostrarAcciones,
    mostrarFiltroFormador,
    user,
    onNotas,
    onModificar,
    onCancelar,
    colorTitulo = 'bg-[#FF5900]',
}) {
    const idsVisibles = citas.map(c => c.id_cita);
    const allVisibleSelected = idsVisibles.length > 0 && idsVisibles.every(id => selectedIds.includes(id));
    const someVisibleSelected = !allVisibleSelected && idsVisibles.some(id => selectedIds.includes(id));

    // Marca / desmarca todas las filas de esta tabla
    const toggleAllLocal = () => {
        if (allVisibleSelected) {
            setSelectedIds(prev => prev.filter(id => !idsVisibles.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...idsVisibles])]);
        }
    };

    // Si no hay citas, la tabla no se muestra
    if (citas.length === 0) return null;

    const haySeleccion = selectedIds.filter(id => idsVisibles.includes(id)).length > 0;

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
            {/* Cabecera con título y contador */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className={`w-1 h-6 ${colorTitulo} rounded-full`}></span>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
                        {subtitulo && <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>}
                    </div>
                </div>
                <span className="text-sm text-gray-500">
                    {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                            {esCoordinador && (
                                <th className="px-4 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        ref={el => { if (el) el.indeterminate = someVisibleSelected; }}
                                        onChange={toggleAllLocal}
                                        className="w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900] cursor-pointer"
                                        title={allVisibleSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                    />
                                </th>
                            )}
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estudiante</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Formador</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora</th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Clasificación</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asistencia</th>
                            {mostrarAcciones && (
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {citas.map(c => {
                            const estaSeleccionada = selectedIds.includes(c.id_cita);
                            return (
                                <tr
                                    key={c.id_cita}
                                    className={`transition-colors duration-150 group ${
                                        estaSeleccionada ? 'bg-[#FF5900]/5' : 'hover:bg-[#FF5900]/5'
                                    }`}
                                >
                                    {esCoordinador && (
                                        <td className="px-4 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={estaSeleccionada}
                                                onChange={() => {
                                                    setSelectedIds(prev =>
                                                        prev.includes(c.id_cita)
                                                            ? prev.filter(x => x !== c.id_cita)
                                                            : [...prev, c.id_cita]
                                                    );
                                                }}
                                                className="w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900] cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{c.nombre_estudiante}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {mostrarFiltroFormador ? (
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${c.id_usuario === user?.id_usuario ? 'bg-[#FF5900]' : 'bg-gray-300'}`}></div>
                                                <span className={c.id_usuario === user?.id_usuario ? 'font-medium text-[#FF5900]' : ''}>
                                                    {c.nombre_formador}
                                                    {c.id_usuario === user?.id_usuario && ' (tú)'}
                                                </span>
                                            </div>
                                        ) : (
                                            c.nombre_formador
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatFecha(c.fecha)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{c.hora?.substring(0, 5) || c.hora}</td>

                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        {c.clasificacion ? (
                                            <div
                                                className={`inline-block w-7 h-7 rounded-lg ${CLASIFICACION_COLOR[c.clasificacion] || 'bg-gray-400'} shadow-sm`}
                                                title={c.clasificacion}
                                                aria-label={`Clasificación: ${c.clasificacion}`}
                                            />
                                        ) : (
                                            <div className="inline-block w-7 h-7 rounded-lg bg-gray-100 border border-gray-200" title="Sin clasificar" aria-label="Sin clasificar" />
                                        )}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                            c.estado === 'programada' ? 'bg-yellow-100 text-yellow-800' :
                                            c.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                            c.estado === 'cancelada_liberada' ? 'bg-orange-100 text-orange-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {c.estado === 'cancelada_liberada' ? 'Cancelada (liberada)' : c.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                            c.asistencia === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                                            c.asistencia === 'asistió' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {c.asistencia || 'pendiente'}
                                        </span>
                                    </td>
                                    {mostrarAcciones && (
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1.5">
                                                <button
                                                    onClick={() => onNotas(c)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    Notas
                                                </button>
                                                <button
                                                    onClick={() => onModificar(c)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-[#FF5900] text-white text-xs font-medium rounded-lg hover:bg-[#CC4700] transition-all duration-200 hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Modificar
                                                </button>
                                                <button
                                                    onClick={() => onCancelar(c)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Cancelar
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {haySeleccion && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-sm text-green-700 font-medium">
                    {selectedIds.filter(id => idsVisibles.includes(id)).length} seleccionada{selectedIds.filter(id => idsVisibles.includes(id)).length === 1 ? '' : 's'} para exportar
                </div>
            )}
        </div>
    );
}
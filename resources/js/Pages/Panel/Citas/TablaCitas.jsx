// resources/js/Pages/Panel/Citas/TablaCitas.jsx
import { useState, useEffect } from 'react';
import {
    ESTADO_LABELS,
    ASISTENCIA_LABELS,
    formatFecha,
    etiquetaFechaRelativa,
} from './helpers';
import ClasificacionDot from '@/Components/ClasificacionDot';

// Estados en los que la cita ya no admite modificacion ni cancelacion
const ESTADOS_CERRADOS = ['completada', 'cancelada', 'cancelada_liberada'];

// Detecta si la cita ya no puede modificarse ni cancelarse
function esCitaCerrada(estado) {
    return ESTADOS_CERRADOS.includes(estado);
}

// Detecta movil
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

// Colores de la etiqueta relativa de fecha
function clasesRelativa(tipo) {
    if (tipo === 'hoy')     return 'bg-[#FF5900]/10 text-[#CC4700] border-[#FF5900]/30';
    if (tipo === 'manana')  return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tipo === 'futuro')  return 'bg-blue-50 text-blue-700 border-blue-200';
    if (tipo === 'pasado')  return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
}

function clasesEstado(estado) {
    if (estado === 'programada')          return 'bg-yellow-100 text-yellow-800';
    if (estado === 'cancelada')           return 'bg-red-100 text-red-800';
    if (estado === 'cancelada_liberada')  return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
}

function clasesAsistencia(asistencia) {
    if (asistencia === 'asistió')     return 'bg-green-100 text-green-800';
    if (asistencia === 'no asistió')  return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
}

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
    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const idsVisibles = citas.map(c => c.id_cita);
    const allVisibleSelected = idsVisibles.length > 0 && idsVisibles.every(id => selectedIds.includes(id));
    const someVisibleSelected = !allVisibleSelected && idsVisibles.some(id => selectedIds.includes(id));

    const toggleAllLocal = () => {
        if (allVisibleSelected) {
            setSelectedIds(prev => prev.filter(id => !idsVisibles.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...idsVisibles])]);
        }
    };

    if (citas.length === 0) return null;

    const haySeleccion = selectedIds.filter(id => idsVisibles.includes(id)).length > 0;
    const totalSeleccionadas = selectedIds.filter(id => idsVisibles.includes(id)).length;

    const toggleFila = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
            {/* Cabecera con título y contador */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className={`w-1 h-6 ${colorTitulo} rounded-full`}></span>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
                        {subtitulo && <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>}
                    </div>
                </div>
                <span className="text-sm text-gray-500">
                    <strong className="text-gray-800">{citas.length}</strong>{' '}
                    {citas.length === 1 ? 'cita encontrada' : 'citas encontradas'}
                </span>
            </div>

            {/* ─── Móvil: cards ─── */}
            {esMovil && (
                <div className="divide-y divide-gray-100">
                    {esCoordinador && (
                        <div className={`px-4 py-3 flex items-center gap-3 border-b border-gray-100 ${haySeleccion ? 'bg-[#FF5900]/5' : 'bg-gray-50'}`}>
                            <input
                                type="checkbox"
                                checked={allVisibleSelected}
                                ref={el => { if (el) el.indeterminate = someVisibleSelected; }}
                                onChange={toggleAllLocal}
                                className="w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900] cursor-pointer"
                            />
                            <span className="text-xs font-medium text-gray-600">
                                {allVisibleSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </span>
                        </div>
                    )}

                    {citas.map(c => {
                        const estaSeleccionada = selectedIds.includes(c.id_cita);
                        const relativa = etiquetaFechaRelativa(c.fecha);
                        const cerrada = esCitaCerrada(c.estado);
                        return (
                            <div
                                key={c.id_cita}
                                className={`px-4 py-4 transition-colors ${estaSeleccionada ? 'bg-[#FF5900]/5' : ''}`}
                            >
                                {/* Fila 1: checkbox + estudiante */}
                                <div className="flex items-start gap-3 mb-3">
                                    {esCoordinador && (
                                        <input
                                            type="checkbox"
                                            checked={estaSeleccionada}
                                            onChange={() => toggleFila(c.id_cita)}
                                            className="mt-0.5 w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900] cursor-pointer flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 leading-snug">{c.nombre_estudiante}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            <span className="text-xs text-gray-600">
                                                {formatFecha(c.fecha)} · {c.hora?.substring(0, 5) || c.hora}
                                            </span>
                                            {relativa && (
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${clasesRelativa(relativa.tipo)}`}>
                                                    {relativa.texto}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Fila 2: formador */}
                                <div className="ml-0 mb-3 text-xs text-gray-600">
                                    <span className="text-gray-500">Formador:</span>{' '}
                                    <span className="font-medium text-gray-800">{c.nombre_formador}</span>
                                    {mostrarFiltroFormador && c.id_usuario === user?.id_usuario && (
                                        <span className="ml-1 text-[#FF5900] font-semibold">(tú)</span>
                                    )}
                                </div>

                                {/* Fila 3: chips de estado/asistencia y color de clasificación */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <ClasificacionDot clasificacion={c.clasificacion} size="md" />
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${clasesEstado(c.estado)}`}>
                                        {ESTADO_LABELS[c.estado] || c.estado}
                                    </span>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${clasesAsistencia(c.asistencia)}`}>
                                        {ASISTENCIA_LABELS[c.asistencia] || c.asistencia || 'pendiente'}
                                    </span>
                                </div>

                                {/* Fila 4: acciones */}
                                {mostrarAcciones && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {/* Notas: siempre disponible */}
                                        <button
                                            onClick={() => onNotas(c)}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition active:scale-95"
                                        >
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            {cerrada ? 'Ver / editar notas' : 'Notas'}
                                        </button>

                                        {/* Modificar: solo si NO está cerrada */}
                                        {!cerrada && (
                                            <button
                                                onClick={() => onModificar(c)}
                                                className="inline-flex items-center px-3 py-1.5 bg-[#FF5900] text-white text-xs font-medium rounded-lg hover:bg-[#CC4700] transition active:scale-95"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Modificar
                                            </button>
                                        )}

                                        {/* Cancelar: solo si NO está cerrada */}
                                        {!cerrada && (
                                            <button
                                                onClick={() => onCancelar(c)}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition active:scale-95"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Desktop: tabla ─── */}
            {!esMovil && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className={`${haySeleccion ? 'bg-[#FF5900]/5' : 'bg-white'}`}>
                                {esCoordinador && (
                                    <th className="px-4 py-4 w-10 border-b border-gray-200">
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
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Estudiante</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Formador</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Fecha</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Hora</th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Clasificación</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Estado</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Asistencia</th>
                                {mostrarAcciones && (
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {citas.map(c => {
                                const estaSeleccionada = selectedIds.includes(c.id_cita);
                                const relativa = etiquetaFechaRelativa(c.fecha);
                                const cerrada = esCitaCerrada(c.estado);
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
                                                    onChange={() => toggleFila(c.id_cita)}
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
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-700">{formatFecha(c.fecha)}</span>
                                                {relativa && (
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${clasesRelativa(relativa.tipo)}`}>
                                                        {relativa.texto}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{c.hora?.substring(0, 5) || c.hora}</td>

                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <ClasificacionDot clasificacion={c.clasificacion} size="md" />
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${clasesEstado(c.estado)}`}>
                                                {ESTADO_LABELS[c.estado] || c.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${clasesAsistencia(c.asistencia)}`}>
                                                {ASISTENCIA_LABELS[c.asistencia] || c.asistencia || 'pendiente'}
                                            </span>
                                        </td>
                                        {mostrarAcciones && (
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {/* Notas: siempre disponible */}
                                                    <button
                                                        onClick={() => onNotas(c)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        Notas
                                                    </button>

                                                    {/* Modificar: solo si NO está cerrada */}
                                                    {!cerrada && (
                                                        <button
                                                            onClick={() => onModificar(c)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-[#FF5900] text-white text-xs font-medium rounded-lg hover:bg-[#CC4700] transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Modificar
                                                        </button>
                                                    )}

                                                    {/* Cancelar: solo si NO está cerrada */}
                                                    {!cerrada && (
                                                        <button
                                                            onClick={() => onCancelar(c)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {haySeleccion && (
                <div className="px-6 py-3 bg-[#FF5900]/5 border-t border-[#FF5900]/20 text-sm text-[#CC4700] font-medium">
                    {totalSeleccionadas} seleccionada{totalSeleccionadas === 1 ? '' : 's'} para exportar
                </div>
            )}
        </div>
    );
}
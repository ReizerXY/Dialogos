// resources/js/Pages/Panel/Citas.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';
const NotasModal     = lazy(() => import('./Modales/NotasModal'));
const ModificarModal = lazy(() => import('./Modales/ModificarModal'));
const CancelarModal  = lazy(() => import('./Modales/CancelarModal'));


const CLASIFICACION_COLOR = {
    'académica':     'bg-blue-500',
    'familiar':      'bg-green-500',
    'emocional':     'bg-purple-500',
    'espiritual':    'bg-pink-500',
    'institucional': 'bg-amber-500',
};

const CLASIFICACIONES = ['académica', 'familiar', 'emocional', 'espiritual', 'institucional'];

const CLASIFICACION_LABELS = {
    'académica':     'Académica',
    'familiar':      'Familiar',
    'emocional':     'Emocional',
    'espiritual':    'Espiritual',
    'institucional': 'Institucional',
};

const ESTADO_LABELS = {
    programada:         'Programada',
    cancelada:          'Cancelada',
    cancelada_liberada: 'Cancelada (liberada)',
    completada:         'Completada',
};

const ASISTENCIA_LABELS = {
    'pendiente':  'Pendiente',
    'asistió':    'Asistió',
    'no asistió': 'No asistió',
};

// Convierte fecha YYYY-MM-DD a DD-MM-YYYY
function formatFecha(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// Determina si la fecha y hora de una cita ya pasaron
function citaYaPaso(cita) {
    if (!cita?.fecha) return false;
    const hora = cita.hora ? cita.hora.substring(0, 8) : '00:00:00';
    const fechaHora = new Date(`${cita.fecha}T${hora}`);
    return !isNaN(fechaHora.getTime()) && fechaHora.getTime() < Date.now();
}

// Dropdown custom para clasificación: el botón muestra solo el color,
// el menú abierto muestra color + nombre para que se elija fácil.
function SelectClasificacionColor({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Cierra el menú al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const colorActual = value ? (CLASIFICACION_COLOR[value] || 'bg-gray-400') : null;

    return (
        <div ref={ref} className="relative">
            {/* Botón cerrado */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white flex items-center justify-between min-h-[46px]"
            >
                {colorActual ? (
                    <span
                        className={`inline-block w-7 h-7 rounded-md ${colorActual} shadow-sm`}
                        title={CLASIFICACION_LABELS[value]}
                        aria-label={value}
                    ></span>
                ) : (
                    <span className="text-sm text-gray-500">Todas las clasificaciones</span>
                )}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Menú desplegable: solo colores, con tooltip */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2">
                    <button
                        type="button"
                        onClick={() => { onChange(''); setOpen(false); }}
                        className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg hover:bg-orange-50 transition ${!value ? 'bg-orange-50' : ''}`}
                        title="Todas las clasificaciones"
                    >
                        <span className="text-xs text-gray-600">Todas</span>
                    </button>

                    <div className="flex flex-wrap gap-2 mt-1 p-2">
                        {CLASIFICACIONES.map(op => (
                            <button
                                key={op}
                                type="button"
                                onClick={() => { onChange(op); setOpen(false); }}
                                className={`w-9 h-9 rounded-lg ${CLASIFICACION_COLOR[op]} shadow-sm transition-all duration-150 hover:scale-110 ${
                                    value === op ? 'ring-2 ring-offset-2 ring-gray-700' : ''
                                }`}
                                title={CLASIFICACION_LABELS[op]}
                                aria-label={CLASIFICACION_LABELS[op]}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Tabla reutilizable de citas (sirve para la principal y para "Citas por atender")
function TablaCitas({
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

export default function Citas({
    citas,
    formadores,
    aniosDisponibles = [],
    gradosActivos = [],
    gruposPorGrado = {},
    filtros,
    rol,
    soloLectura = false,
    user
}) {
    // Estados de filtros
    const [formadorFilter, setFormadorFilter]           = useState(filtros.formador || '');
    const [estadoFilter, setEstadoFilter]               = useState(filtros.estado || '');
    const [clasificacionFilter, setClasificacionFilter] = useState(filtros.clasificacion || '');
    const [asistenciaFilter, setAsistenciaFilter]       = useState(filtros.asistencia || '');
    const [periodoFilter, setPeriodoFilter]             = useState(filtros.semana || 'actual');
    const [gradoFilter, setGradoFilter]                 = useState(filtros.grado || '');
    const [grupoFilter, setGrupoFilter]                 = useState(filtros.grupo || '');

    const [anioFilter, setAnioFilter]                 = useState(filtros.anio || '');
    const [mesFilter, setMesFilter]                   = useState(filtros.mes || '');
    const [semanaValorFilter, setSemanaValorFilter]   = useState(filtros.semana_valor || '');
    const [fechaFilter, setFechaFilter]               = useState(filtros.fecha || '');

    // Estados de UI
    const [filtrosOpen, setFiltrosOpen] = useState(false);

    const [notasModalOpen, setNotasModalOpen] = useState(false);
    const [modificarModalOpen, setModificarModalOpen] = useState(false);
    const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    // Selección de filas (solo Coordinador)
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal de confirmación de descarga
    const [confirmExportOpen, setConfirmExportOpen] = useState(false);
    const [ordenExport, setOrdenExport] = useState('fecha');

    const esFormador = rol === 'Formador';
    const esCoordinador = rol === 'Coordinador';
    const mostrarFiltroFormador = rol === 'Coordinador' || (esFormador && soloLectura);
    const mostrarAcciones = esFormador && !soloLectura;

    // Detecta cuál filtro de fecha está activo
    const fechaActiva = (() => {
        if (anioFilter) return 'anio';
        if (mesFilter) return 'mes';
        if (semanaValorFilter) return 'semana';
        if (fechaFilter) return 'fecha';
        return null;
    })();

    // Handlers de fecha (cada uno limpia los otros)
    const handleAnioChange = (valor) => {
        setAnioFilter(valor);
        if (valor) { setMesFilter(''); setSemanaValorFilter(''); setFechaFilter(''); }
    };
    const handleMesChange = (valor) => {
        setMesFilter(valor);
        if (valor) { setAnioFilter(''); setSemanaValorFilter(''); setFechaFilter(''); }
    };
    const handleSemanaChange = (valor) => {
        setSemanaValorFilter(valor);
        if (valor) { setAnioFilter(''); setMesFilter(''); setFechaFilter(''); }
    };
    const handleFechaChange = (valor) => {
        setFechaFilter(valor);
        if (valor) { setAnioFilter(''); setMesFilter(''); setSemanaValorFilter(''); }
    };

    useEffect(() => {
        if (gradoFilter && grupoFilter) {
            const disp = gruposPorGrado[gradoFilter] || [];
            if (!disp.includes(grupoFilter)) setGrupoFilter('');
        }
    }, [gradoFilter, gruposPorGrado]);

    // Limpia de la selección los ids que ya no están visibles
    useEffect(() => {
        if (!citas) return;
        const idsVisibles = new Set(citas.map(c => c.id_cita));
        setSelectedIds(prev => prev.filter(id => idsVisibles.has(id)));
    }, [citas]);

    // Divide las citas en dos grupos.
    //   · Con filtro de fecha activo → todo en una sola tabla.
    //   · Con vista rápida = "Todas" → todo en una sola tabla, sin ocultar nada.
    //   · Coordinador → una sola tabla, ocultando vencidas cerradas
    //     (completadas y canceladas), salvo que filtre por estado.
    //   · Formador sin filtro de fecha → vista semanal en dos tablas.
    const { citasProximas, citasPorAtender } = useMemo(() => {
        const hayFiltroEstado = !!filtros.estado;

        // Con filtro de fecha activo, todo va a una sola tabla
        if (fechaActiva) {
            return { citasProximas: [...(citas || [])], citasPorAtender: [] };
        }

        // Vista rápida = Todas → mostrar todo sin ocultar nada
        if (filtros.semana === 'todas') {
            return { citasProximas: [...(citas || [])], citasPorAtender: [] };
        }

        // Coordinador: una sola tabla, pero sin vencidas cerradas
        if (esCoordinador) {
            const lista = (citas || []).filter(c => {
                if (hayFiltroEstado) return true;
                if (!citaYaPaso(c)) return true;

                return !(
                    c.estado === 'cancelada' ||
                    c.estado === 'cancelada_liberada' ||
                    c.estado === 'completada'
                );
            });
            return { citasProximas: lista, citasPorAtender: [] };
        }

        // Formador sin filtro de fecha: vista semanal en dos tablas
        const proximas = [];
        const porAtender = [];

        (citas || []).forEach(c => {
            if (c.estado === 'programada' && citaYaPaso(c)) {
                porAtender.push(c);
                return;
            }

            if (!hayFiltroEstado && citaYaPaso(c)) {
                if (c.estado === 'cancelada' || c.estado === 'cancelada_liberada' || c.estado === 'completada') {
                    return;
                }
            }

            proximas.push(c);
        });

        return { citasProximas: proximas, citasPorAtender: porAtender };
    }, [citas, filtros.estado, filtros.semana, fechaActiva, esCoordinador]);

    // Aplica los filtros activos y recarga la página
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (soloLectura) params.append('todas', '1');
        if (formadorFilter) params.append('formador', formadorFilter);
        if (estadoFilter) params.append('estado', estadoFilter);
        if (clasificacionFilter) params.append('clasificacion', clasificacionFilter);
        if (asistenciaFilter) params.append('asistencia', asistenciaFilter);
        if (gradoFilter) params.append('grado', gradoFilter);
        if (grupoFilter) params.append('grupo', grupoFilter);
        if (anioFilter) params.append('anio', anioFilter);
        if (mesFilter) params.append('mes', mesFilter);
        if (semanaValorFilter) params.append('semana_valor', semanaValorFilter);
        if (fechaFilter) params.append('fecha', fechaFilter);
        if (periodoFilter) params.append('semana', periodoFilter);
        window.location.href = `/citas?${params.toString()}`;
    };

    // Limpia todos los filtros
    const clearFilters = () => {
        window.location.href = soloLectura ? '/citas?todas=1' : '/citas';
    };

    // Cuenta cuántos filtros están activos
    const filtrosActivos = [
        formadorFilter, estadoFilter, clasificacionFilter, asistenciaFilter,
        gradoFilter, grupoFilter,
        anioFilter, mesFilter, semanaValorFilter, fechaFilter,
        periodoFilter !== 'actual' ? periodoFilter : null,
    ].filter(Boolean).length;

    // Limpia la selección de filas
    const limpiarSeleccion = () => setSelectedIds([]);
    const haySeleccion = selectedIds.length > 0;

    // Resumen de filtros para el modal de descarga
    const resumenFiltros = (() => {
        const items = [];

        if (formadorFilter) {
            const f = formadores?.find(x => String(x.id_usuario) === String(formadorFilter));
            items.push({ label: 'Formador', valor: f?.nombre || `ID ${formadorFilter}` });
        }
        if (estadoFilter)        items.push({ label: 'Estado', valor: ESTADO_LABELS[estadoFilter] || estadoFilter });
        if (clasificacionFilter) items.push({ label: 'Clasificación', valor: CLASIFICACION_LABELS[clasificacionFilter] || clasificacionFilter });
        if (asistenciaFilter)    items.push({ label: 'Asistencia', valor: ASISTENCIA_LABELS[asistenciaFilter] || asistenciaFilter });
        if (gradoFilter)         items.push({ label: 'Grado', valor: gradoFilter });
        if (grupoFilter)         items.push({ label: 'Grupo', valor: grupoFilter });
        if (anioFilter)          items.push({ label: 'Año', valor: anioFilter });
        if (mesFilter)           items.push({ label: 'Mes', valor: mesFilter });
        if (semanaValorFilter)   items.push({ label: 'Semana', valor: semanaValorFilter });
        if (fechaFilter)         items.push({ label: 'Fecha específica', valor: formatFecha(fechaFilter) });

        if (!anioFilter && !mesFilter && !semanaValorFilter && !fechaFilter) {
            if (periodoFilter === 'actual') items.push({ label: 'Vista rápida', valor: 'Desde hoy hasta 7 días después' });
            else if (periodoFilter === 'todas') items.push({ label: 'Vista rápida', valor: 'Todas las fechas' });
        }

        return items;
    })();

    const totalADescargar = haySeleccion ? selectedIds.length : (citas?.length || 0);

    // Abre el modal de confirmación de descarga
    const abrirConfirmExport = () => {
        if (!citas || citas.length === 0) return;
        setConfirmExportOpen(true);
    };

    // Ejecuta la descarga de Excel
    const ejecutarDescarga = () => {
        const params = new URLSearchParams();
        params.append('orden', ordenExport);

        if (haySeleccion) {
            selectedIds.forEach(id => params.append('ids[]', id));
        } else {
            if (filtros.formador)      params.append('formador', filtros.formador);
            if (filtros.estado)        params.append('estado', filtros.estado);
            if (filtros.clasificacion) params.append('clasificacion', filtros.clasificacion);
            if (filtros.asistencia)    params.append('asistencia', filtros.asistencia);
            if (filtros.grado)         params.append('grado', filtros.grado);
            if (filtros.grupo)         params.append('grupo', filtros.grupo);
            if (filtros.anio)          params.append('anio', filtros.anio);
            if (filtros.mes)           params.append('mes', filtros.mes);
            if (filtros.semana_valor)  params.append('semana_valor', filtros.semana_valor);
            if (filtros.fecha)         params.append('fecha', filtros.fecha);
            if (filtros.semana)        params.append('semana', filtros.semana);
        }

        setConfirmExportOpen(false);
        window.location.href = `/citas/exportar-excel?${params.toString()}`;
    };

    // Abre cada modal con la cita seleccionada
    const abrirNotas = (cita) => { setCitaSeleccionada(cita); setNotasModalOpen(true); };
    const abrirModificar = (cita) => { setCitaSeleccionada(cita); setModificarModalOpen(true); };
    const abrirCancelar = (cita) => { setCitaSeleccionada(cita); setCancelarModalOpen(true); };

    // Recarga solo la lista de citas
    const recargarCitas = () => router.reload({ only: ['citas'] });

    const gruposDisponibles = gradoFilter ? (gruposPorGrado[gradoFilter] || []) : [];

    const claseFiltroFecha = (activo) =>
        `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 transition-all text-gray-700 ${
            activo
                ? 'border-[#FF5900] bg-[#FF5900]/5 ring-2 ring-[#FF5900]/20'
                : 'border-gray-300 bg-white'
        }`;

    return (
        <AuthenticatedLayout>
            <Head title={soloLectura ? 'Citas de todos los formadores' : 'Citas'} />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {soloLectura ? 'Citas de todos los formadores' : 'Citas'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {soloLectura
                                ? 'Consulta de solo lectura: citas de todos los formadores'
                                : 'Gestiona tus citas asignadas'}
                        </p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {esCoordinador && haySeleccion && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF5900]/10 text-[#CC4700] text-xs font-medium rounded-full">
                                {selectedIds.length} seleccionada{selectedIds.length === 1 ? '' : 's'}
                                <button
                                    type="button"
                                    onClick={limpiarSeleccion}
                                    className="text-[#CC4700] hover:text-[#FF5900]"
                                    title="Limpiar selección"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        )}

                        {esCoordinador && (
                            <button
                                onClick={abrirConfirmExport}
                                disabled={!citas || citas.length === 0}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    haySeleccion
                                        ? 'bg-green-700 text-white hover:bg-green-800 hover:shadow-lg hover:shadow-green-700/25'
                                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/25'
                                }`}
                                title={haySeleccion
                                    ? `Descargar en Excel las ${selectedIds.length} citas seleccionadas`
                                    : 'Descargar en Excel todas las citas que se muestran'}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {haySeleccion
                                    ? `Descargar ${selectedIds.length} seleccionada${selectedIds.length === 1 ? '' : 's'}`
                                    : 'Descargar en Excel'}
                            </button>
                        )}

                        {soloLectura && (
                            <Link
                                href={route('citas.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Ir a mis citas
                            </Link>
                        )}
                    </div>
                </div>

                {/* Banner solo lectura */}
                {soloLectura && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-blue-800 text-sm">Vista de consulta</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Aquí puedes consultar las citas de tus compañeros. Para gestionar tus propias citas, ve a <strong>"Ver mis citas"</strong>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-md mb-8 border border-gray-100 overflow-visible">
                    <button
                        onClick={() => setFiltrosOpen(!filtrosOpen)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-base font-semibold text-gray-800">Filtros de búsqueda</span>
                            {filtrosActivos > 0 && (
                                <span className="text-sm text-[#CC4700] bg-[#FF5900]/10 rounded-full px-2.5 py-0.5">
                                    {filtrosActivos} activo{filtrosActivos === 1 ? '' : 's'}
                                </span>
                            )}
                        </div>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${filtrosOpen ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${filtrosOpen ? 'max-h-[1200px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'}`}>
                        <div className="px-6 pb-6">
                            {/* Fila 1: Formador, Estado, Clasificación, Asistencia */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {mostrarFiltroFormador && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Formador</label>
                                        <select
                                            value={formadorFilter}
                                            onChange={(e) => setFormadorFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                        >
                                            <option value="">Todos</option>
                                            {formadores?.map(f => (
                                                <option key={f.id_usuario} value={f.id_usuario}>{f.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                                    <select
                                        value={estadoFilter}
                                        onChange={(e) => setEstadoFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="programada">Programada</option>
                                        <option value="cancelada">Cancelada</option>
                                        <option value="cancelada_liberada">Cancelada (liberada)</option>
                                        <option value="completada">Completada</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Clasificación</label>
                                    <SelectClasificacionColor
                                        value={clasificacionFilter}
                                        onChange={setClasificacionFilter}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Asistencia</label>
                                    <select
                                        value={asistenciaFilter}
                                        onChange={(e) => setAsistenciaFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    >
                                        <option value="">Todas las asistencias</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="asistió">Asistió</option>
                                        <option value="no asistió">No asistió</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fila 2: Grado y Grupo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Grado</label>
                                    <select
                                        value={gradoFilter}
                                        onChange={(e) => setGradoFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    >
                                        <option value="">Todos los grados</option>
                                        {gradosActivos.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Grupo
                                        {!gradoFilter && <span className="text-gray-400 ml-1">(elige grado)</span>}
                                    </label>
                                    <select
                                        value={grupoFilter}
                                        onChange={(e) => setGrupoFilter(e.target.value)}
                                        disabled={!gradoFilter}
                                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 ${!gradoFilter ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                    >
                                        <option value="">Todos los grupos</option>
                                        {gruposDisponibles.map(g => (
                                            <option key={g} value={g}>Grupo {g}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Fila 3: Filtros de fecha */}
                            <div className="bg-gray-50/60 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <label className="text-sm font-semibold text-gray-700">Filtro de fecha</label>
                                    <span className="text-xs text-gray-500">
                                        (elige <strong>uno solo</strong>: año, mes, semana o fecha específica)
                                    </span>
                                    {fechaActiva && (
                                        <span className="ml-auto text-xs text-[#CC4700] bg-[#FF5900]/10 rounded-full px-2.5 py-0.5 font-medium">
                                            {fechaActiva === 'anio' && `Año ${anioFilter}`}
                                            {fechaActiva === 'mes' && `Mes ${mesFilter}`}
                                            {fechaActiva === 'semana' && `Semana ${semanaValorFilter}`}
                                            {fechaActiva === 'fecha' && `Fecha ${fechaFilter}`}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                            Año
                                            {anioFilter && <span className="text-[#FF5900] ml-1">●</span>}
                                        </label>
                                        <select
                                            value={anioFilter}
                                            onChange={(e) => handleAnioChange(e.target.value)}
                                            className={claseFiltroFecha(!!anioFilter)}
                                        >
                                            <option value="">Cualquier año</option>
                                            {aniosDisponibles.map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                            Mes
                                            {mesFilter && <span className="text-[#FF5900] ml-1">●</span>}
                                        </label>
                                        <input
                                            type="month"
                                            value={mesFilter}
                                            onChange={(e) => handleMesChange(e.target.value)}
                                            className={claseFiltroFecha(!!mesFilter)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                            Semana específica
                                            {semanaValorFilter && <span className="text-[#FF5900] ml-1">●</span>}
                                        </label>
                                        <SelectorSemana
                                            value={semanaValorFilter}
                                            onChange={handleSemanaChange}
                                            label=""
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                            Fecha específica
                                            {fechaFilter && <span className="text-[#FF5900] ml-1">●</span>}
                                        </label>
                                        <input
                                            type="date"
                                            value={fechaFilter}
                                            onChange={(e) => handleFechaChange(e.target.value)}
                                            className={claseFiltroFecha(!!fechaFilter)}
                                        />
                                    </div>
                                </div>

                                {fechaActiva && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAnioFilter('');
                                                setMesFilter('');
                                                setSemanaValorFilter('');
                                                setFechaFilter('');
                                            }}
                                            className="text-xs text-[#CC4700] hover:text-[#FF5900] underline font-medium"
                                        >
                                            Quitar filtro de fecha
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Vista rápida:</label>
                                    <select
                                        value={periodoFilter}
                                        onChange={(e) => setPeriodoFilter(e.target.value)}
                                        disabled={!!fechaActiva}
                                        className={`px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 text-sm ${fechaActiva ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
                                    >
                                        <option value="actual">Semana actual</option>
                                        <option value="todas">Todas</option>
                                    </select>
                                    {fechaActiva && (
                                        <span className="text-xs text-gray-500">(desactivada por filtro de fecha)</span>
                                    )}
                                </div>

                                <div className="flex gap-3 ml-auto">
                                    <button
                                        onClick={applyFilters}
                                        className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                                    >
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                            Aplicar filtros
                                        </span>
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>

                            {!fechaActiva && periodoFilter === 'actual' && (
                                <p className="text-xs text-[#FF5900] flex items-center mt-3">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Mostrando citas desde hoy hasta 7 días después
                                </p>
                            )}

                            {!fechaActiva && periodoFilter === 'todas' && (
                                <p className="text-xs text-[#FF5900] flex items-center mt-3">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Mostrando todas las citas registradas (cualquier estado y fecha)
                                </p>
                            )}

                            {fechaActiva && (
                                <p className="text-xs text-[#FF5900] flex items-center mt-3">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Mostrando todas las citas del periodo seleccionado
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Listado de citas */}
                {!citas || citas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No hay citas para mostrar</p>
                        <p className="text-gray-400 text-sm mt-1">No se encontraron citas con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <>
                        <TablaCitas
                            titulo="Citas"
                            subtitulo="Todas las citas que coinciden con los filtros aplicados"
                            citas={citasProximas}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            esCoordinador={esCoordinador}
                            mostrarAcciones={mostrarAcciones}
                            mostrarFiltroFormador={mostrarFiltroFormador}
                            user={user}
                            onNotas={abrirNotas}
                            onModificar={abrirModificar}
                            onCancelar={abrirCancelar}
                            colorTitulo="bg-[#FF5900]"
                        />

                        {!soloLectura && (
                            <TablaCitas
                                titulo="Citas por atender"
                                subtitulo="Citas programadas cuya fecha y hora ya pasaron"
                                citas={citasPorAtender}
                                selectedIds={selectedIds}
                                setSelectedIds={setSelectedIds}
                                esCoordinador={esCoordinador}
                                mostrarAcciones={mostrarAcciones}
                                mostrarFiltroFormador={mostrarFiltroFormador}
                                user={user}
                                onNotas={abrirNotas}
                                onModificar={abrirModificar}
                                onCancelar={abrirCancelar}
                                colorTitulo="bg-amber-500"
                            />
                        )}

                        {citasProximas.length === 0 && (soloLectura || citasPorAtender.length === 0) && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 text-center">
                                <p className="text-gray-500">No hay citas para mostrar.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de confirmación de descarga */}
            {confirmExportOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setConfirmExportOpen(false)}
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
                                    onClick={() => setConfirmExportOpen(false)}
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
                                onClick={() => setConfirmExportOpen(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={ejecutarDescarga}
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
            )}

            {mostrarAcciones && (
                <Suspense fallback={null}>
                    <NotasModal
                        isOpen={notasModalOpen}
                        onClose={() => setNotasModalOpen(false)}
                        cita={citaSeleccionada}
                        onSuccess={recargarCitas}
                    />
                    <ModificarModal
                        isOpen={modificarModalOpen}
                        onClose={() => setModificarModalOpen(false)}
                        cita={citaSeleccionada}
                        onSuccess={recargarCitas}
                    />
                    <CancelarModal
                        isOpen={cancelarModalOpen}
                        onClose={() => setCancelarModalOpen(false)}
                        cita={citaSeleccionada}
                        onSuccess={recargarCitas}
                    />
                </Suspense>
            )}
        </AuthenticatedLayout>
    );
}
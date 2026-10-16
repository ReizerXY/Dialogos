// resources/js/Pages/Panel/Citas/MisCitas.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import TablaCitas from './TablaCitas';
import FiltrosCitas from './FiltrosCitas';
import Paginacion from '@/Components/Paginacion';
import { citaYaPaso, formatFecha, ESTADO_LABELS, CLASIFICACION_LABELS, ASISTENCIA_LABELS } from './helpers';

const NotasModal     = lazy(() => import('../Modales/NotasModal'));
const ModificarModal = lazy(() => import('../Modales/ModificarModal'));
const CancelarModal  = lazy(() => import('../Modales/CancelarModal'));

const POR_PAGINA = 15;

export default function MisCitas({
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

    const [filtrosOpen, setFiltrosOpen] = useState(false);

    const [notasModalOpen, setNotasModalOpen] = useState(false);
    const [modificarModalOpen, setModificarModalOpen] = useState(false);
    const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);

    const mostrarFiltroFormador = false;
    const mostrarAcciones = true;

    const fechaActiva = (() => {
        if (anioFilter) return 'anio';
        if (mesFilter) return 'mes';
        if (semanaValorFilter) return 'semana';
        if (fechaFilter) return 'fecha';
        return null;
    })();

    useEffect(() => {
        if (gradoFilter && grupoFilter) {
            const disp = gruposPorGrado[gradoFilter] || [];
            if (!disp.includes(grupoFilter)) setGrupoFilter('');
        }
    }, [gradoFilter, gruposPorGrado]);

    // Divide las citas en dos grupos
    const { citasProximas, citasPorAtender } = useMemo(() => {
        const hayFiltroEstado = !!filtros.estado;

        if (fechaActiva) {
            return { citasProximas: [...(citas || [])], citasPorAtender: [] };
        }
        if (filtros.semana === 'todas') {
            return { citasProximas: [...(citas || [])], citasPorAtender: [] };
        }

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
    }, [citas, filtros.estado, filtros.semana, fechaActiva]);


    // Paginacion de la tabla principal
    const totalPaginas = Math.max(1, Math.ceil(citasProximas.length / POR_PAGINA));
    const citasPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * POR_PAGINA;
        return citasProximas.slice(inicio, inicio + POR_PAGINA);
    }, [citasProximas, paginaActual]);

    useEffect(() => { setPaginaActual(1); }, [citasProximas.length]);
    useEffect(() => { if (paginaActual > totalPaginas) setPaginaActual(totalPaginas); }, [paginaActual, totalPaginas]);

    // Chips de filtros activos
    const chipsFiltros = useMemo(() => {
        const chips = [];
        const pushChip = (key, label, valor) => chips.push({
            key, label, valor,
            onRemove: () => {
                const params = new URLSearchParams(window.location.search);
                params.delete(key);
                window.location.href = `/citas?${params.toString()}`;
            },
        });

        if (filtros.estado) pushChip('estado', 'Estado', ESTADO_LABELS[filtros.estado] || filtros.estado);
        if (filtros.clasificacion) pushChip('clasificacion', 'Clasificación', CLASIFICACION_LABELS[filtros.clasificacion] || filtros.clasificacion);
        if (filtros.asistencia) pushChip('asistencia', 'Asistencia', ASISTENCIA_LABELS[filtros.asistencia] || filtros.asistencia);
        if (filtros.grado) pushChip('grado', 'Grado', filtros.grado);
        if (filtros.grupo) pushChip('grupo', 'Grupo', filtros.grupo);
        if (filtros.anio) pushChip('anio', 'Año', filtros.anio);
        if (filtros.mes) pushChip('mes', 'Mes', filtros.mes);
        if (filtros.semana_valor) pushChip('semana_valor', 'Semana', filtros.semana_valor);
        if (filtros.fecha) pushChip('fecha', 'Fecha', formatFecha(filtros.fecha));

        return chips;
    }, [filtros]);

    const applyFilters = () => {
        const params = new URLSearchParams();
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

    const clearFilters = () => { window.location.href = '/citas'; };

    const abrirNotas = (cita) => { setCitaSeleccionada(cita); setNotasModalOpen(true); };
    const abrirModificar = (cita) => { setCitaSeleccionada(cita); setModificarModalOpen(true); };
    const abrirCancelar = (cita) => { setCitaSeleccionada(cita); setCancelarModalOpen(true); };

    const recargarCitas = () => router.reload({ only: ['citas'] });

    return (
        <AuthenticatedLayout>
            <Head title="Mis citas" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Mis citas</h1>
                    <p className="text-gray-500 mt-1">Consulta, atiende y gestiona las citas que tienes asignadas</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>


                {/* Chips de filtros activos */}
                {chipsFiltros.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filtros activos:</span>
                        {chipsFiltros.map(chip => (
                            <span
                                key={chip.key}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FF5900]/30 text-[#CC4700] text-xs font-medium rounded-full shadow-sm"
                            >
                                <span className="text-gray-500">{chip.label}:</span>
                                <span>{chip.valor}</span>
                                <button
                                    type="button"
                                    onClick={chip.onRemove}
                                    className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#FF5900]/15 transition-colors"
                                    title={`Quitar filtro: ${chip.label}`}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs text-gray-500 hover:text-[#FF5900] underline font-medium ml-1 transition-colors"
                        >
                            Limpiar todos
                        </button>
                    </div>
                )}

                {/* Filtros */}
                <FiltrosCitas
                    mostrarFiltroFormador={mostrarFiltroFormador}
                    formadores={formadores}
                    aniosDisponibles={aniosDisponibles}
                    gradosActivos={gradosActivos}
                    gruposPorGrado={gruposPorGrado}
                    filtros={{
                        formadorFilter, estadoFilter, clasificacionFilter, asistenciaFilter,
                        gradoFilter, grupoFilter,
                        anioFilter, mesFilter, semanaValorFilter, fechaFilter,
                        periodoFilter,
                    }}
                    setters={{
                        setFormadorFilter, setEstadoFilter, setClasificacionFilter, setAsistenciaFilter,
                        setGradoFilter, setGrupoFilter,
                        setAnioFilter, setMesFilter, setSemanaValorFilter, setFechaFilter,
                        setPeriodoFilter,
                    }}
                    onAplicar={applyFilters}
                    onLimpiar={clearFilters}
                    abierto={filtrosOpen}
                    setAbierto={setFiltrosOpen}
                />

                {/* Listado */}
                {!citas || citas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">No hay citas para mostrar</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                            {chipsFiltros.length > 0
                                ? 'No se encontraron citas con los filtros aplicados. Prueba quitando alguno o limpia todos los filtros.'
                                : 'Aún no tienes citas registradas.'}
                        </p>
                        {chipsFiltros.length > 0 && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200 active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Tabla principal con paginación */}
                        {citasProximas.length > 0 && (
                            <>
                                <Paginacion
                                    paginaActual={paginaActual}
                                    totalPaginas={totalPaginas}
                                    totalRegistros={citasProximas.length}
                                    porPagina={POR_PAGINA}
                                    onChange={setPaginaActual}
                                    className="mb-4"
                                    etiqueta="citas"
                                />
                                <TablaCitas
                                    titulo="Citas"
                                    subtitulo="Todas las citas que coinciden con los filtros aplicados"
                                    citas={citasPaginadas}
                                    selectedIds={selectedIds}
                                    setSelectedIds={setSelectedIds}
                                    esCoordinador={false}
                                    mostrarAcciones={mostrarAcciones}
                                    mostrarFiltroFormador={mostrarFiltroFormador}
                                    user={user}
                                    onNotas={abrirNotas}
                                    onModificar={abrirModificar}
                                    onCancelar={abrirCancelar}
                                    colorTitulo="bg-[#FF5900]"
                                />
                                <Paginacion
                                    paginaActual={paginaActual}
                                    totalPaginas={totalPaginas}
                                    totalRegistros={citasProximas.length}
                                    porPagina={POR_PAGINA}
                                    onChange={setPaginaActual}
                                    className="mt-4"
                                    etiqueta="citas"
                                />
                            </>
                        )}

                        {/* Tabla por atender (sin paginación) */}
                        {citasPorAtender.length > 0 && (
                            <div className="mt-6">
                                <TablaCitas
                                    titulo="Citas por atender"
                                    subtitulo="Citas programadas cuya fecha y hora ya pasaron"
                                    citas={citasPorAtender}
                                    selectedIds={selectedIds}
                                    setSelectedIds={setSelectedIds}
                                    esCoordinador={false}
                                    mostrarAcciones={mostrarAcciones}
                                    mostrarFiltroFormador={mostrarFiltroFormador}
                                    user={user}
                                    onNotas={abrirNotas}
                                    onModificar={abrirModificar}
                                    onCancelar={abrirCancelar}
                                    colorTitulo="bg-amber-500"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

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
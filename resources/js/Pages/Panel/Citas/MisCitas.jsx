// resources/js/Pages/Panel/Citas/MisCitas.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import TablaCitas from './TablaCitas';
import FiltrosCitas from './FiltrosCitas';
import { citaYaPaso } from './helpers';

const NotasModal     = lazy(() => import('../Modales/NotasModal'));
const ModificarModal = lazy(() => import('../Modales/ModificarModal'));
const CancelarModal  = lazy(() => import('../Modales/CancelarModal'));

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

    const [selectedIds, setSelectedIds] = useState([]);

    const esFormador = rol === 'Formador';
    const mostrarFiltroFormador = false;
    const mostrarAcciones = true;

    // Detecta cuál filtro de fecha está activo
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

    // Divide las citas en dos grupos.
    //   · Con filtro de fecha activo → todo en una sola tabla.
    //   · Con vista rápida = "Todas" → todo en una sola tabla, sin ocultar nada.
    //   · Formador sin filtro de fecha → vista semanal en dos tablas.
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

    // Aplica los filtros activos y recarga la página
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

    // Limpia todos los filtros
    const clearFilters = () => {
        window.location.href = '/citas';
    };

    // Abre cada modal con la cita seleccionada
    const abrirNotas = (cita) => { setCitaSeleccionada(cita); setNotasModalOpen(true); };
    const abrirModificar = (cita) => { setCitaSeleccionada(cita); setModificarModalOpen(true); };
    const abrirCancelar = (cita) => { setCitaSeleccionada(cita); setCancelarModalOpen(true); };

    // Recarga solo la lista de citas
    const recargarCitas = () => router.reload({ only: ['citas'] });

    return (
        <AuthenticatedLayout>
            <Head title="Citas" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
                        <p className="text-gray-500 mt-1">Gestiona tus citas asignadas</p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                </div>

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
                            esCoordinador={false}
                            mostrarAcciones={mostrarAcciones}
                            mostrarFiltroFormador={mostrarFiltroFormador}
                            user={user}
                            onNotas={abrirNotas}
                            onModificar={abrirModificar}
                            onCancelar={abrirCancelar}
                            colorTitulo="bg-[#FF5900]"
                        />

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

                        {citasProximas.length === 0 && citasPorAtender.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 text-center">
                                <p className="text-gray-500">No hay citas para mostrar.</p>
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
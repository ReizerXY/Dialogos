// resources/js/Pages/Panel/Citas/CitasCoordinador.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import TablaCitas from './TablaCitas';
import FiltrosCitas from './FiltrosCitas';
import ModalConfirmExport from './ModalConfirmExport';
import { citaYaPaso, formatFecha, ESTADO_LABELS, CLASIFICACION_LABELS, ASISTENCIA_LABELS } from './helpers';

export default function CitasCoordinador({
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

    // Selección de filas
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal de confirmación de descarga
    const [confirmExportOpen, setConfirmExportOpen] = useState(false);
    const [ordenExport, setOrdenExport] = useState('fecha');

    const esCoordinador = rol === 'Coordinador';
    const mostrarFiltroFormador = true;

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

    // Limpia de la selección los ids que ya no están visibles
    useEffect(() => {
        if (!citas) return;
        const idsVisibles = new Set(citas.map(c => c.id_cita));
        setSelectedIds(prev => prev.filter(id => idsVisibles.has(id)));
    }, [citas]);

    // Coordinador: una sola tabla, pero sin vencidas cerradas
    const citasAMostrar = useMemo(() => {
        const hayFiltroEstado = !!filtros.estado;

        if (fechaActiva) {
            return [...(citas || [])];
        }

        if (filtros.semana === 'todas') {
            return [...(citas || [])];
        }

        return (citas || []).filter(c => {
            if (hayFiltroEstado) return true;
            if (!citaYaPaso(c)) return true;

            return !(
                c.estado === 'cancelada' ||
                c.estado === 'cancelada_liberada' ||
                c.estado === 'completada'
            );
        });
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

                    <div className="flex flex-wrap items-center gap-2">
                        {haySeleccion && (
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
                    <TablaCitas
                        titulo="Citas"
                        subtitulo="Todas las citas que coinciden con los filtros aplicados"
                        citas={citasAMostrar}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        esCoordinador={esCoordinador}
                        mostrarAcciones={false}
                        mostrarFiltroFormador={mostrarFiltroFormador}
                        user={user}
                        onNotas={() => {}}
                        onModificar={() => {}}
                        onCancelar={() => {}}
                        colorTitulo="bg-[#FF5900]"
                    />
                )}
            </div>

            <ModalConfirmExport
                isOpen={confirmExportOpen}
                onClose={() => setConfirmExportOpen(false)}
                haySeleccion={haySeleccion}
                selectedIds={selectedIds}
                totalADescargar={totalADescargar}
                resumenFiltros={resumenFiltros}
                ordenExport={ordenExport}
                setOrdenExport={setOrdenExport}
                onConfirmar={ejecutarDescarga}
            />
        </AuthenticatedLayout>
    );
}
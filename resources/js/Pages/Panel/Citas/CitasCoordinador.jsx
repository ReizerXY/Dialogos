// resources/js/Pages/Panel/Citas/CitasCoordinador.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import TablaCitas from './TablaCitas';
import FiltrosCitas from './FiltrosCitas';
import ModalConfirmExport from './ModalConfirmExport';
import { citaYaPaso, formatFecha, ESTADO_LABELS, CLASIFICACION_LABELS, ASISTENCIA_LABELS } from './helpers';
import Paginacion from '@/Components/Paginacion';

// Cantidad de citas por pagina
const POR_PAGINA = 15;


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

    const [selectedIds, setSelectedIds] = useState([]);

    const [confirmExportOpen, setConfirmExportOpen] = useState(false);
    const [ordenExport, setOrdenExport] = useState('fecha');
    const [descargando, setDescargando] = useState(false);

    const [paginaActual, setPaginaActual] = useState(1);

    const esCoordinador = rol === 'Coordinador';
    const mostrarFiltroFormador = true;

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

    useEffect(() => {
        if (!citas) return;
        const idsVisibles = new Set(citas.map(c => c.id_cita));
        setSelectedIds(prev => prev.filter(id => idsVisibles.has(id)));
    }, [citas]);

    // Lista de citas a mostrar (sin vencidas cerradas si no hay filtro)
    const citasAMostrar = useMemo(() => {
        const hayFiltroEstado = !!filtros.estado;

        if (fechaActiva) return [...(citas || [])];
        if (filtros.semana === 'todas') return [...(citas || [])];

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

    // Paginacion
    const totalPaginas = Math.max(1, Math.ceil(citasAMostrar.length / POR_PAGINA));
    const citasPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * POR_PAGINA;
        return citasAMostrar.slice(inicio, inicio + POR_PAGINA);
    }, [citasAMostrar, paginaActual]);

    // Reset a la primera pagina cuando cambia el total de citas
    useEffect(() => {
        setPaginaActual(1);
    }, [citasAMostrar.length]);

    // Si por algún motivo la página actual queda fuera de rango, retroceder
    useEffect(() => {
        if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
    }, [paginaActual, totalPaginas]);

    // Chips de filtros activos
    const chipsFiltros = useMemo(() => {
        const chips = [];

        if (filtros.formador) {
            const f = formadores?.find(x => String(x.id_usuario) === String(filtros.formador));
            chips.push({
                key: 'formador',
                label: 'Formador',
                valor: f?.nombre || `#${filtros.formador}`,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('formador');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.estado) {
            chips.push({
                key: 'estado',
                label: 'Estado',
                valor: ESTADO_LABELS[filtros.estado] || filtros.estado,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('estado');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.clasificacion) {
            chips.push({
                key: 'clasificacion',
                label: 'Clasificación',
                valor: CLASIFICACION_LABELS[filtros.clasificacion] || filtros.clasificacion,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('clasificacion');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.asistencia) {
            chips.push({
                key: 'asistencia',
                label: 'Asistencia',
                valor: ASISTENCIA_LABELS[filtros.asistencia] || filtros.asistencia,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('asistencia');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.grado) {
            chips.push({
                key: 'grado',
                label: 'Grado',
                valor: filtros.grado,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('grado');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.grupo) {
            chips.push({
                key: 'grupo',
                label: 'Grupo',
                valor: filtros.grupo,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('grupo');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.anio) {
            chips.push({
                key: 'anio',
                label: 'Año',
                valor: filtros.anio,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('anio');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.mes) {
            chips.push({
                key: 'mes',
                label: 'Mes',
                valor: filtros.mes,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('mes');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.semana_valor) {
            chips.push({
                key: 'semana_valor',
                label: 'Semana',
                valor: filtros.semana_valor,
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('semana_valor');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }
        if (filtros.fecha) {
            chips.push({
                key: 'fecha',
                label: 'Fecha',
                valor: formatFecha(filtros.fecha),
                onRemove: () => {
                    const params = new URLSearchParams(window.location.search);
                    params.delete('fecha');
                    window.location.href = `/citas?${params.toString()}`;
                },
            });
        }

        return chips;
    }, [filtros, formadores]);

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

    const clearFilters = () => {
        window.location.href = '/citas';
    };

    const limpiarSeleccion = () => setSelectedIds([]);
    const haySeleccion = selectedIds.length > 0;

    const resumenFiltros = useMemo(() => {
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
    }, [formadorFilter, estadoFilter, clasificacionFilter, asistenciaFilter, gradoFilter, grupoFilter,
        anioFilter, mesFilter, semanaValorFilter, fechaFilter, periodoFilter, formadores]);

    const totalADescargar = haySeleccion ? selectedIds.length : (citas?.length || 0);

    const abrirConfirmExport = () => {
        if (!citas || citas.length === 0) return;
        setConfirmExportOpen(true);
    };

    const ejecutarDescarga = () => {
        setDescargando(true);
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

        setTimeout(() => {
            window.location.href = `/citas/exportar-excel?${params.toString()}`;
            setTimeout(() => {
                setDescargando(false);
                setConfirmExportOpen(false);
            }, 1500);
        }, 150);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Citas" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
                        <p className="text-gray-500 mt-1">Consulta, filtra y exporta todas las citas del programa</p>
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
                            disabled={!citas || citas.length === 0 || descargando}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                haySeleccion
                                    ? 'bg-green-700 text-white hover:bg-green-800 hover:shadow-lg hover:shadow-green-700/25'
                                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/25'
                            }`}
                            title={haySeleccion
                                ? `Descargar en Excel las ${selectedIds.length} citas seleccionadas`
                                : 'Descargar en Excel todas las citas que se muestran'}
                        >
                            {descargando ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Descargando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {haySeleccion
                                        ? `Descargar ${selectedIds.length} seleccionada${selectedIds.length === 1 ? '' : 's'}`
                                        : 'Descargar en Excel'}
                                </>
                            )}
                        </button>
                    </div>
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

                {/* Listado de citas */}
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
                                : 'Aún no hay citas registradas en el sistema.'}
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
                        {/* Paginación arriba */}
                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            totalRegistros={citasAMostrar.length}
                            porPagina={POR_PAGINA}
                            onChange={setPaginaActual}
                            className="mb-4"
                        />

                        <TablaCitas
                            titulo="Citas"
                            subtitulo="Todas las citas que coinciden con los filtros aplicados"
                            citas={citasPaginadas}
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

                        {/* Paginación abajo */}
                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            totalRegistros={citasAMostrar.length}
                            porPagina={POR_PAGINA}
                            onChange={setPaginaActual}
                            className="mt-4"
                        />
                    </>
                )}
            </div>

            <ModalConfirmExport
                isOpen={confirmExportOpen}
                onClose={() => !descargando && setConfirmExportOpen(false)}
                haySeleccion={haySeleccion}
                selectedIds={selectedIds}
                totalADescargar={totalADescargar}
                resumenFiltros={resumenFiltros}
                ordenExport={ordenExport}
                setOrdenExport={setOrdenExport}
                onConfirmar={ejecutarDescarga}
                descargando={descargando}
            />
        </AuthenticatedLayout>
    );
}
// resources/js/Pages/Panel/Estudiantes.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';
import Paginacion from '@/Components/Paginacion';

import { normalizarTexto, formatFecha, obtenerCsrfToken } from './Estudiantes/helpers';
import FilaEstudiante from './Estudiantes/FilaEstudiante';
import CardEstudiante from './Estudiantes/CardEstudiante';
import FiltrosEstudiantes from './Estudiantes/FiltrosEstudiantes';
import BloqueImportacion from './Estudiantes/BloqueImportacion';
import ModalEstudiante from './Estudiantes/ModalEstudiante';
import ModalConfigCiclo from './Estudiantes/ModalConfigCiclo';

// Opciones de elementos por página
const OPCIONES_POR_PAGINA = [25, 50, 100, 200];

// Form data inicial
const FORM_DATA_VACIO = {
    id_estudiante: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    grado: '',
    grupo: '',
    contacto: '',
    contacto_emergencia: '',
};

// Detecta movil
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

export default function Estudiantes({ estudiantes, user, config }) {
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [importarOpen, setImportarOpen] = useState(false);
    const inputFileRef = useRef(null);

    const [listaEstudiantes, setListaEstudiantes] = useState(estudiantes);
    const [orden, setOrden] = useState('id_estudiante');

    const [paginaActual, setPaginaActual] = useState(1);
    const [porPagina, setPorPagina] = useState(25);

    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        setListaEstudiantes(estudiantes);
    }, [estudiantes]);

    const [busquedaInput, setBusquedaInput] = useState('');
    const [gradoInput, setGradoInput] = useState('');
    const [grupoInput, setGrupoInput] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [gradoFilter, setGradoFilter] = useState('');
    const [grupoFilter, setGrupoFilter] = useState('');

    const [filtrosOpen, setFiltrosOpen] = useState(false);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState(FORM_DATA_VACIO);
    const [cargandoModal, setCargandoModal] = useState(false);

    const [confirmEliminar, setConfirmEliminar] = useState({ open: false, estudiante: null, loading: false });
    const [confirmEliminarTodos, setConfirmEliminarTodos] = useState({ open: false, loading: false });
    const [confirmExport, setConfirmExport] = useState({ open: false, loading: false });

    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [inicioCiclo, setInicioCiclo] = useState(config?.inicio_ciclo_escolar || '');
    const [importacionManual, setImportacionManual] = useState(!!config?.importacion_activa_manual);
    const [guardandoConfig, setGuardandoConfig] = useState(false);

    useEffect(() => {
        setInicioCiclo(config?.inicio_ciclo_escolar || '');
        setImportacionManual(!!config?.importacion_activa_manual);
    }, [config]);

    const mostrarImportacion = config?.mostrar_importacion === true;

    const previewMostrar = useMemo(() => {
        if (importacionManual) return true;
        if (!inicioCiclo) return false;
        const inicio = new Date(inicioCiclo + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const dias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
        const ventana = config?.dias_ventana_ciclo ?? 7;
        return dias >= 0 && dias <= ventana;
    }, [inicioCiclo, importacionManual, config]);

    const gradosDisponibles = useMemo(() => {
        const set = new Set(listaEstudiantes.map(e => e.grado).filter(Boolean));
        return [...set].sort((a, b) => {
            const na = parseInt(a, 10) || 0;
            const nb = parseInt(b, 10) || 0;
            return na - nb;
        });
    }, [listaEstudiantes]);

    const gruposDisponiblesInput = useMemo(() => {
        const base = gradoInput
            ? listaEstudiantes.filter(e => e.grado === gradoInput)
            : listaEstudiantes;
        const set = new Set(base.map(e => e.grupo).filter(Boolean));
        return [...set].sort();
    }, [listaEstudiantes, gradoInput]);

    useEffect(() => {
        if (grupoInput && !gruposDisponiblesInput.includes(grupoInput)) {
            setGrupoInput('');
        }
    }, [gruposDisponiblesInput, grupoInput]);

    const aplicarFiltros = useCallback(() => {
        const gradoFinal = gradoInput;
        const grupoFinal = (gradoInput && grupoInput && gruposDisponiblesInput.includes(grupoInput))
            ? grupoInput
            : '';
        setBusqueda(busquedaInput.trim());
        setGradoFilter(gradoFinal);
        setGrupoFilter(grupoFinal);
        setPaginaActual(1);
    }, [gradoInput, grupoInput, gruposDisponiblesInput, busquedaInput]);

    const limpiarFiltros = useCallback(() => {
        setBusquedaInput('');
        setGradoInput('');
        setGrupoInput('');
        setBusqueda('');
        setGradoFilter('');
        setGrupoFilter('');
        setPaginaActual(1);
    }, []);

    const listaFiltradaYOrdenada = useMemo(() => {
        let lista = [...listaEstudiantes];

        if (busqueda !== '') {
            const queryLimpio = busqueda
                .replace(/[\(\)\-_,\.\*\+\?\¿\¡\!\[\]\{\}]+/g, ' ')
                .trim();

            const palabras = queryLimpio
                .split(/\s+/)
                .filter(Boolean)
                .map(normalizarTexto);

            if (palabras.length > 0) {
                lista = lista.filter(e => {
                    const nombreCompleto = normalizarTexto(
                        `${e.nombre || ''} ${e.apellido_paterno || ''} ${e.apellido_materno || ''}`
                    );
                    const id = String(e.id_estudiante || '').toLowerCase();
                    return palabras.every(p => nombreCompleto.includes(p) || id.includes(p));
                });
            }
        }

        if (gradoFilter) lista = lista.filter(e => e.grado === gradoFilter);
        if (grupoFilter) lista = lista.filter(e => e.grupo === grupoFilter);

        if (orden === 'grado') {
            return lista.sort((a, b) => {
                const gradoA = parseInt(a.grado, 10) || 0;
                const gradoB = parseInt(b.grado, 10) || 0;
                if (gradoA !== gradoB) return gradoA - gradoB;
                return (a.grupo || '').localeCompare(b.grupo || '');
            });
        }
        return lista.sort((a, b) =>
            String(a.id_estudiante).localeCompare(String(b.id_estudiante), undefined, { numeric: true })
        );
    }, [listaEstudiantes, busqueda, gradoFilter, grupoFilter, orden]);

    const totalItems = listaFiltradaYOrdenada.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina));

    useEffect(() => {
        if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
    }, [paginaActual, totalPaginas]);

    const listaPaginada = useMemo(() => {
        const inicio = (paginaActual - 1) * porPagina;
        return listaFiltradaYOrdenada.slice(inicio, inicio + porPagina);
    }, [listaFiltradaYOrdenada, paginaActual, porPagina]);

    useEffect(() => { setPaginaActual(1); }, [orden]);
    useEffect(() => { setPaginaActual(1); }, [porPagina]);

    const filtrosActivos = [busqueda, gradoFilter, grupoFilter].filter(Boolean).length;


    // Chips de filtros activos
    const chipsFiltros = useMemo(() => {
        const chips = [];
        if (busqueda) {
            chips.push({
                key: 'busqueda',
                label: 'Búsqueda',
                valor: busqueda,
                onRemove: () => { setBusquedaInput(''); setBusqueda(''); },
            });
        }
        if (gradoFilter) {
            chips.push({
                key: 'grado',
                label: 'Grado',
                valor: gradoFilter,
                onRemove: () => { setGradoInput(''); setGradoFilter(''); setGrupoInput(''); setGrupoFilter(''); },
            });
        }
        if (grupoFilter) {
            chips.push({
                key: 'grupo',
                label: 'Grupo',
                valor: grupoFilter,
                onRemove: () => { setGrupoInput(''); setGrupoFilter(''); },
            });
        }
        return chips;
    }, [busqueda, gradoFilter, grupoFilter]);

    // Handlers
    const abrirModalEditar = useCallback((estudiante) => {
        setModoEdicion(true);
        setFormData({
            id_estudiante: estudiante.id_estudiante,
            nombre: estudiante.nombre,
            apellido_paterno: estudiante.apellido_paterno,
            apellido_materno: estudiante.apellido_materno,
            grado: estudiante.grado,
            grupo: (estudiante.grupo || '').toUpperCase(),
            contacto: estudiante.contacto || '',
            contacto_emergencia: estudiante.contacto_emergencia || '',
        });
        setModalAbierto(true);
    }, []);

    const handleDelete = useCallback((estudiante) => {
        setConfirmEliminar({ open: true, estudiante, loading: false });
    }, []);

    const abrirModalAgregar = () => {
        setModoEdicion(false);
        setFormData(FORM_DATA_VACIO);
        setModalAbierto(true);
    };

        // Abre el modal de confirmacion de exportacion
    const abrirConfirmExport = () => {
        if (!listaEstudiantes || listaEstudiantes.length === 0) return;
        setConfirmExport({ open: true, loading: false });
    };

    // Ejecuta la descarga de Excel
    const ejecutarExport = () => {
        setConfirmExport(prev => ({ ...prev, loading: true }));
        setTimeout(() => {
            window.location.href = route('estudiantes.exportarExcel');
            setTimeout(() => setConfirmExport({ open: false, loading: false }), 800);
        }, 200);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormData(FORM_DATA_VACIO);
        setCargandoModal(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGrupoChange = (e) => {
        setFormData({ ...formData, grupo: e.target.value.toUpperCase() });
    };

    const handleSubmitModal = async (e) => {
        e.preventDefault();
        setCargandoModal(true);
        const csrfToken = obtenerCsrfToken();

        if (!formData.id_estudiante || !formData.nombre || !formData.apellido_paterno || !formData.apellido_materno || !formData.grado || !formData.grupo) {
            setMensaje({ tipo: 'error', texto: 'Todos los campos excepto teléfonos son obligatorios.' });
            setCargandoModal(false);
            return;
        }

        const url = modoEdicion ? `/estudiantes/${formData.id_estudiante}` : '/estudiantes';
        const method = modoEdicion ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setMensaje({ tipo: 'success', texto: data.message });
                if (modoEdicion) {
                    setListaEstudiantes(prev =>
                        prev.map(e => e.id_estudiante === formData.id_estudiante ? data.estudiante : e)
                    );
                } else {
                    setListaEstudiantes(prev => [...prev, data.estudiante]);
                }
                cerrarModal();
                setTimeout(() => setMensaje(null), 3000);
            } else {
                setMensaje({ tipo: 'error', texto: data.error || data.message || 'Error al guardar.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Inténtalo de nuevo.' });
        } finally {
            setCargandoModal(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setArchivo(file); setMensaje(null); }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!archivo) {
            setMensaje({ tipo: 'error', texto: 'Por favor, selecciona un archivo.' });
            return;
        }
        setCargando(true);
        setMensaje(null);
        const formData = new FormData();
        formData.append('archivo', archivo);
        const csrfToken = obtenerCsrfToken();

        try {
            const response = await fetch('/estudiantes/importar', {
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                setMensaje({ tipo: 'error', texto: `Error del servidor (${response.status}). Revisa el log de Laravel.` });
                return;
            }

            const data = await response.json();

            if (data.success) {
                setMensaje({ tipo: 'success', texto: data.message });
                setTimeout(() => router.reload({ only: ['estudiantes', 'config', 'alerta_importacion'] }), 800);
            } else {
                setMensaje({ tipo: 'error', texto: data.message || 'Error al importar.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Revisa la consola.' });
        } finally {
            setCargando(false);
            setArchivo(null);
            if (inputFileRef.current) inputFileRef.current.value = '';
        }
    };

    const confirmarEliminarUno = async () => {
        const estudiante = confirmEliminar.estudiante;
        if (!estudiante) return;
        setConfirmEliminar(prev => ({ ...prev, loading: true }));
        const csrfToken = obtenerCsrfToken();

        try {
            const response = await fetch(`/estudiantes/${estudiante.id_estudiante}`, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setListaEstudiantes(prev => prev.filter(e => e.id_estudiante !== estudiante.id_estudiante));
                setMensaje({ tipo: 'success', texto: data.message });
                setConfirmEliminar({ open: false, estudiante: null, loading: false });
                setTimeout(() => setMensaje(null), 3000);
            } else {
                setMensaje({ tipo: 'error', texto: data.error || data.message });
                setConfirmEliminar(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al eliminar.' });
            setConfirmEliminar(prev => ({ ...prev, loading: false }));
        }
    };

    const confirmarEliminarTodos = async () => {
        setConfirmEliminarTodos(prev => ({ ...prev, loading: true }));
        const csrfToken = obtenerCsrfToken();

        try {
            const response = await fetch('/estudiantes/todos', {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setListaEstudiantes([]);
                setMensaje({ tipo: 'success', texto: data.message });
                setConfirmEliminarTodos({ open: false, loading: false });
                setTimeout(() => setMensaje(null), 4000);
            } else {
                setMensaje({ tipo: 'error', texto: data.error || data.message });
                setConfirmEliminarTodos({ open: false, loading: false });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al eliminar.' });
            setConfirmEliminarTodos({ open: false, loading: false });
        }
    };

    const guardarConfig = async () => {
        setGuardandoConfig(true);
        const csrfToken = obtenerCsrfToken();
        try {
            const response = await fetch('/estudiantes/configuracion', {
                method: 'PUT',
                headers: {
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inicio_ciclo_escolar: inicioCiclo || null,
                    importacion_activa_manual: importacionManual,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setMensaje({ tipo: 'success', texto: data.message });
                setConfigModalOpen(false);
                setTimeout(() => router.reload({ only: ['config', 'alerta_importacion'] }), 400);
                setTimeout(() => setMensaje(null), 3500);
            } else {
                setMensaje({ tipo: 'error', texto: data.message || 'Error al guardar la configuración.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión al guardar.' });
        } finally {
            setGuardandoConfig(false);
        }
    };

    const fechaCicloTexto = config?.inicio_ciclo_escolar
        ? formatFecha(config.inicio_ciclo_escolar)
        : 'sin configurar';

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de estudiantes" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de estudiantes</h1>
                        <p className="text-gray-500 mt-1">Administra la lista de estudiantes del programa</p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setConfigModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-[#FF5900] hover:text-[#CC4700] transition-all duration-200"
                            title={`Última actualización: ${fechaCicloTexto}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar lista
                        </button>
                        <button
                            onClick={abrirConfirmExport}
                            disabled={listaEstudiantes.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Exportar la lista completa a Excel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar a Excel
                        </button>
                        <button
                            onClick={abrirModalAgregar}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar estudiante
                        </button>
                    </div>
                </div>

                {mensaje && (
                    <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                        mensaje.tipo === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {mensaje.tipo === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                        )}
                        <span className="flex-1">{mensaje.texto}</span>
                    </div>
                )}

                {mostrarImportacion && (
                    <BloqueImportacion
                        abierto={importarOpen}
                        setAbierto={setImportarOpen}
                        archivo={archivo}
                        cargando={cargando}
                        inputFileRef={inputFileRef}
                        onFileChange={handleFileChange}
                        onImport={handleImport}
                        config={config}
                        totalEstudiantes={listaEstudiantes.length}
                        onEliminarTodos={() => setConfirmEliminarTodos({ open: true, loading: false })}
                    />
                )}


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
                            onClick={limpiarFiltros}
                            className="text-xs text-gray-500 hover:text-[#FF5900] underline font-medium ml-1 transition-colors"
                        >
                            Limpiar todos
                        </button>
                    </div>
                )}

                <FiltrosEstudiantes
                    abierto={filtrosOpen}
                    setAbierto={setFiltrosOpen}
                    busquedaInput={busquedaInput}
                    setBusquedaInput={setBusquedaInput}
                    gradoInput={gradoInput}
                    setGradoInput={setGradoInput}
                    grupoInput={grupoInput}
                    setGrupoInput={setGrupoInput}
                    gradosDisponibles={gradosDisponibles}
                    gruposDisponiblesInput={gruposDisponiblesInput}
                    filtrosActivos={filtrosActivos}
                    onAplicar={aplicarFiltros}
                    onLimpiar={limpiarFiltros}
                />

                {/* Empty state */}
                {totalItems === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">
                            {filtrosActivos > 0 ? 'No hay estudiantes que coincidan' : 'No hay estudiantes registrados'}
                        </p>
                        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                            {filtrosActivos > 0
                                ? 'Prueba con otros filtros o limpia la búsqueda.'
                                : 'Agrega el primer estudiante o importa la lista del ciclo.'}
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {filtrosActivos > 0 ? (
                                <button
                                    onClick={limpiarFiltros}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200 active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Limpiar filtros
                                </button>
                            ) : (
                                <button
                                    onClick={abrirModalAgregar}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200 active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Agregar estudiante
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Barra superior: contador + orden + paginación */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-bold text-gray-800">Lista de estudiantes</h2>
                                    <span className="text-sm text-gray-500">
                                        {filtrosActivos > 0
                                            ? <><strong className="text-gray-700">{listaFiltradaYOrdenada.length}</strong> de {listaEstudiantes.length}</>
                                            : <><strong className="text-gray-700">{listaEstudiantes.length}</strong> registrados</>}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setOrden('id_estudiante')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                            orden === 'id_estudiante'
                                                ? 'bg-[#FF5900] text-white shadow-sm'
                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Por ID
                                    </button>
                                    <button
                                        onClick={() => setOrden('grado')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                            orden === 'grado'
                                                ? 'bg-[#FF5900] text-white shadow-sm'
                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Por Grado-Grupo
                                    </button>
                                </div>
                            </div>

                            <Paginacion
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                totalRegistros={totalItems}
                                porPagina={porPagina}
                                onChange={setPaginaActual}
                                etiqueta="estudiantes"
                                mostrarSelectorPorPagina
                                onCambiarPorPagina={setPorPagina}
                                opcionesPorPagina={OPCIONES_POR_PAGINA}
                            />
                        </div>

                        {/* Tabla / Cards */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                            {esMovil ? (
                                <div className="divide-y divide-gray-100">
                                    {listaPaginada.map(e => (
                                        <CardEstudiante
                                            key={e.id_estudiante}
                                            estudiante={e}
                                            onEditar={abrirModalEditar}
                                            onEliminar={handleDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-white">
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">ID</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Nombre completo</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Grado y grupo</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Contacto</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {listaPaginada.map(e => (
                                                <FilaEstudiante
                                                    key={e.id_estudiante}
                                                    estudiante={e}
                                                    onEditar={abrirModalEditar}
                                                    onEliminar={handleDelete}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {totalItems > 0 && (
                                <div className="px-6 py-4 border-t border-gray-100">
                                    <Paginacion
                                        paginaActual={paginaActual}
                                        totalPaginas={totalPaginas}
                                        totalRegistros={totalItems}
                                        porPagina={porPagina}
                                        onChange={setPaginaActual}
                                        etiqueta="estudiantes"
                                        mostrarSelectorPorPagina={false}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ModalEstudiante
                isOpen={modalAbierto}
                onClose={cerrarModal}
                modoEdicion={modoEdicion}
                formData={formData}
                onChange={handleChange}
                onGrupoChange={handleGrupoChange}
                onSubmit={handleSubmitModal}
                cargando={cargandoModal}
            />

            <ModalConfigCiclo
                isOpen={configModalOpen}
                onClose={() => setConfigModalOpen(false)}
                inicioCiclo={inicioCiclo}
                setInicioCiclo={setInicioCiclo}
                importacionManual={importacionManual}
                setImportacionManual={setImportacionManual}
                previewMostrar={previewMostrar}
                config={config}
                guardandoConfig={guardandoConfig}
                onGuardar={guardarConfig}
            />

            <ConfirmModal
                isOpen={confirmEliminar.open}
                onClose={() => setConfirmEliminar({ open: false, estudiante: null, loading: false })}
                onConfirm={confirmarEliminarUno}
                title="Eliminar estudiante"
                message={
                    confirmEliminar.estudiante
                        ? `¿Estás seguro de eliminar a ${confirmEliminar.estudiante.nombre} ${confirmEliminar.estudiante.apellido_paterno} ${confirmEliminar.estudiante.apellido_materno} (${confirmEliminar.estudiante.id_estudiante})? Se creará automáticamente una copia de seguridad antes de eliminar. Sus citas históricas se conservarán.`
                        : ''
                }
                confirmText="Sí, eliminar"
                variant="danger"
                loading={confirmEliminar.loading}
            />

            <ConfirmModal
                isOpen={confirmEliminarTodos.open}
                onClose={() => setConfirmEliminarTodos({ open: false, loading: false })}
                onConfirm={confirmarEliminarTodos}
                title="Eliminar lista de alumnos"
                message={`¿Estás seguro de eliminar ${listaEstudiantes.length} ${listaEstudiantes.length === 1 ? 'estudiante' : 'estudiantes'}? Se creará automáticamente una copia de seguridad antes de eliminar. Esta acción no se puede deshacer. Las citas históricas se conservarán.`}
                confirmText="Sí, eliminar todos"
                variant="danger"
                loading={confirmEliminarTodos.loading}
            />

            <ConfirmModal
            isOpen={confirmExport.open}
            onClose={() => !confirmExport.loading && setConfirmExport({ open: false, loading: false })}
            onConfirm={ejecutarExport}
            title="Exportar lista a Excel"
            message={
                <>
                    Se descargará un archivo Excel (.xlsx) con la lista completa de{' '}
                    <strong>{listaEstudiantes.length} {listaEstudiantes.length === 1 ? 'estudiante' : 'estudiantes'}</strong>{' '}
                    registrados en el sistema. Incluye nombre, apellidos, grado, grupo y contactos.
                </>
            }
            confirmText="Sí, descargar Excel"
            cancelText="Cancelar"
            variant="info"
            loading={confirmExport.loading}
        />
        </AuthenticatedLayout>
    );
}
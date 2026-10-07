// resources/js/Pages/Panel/Estudiantes.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

import { normalizarTexto, formatFecha, obtenerCsrfToken } from './Estudiantes/helpers';
import FilaEstudiante from './Estudiantes/FilaEstudiante';
import Paginacion from './Estudiantes/Paginacion';
import FiltrosEstudiantes from './Estudiantes/FiltrosEstudiantes';
import BloqueImportacion from './Estudiantes/BloqueImportacion';
import ModalEstudiante from './Estudiantes/ModalEstudiante';
import ModalConfigCiclo from './Estudiantes/ModalConfigCiclo';

// Form data inicial (fuera del componente para evitar re-creación)
const FORM_DATA_VACIO = {
    id_estudiante: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    grado: '',
    grupo: '',
    telefono_estudiante: '',
    telefono_padre: '',
};

export default function Estudiantes({ estudiantes, user, config }) {
    // Importación
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [importarOpen, setImportarOpen] = useState(false);
    const inputFileRef = useRef(null);

    // Lista y orden
    const [listaEstudiantes, setListaEstudiantes] = useState(estudiantes);
    const [orden, setOrden] = useState('id_estudiante');

    // Paginación (por defecto 25)
    const [paginaActual, setPaginaActual] = useState(1);
    const [porPagina, setPorPagina] = useState(25);

    useEffect(() => {
        setListaEstudiantes(estudiantes);
    }, [estudiantes]);

    // Filtros
    const [busquedaInput, setBusquedaInput] = useState('');
    const [gradoInput, setGradoInput] = useState('');
    const [grupoInput, setGrupoInput] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [gradoFilter, setGradoFilter] = useState('');
    const [grupoFilter, setGrupoFilter] = useState('');

    const [filtrosOpen, setFiltrosOpen] = useState(false);

    // Modal estudiante
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState(FORM_DATA_VACIO);
    const [cargandoModal, setCargandoModal] = useState(false);

    // Confirmaciones
    const [confirmEliminar, setConfirmEliminar] = useState({ open: false, estudiante: null, loading: false });
    const [confirmEliminarTodos, setConfirmEliminarTodos] = useState({ open: false, loading: false });

    // Configuración del ciclo escolar
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [inicioCiclo, setInicioCiclo] = useState(config?.inicio_ciclo_escolar || '');
    const [importacionManual, setImportacionManual] = useState(!!config?.importacion_activa_manual);
    const [guardandoConfig, setGuardandoConfig] = useState(false);

    useEffect(() => {
        setInicioCiclo(config?.inicio_ciclo_escolar || '');
        setImportacionManual(!!config?.importacion_activa_manual);
    }, [config]);

    const mostrarImportacion = !!config?.mostrar_importacion;

    // Preview en vivo: ¿se mostraría la importación con esta config?
    const previewMostrar = useMemo(() => {
        if (importacionManual) return true;
        if (!inicioCiclo) return false;
        const inicio = new Date(inicioCiclo + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const diffMs = hoy - inicio;
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const antes = config?.dias_antes_ciclo ?? 7;
        const despues = config?.dias_despues_ciclo ?? 14;
        return dias >= -antes && dias <= despues;
    }, [inicioCiclo, importacionManual, config]);

    // Grados y grupos disponibles para los filtros
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
        } else {
            return lista.sort((a, b) =>
                String(a.id_estudiante).localeCompare(String(b.id_estudiante), undefined, { numeric: true })
            );
        }
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

    const inicioMostrado = totalItems === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
    const finMostrado    = Math.min(paginaActual * porPagina, totalItems);

    useEffect(() => { setPaginaActual(1); }, [orden]);
    useEffect(() => { setPaginaActual(1); }, [porPagina]);

    const filtrosActivos = [busqueda, gradoFilter, grupoFilter].filter(Boolean).length;

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
            telefono_estudiante: estudiante.telefono_estudiante || '',
            telefono_padre: estudiante.telefono_padre || '',
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

    // Guarda (crea o actualiza) un estudiante
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
                    'X-CSRF-TOKEN': csrfToken,
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

    // Importación
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivo(file);
            setMensaje(null);
        }
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
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                setMensaje({
                    tipo: 'error',
                    texto: `Error del servidor (${response.status}). Revisa el log de Laravel.`
                });
                return;
            }

            const data = await response.json();

            if (data.success) {
                setMensaje({ tipo: 'success', texto: data.message });
                setTimeout(() => router.reload({ only: ['estudiantes'] }), 800);
            } else {
                setMensaje({ tipo: 'error', texto: data.message || 'Error al importar.' });
            }
        } catch (error) {
            console.error('Error en la importación:', error);
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Revisa la consola.' });
        } finally {
            setCargando(false);
            setArchivo(null);
            if (inputFileRef.current) inputFileRef.current.value = '';
        }
    };

    // Eliminar un estudiante
    const confirmarEliminarUno = async () => {
        const estudiante = confirmEliminar.estudiante;
        if (!estudiante) return;

        setConfirmEliminar(prev => ({ ...prev, loading: true }));
        const csrfToken = obtenerCsrfToken();

        try {
            const response = await fetch(`/estudiantes/${estudiante.id_estudiante}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
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

    // Eliminar toda la lista de estudiantes
    const confirmarEliminarTodos = async () => {
        setConfirmEliminarTodos(prev => ({ ...prev, loading: true }));
        const csrfToken = obtenerCsrfToken();

        try {
            const response = await fetch('/estudiantes/todos', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
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

    // Guardar configuración del ciclo escolar
    const guardarConfig = async () => {
        setGuardandoConfig(true);
        const csrfToken = obtenerCsrfToken();

        try {
            const response = await fetch('/estudiantes/configuracion', {
                method: 'PUT',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
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
                setTimeout(() => router.reload({ only: ['config'] }), 400);
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

    // Formatea la fecha del ciclo para mostrar en el header
    const fechaCicloTexto = config?.inicio_ciclo_escolar
        ? formatFecha(config.inicio_ciclo_escolar)
        : 'sin configurar';

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de estudiantes" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de estudiantes</h1>
                        <p className="text-gray-500 mt-1">Administra los estudiantes del sistema</p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setConfigModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-[#FF5900] hover:text-[#CC4700] transition-all duration-200"
                            title={`Ciclo escolar: ${fechaCicloTexto}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ciclo escolar
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
                    <div className={`mb-4 p-4 rounded-xl ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {mensaje.texto}
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

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-gray-800">Lista de estudiantes</h2>
                                <span className="text-sm text-gray-500">
                                    {filtrosActivos > 0
                                        ? <>Filtrados: <strong className="text-gray-700">{listaFiltradaYOrdenada.length}</strong> de {listaEstudiantes.length}</>
                                        : <>Total: {listaEstudiantes.length}</>
                                    }
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setOrden('id_estudiante')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        orden === 'id_estudiante' ? 'bg-[#FF5900] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Por ID Estudiante
                                </button>
                                <button
                                    onClick={() => setOrden('grado')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        orden === 'grado' ? 'bg-[#FF5900] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Por Grado-Grupo
                                </button>
                            </div>
                        </div>

                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            porPagina={porPagina}
                            totalItems={totalItems}
                            inicio={inicioMostrado}
                            fin={finMostrado}
                            onCambiarPagina={setPaginaActual}
                            onCambiarPorPagina={setPorPagina}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Estudiante</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido paterno</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido materno</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto de emergencia</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                                {listaPaginada.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-gray-500">
                                            {filtrosActivos > 0
                                                ? 'No hay estudiantes que coincidan con los filtros.'
                                                : 'No hay estudiantes registrados.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalItems > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <Paginacion
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                porPagina={porPagina}
                                totalItems={totalItems}
                                inicio={inicioMostrado}
                                fin={finMostrado}
                                onCambiarPagina={setPaginaActual}
                                onCambiarPorPagina={setPorPagina}
                                mostrarSelectorPorPagina={false}
                            />
                        </div>
                    )}
                </div>
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
                        ? `¿Estás seguro de eliminar a ${confirmEliminar.estudiante.nombre} ${confirmEliminar.estudiante.apellido_paterno} ${confirmEliminar.estudiante.apellido_materno} (${confirmEliminar.estudiante.id_estudiante})? Sus citas históricas se conservarán.`
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
                message={`¿Estás seguro de eliminar ${listaEstudiantes.length} ${listaEstudiantes.length === 1 ? 'estudiante' : 'estudiantes'}? Esta acción no se puede deshacer. Las citas históricas se conservarán.`}
                confirmText="Sí, eliminar todos"
                variant="danger"
                loading={confirmEliminarTodos.loading}
            />
        </AuthenticatedLayout>
    );
}
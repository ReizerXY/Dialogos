// resources/js/Pages/Panel/Estudiantes.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useMemo, useEffect, useCallback, memo } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

// Grados permitidos (mismo orden que el backend)
const GRADOS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];

// ✅ Fila memoizada: solo se re-renderiza si el estudiante o los handlers cambian
const FilaEstudiante = memo(function FilaEstudiante({ estudiante, onEditar, onEliminar }) {
    return (
        <tr className="hover:bg-[#FF5900]/5 transition-colors">
            <td className="px-4 py-3 text-sm font-medium text-gray-800 font-mono">{estudiante.id_estudiante}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.nombre}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.grado}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.grupo}</td>
            <td className="px-4 py-3 text-sm text-gray-700 font-mono">{estudiante.telefono_estudiante || '-'}</td>
            <td className="px-4 py-3 text-sm text-gray-700 font-mono">{estudiante.telefono_padre || '-'}</td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onEditar(estudiante)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar
                    </button>
                    <button
                        onClick={() => onEliminar(estudiante)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default function Estudiantes({ estudiantes, user }) {
    // ===== IMPORTACIÓN =====
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [importarOpen, setImportarOpen] = useState(false);
    const inputFileRef = useRef(null);

    // ===== LISTA Y ORDEN =====
    const [listaEstudiantes, setListaEstudiantes] = useState(estudiantes);
    const [orden, setOrden] = useState('id_estudiante');

    // ✅ Sincronizar la lista local cuando el prop cambia (después de un router.reload)
    useEffect(() => {
        setListaEstudiantes(estudiantes);
    }, [estudiantes]);

    // ===== FILTROS =====
    const [busquedaInput, setBusquedaInput] = useState('');
    const [gradoInput, setGradoInput]       = useState('');
    const [grupoInput, setGrupoInput]       = useState('');

    const [busqueda, setBusqueda]           = useState('');
    const [gradoFilter, setGradoFilter]     = useState('');
    const [grupoFilter, setGrupoFilter]     = useState('');

    const [filtrosOpen, setFiltrosOpen]     = useState(false);

    // ===== MODAL AGREGAR / EDITAR =====
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        id_estudiante: '',
        nombre: '',
        grado: '',
        grupo: '',
        telefono_estudiante: '',
        telefono_padre: '',
    });
    const [cargandoModal, setCargandoModal] = useState(false);

    // ===== CONFIRMACIONES =====
    const [confirmEliminar, setConfirmEliminar] = useState({ open: false, estudiante: null, loading: false });
    const [confirmEliminarTodos, setConfirmEliminarTodos] = useState({ open: false, loading: false });

    // ============================================================
    // GRADOS Y GRUPOS DISPONIBLES
    // ============================================================
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

    // ============================================================
    // APLICAR / LIMPIAR FILTROS
    // ============================================================
    const aplicarFiltros = useCallback(() => {
        const gradoFinal = gradoInput;
        const grupoFinal = (gradoInput && grupoInput && gruposDisponiblesInput.includes(grupoInput))
            ? grupoInput
            : '';

        setBusqueda(busquedaInput.trim());
        setGradoFilter(gradoFinal);
        setGrupoFilter(grupoFinal);
    }, [gradoInput, grupoInput, gruposDisponiblesInput, busquedaInput]);

    const limpiarFiltros = useCallback(() => {
        setBusquedaInput('');
        setGradoInput('');
        setGrupoInput('');
        setBusqueda('');
        setGradoFilter('');
        setGrupoFilter('');
    }, []);

    // ============================================================
    // LISTA FILTRADA + ORDENADA
    // ============================================================
    const listaFiltradaYOrdenada = useMemo(() => {
        let lista = [...listaEstudiantes];

        if (busqueda !== '') {
            const q = busqueda.toLowerCase();
            lista = lista.filter(e =>
                (e.nombre || '').toLowerCase().includes(q) ||
                String(e.id_estudiante).toLowerCase().includes(q)
            );
        }

        if (gradoFilter) {
            lista = lista.filter(e => e.grado === gradoFilter);
        }

        if (grupoFilter) {
            lista = lista.filter(e => e.grupo === grupoFilter);
        }

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

    const filtrosActivos = [busqueda, gradoFilter, grupoFilter].filter(Boolean).length;

    // ============================================================
    // HANDLERS ESTABLES (para React.memo)
    // ============================================================
    const abrirModalEditar = useCallback((estudiante) => {
        setModoEdicion(true);
        setFormData({
            id_estudiante: estudiante.id_estudiante,
            nombre: estudiante.nombre,
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

    // ============================================================
    // MODAL
    // ============================================================
    const abrirModalAgregar = () => {
        setModoEdicion(false);
        setFormData({
            id_estudiante: '',
            nombre: '',
            grado: '',
            grupo: '',
            telefono_estudiante: '',
            telefono_padre: '',
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormData({
            id_estudiante: '',
            nombre: '',
            grado: '',
            grupo: '',
            telefono_estudiante: '',
            telefono_padre: '',
        });
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
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        if (!formData.id_estudiante || !formData.nombre || !formData.grado || !formData.grupo) {
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

    // ===== IMPORTAR =====
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

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

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

    // ===== ELIMINAR UNO =====
    const confirmarEliminarUno = async () => {
        const estudiante = confirmEliminar.estudiante;
        if (!estudiante) return;

        setConfirmEliminar(prev => ({ ...prev, loading: true }));

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

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

    // ===== ELIMINAR TODOS =====
    const confirmarEliminarTodos = async () => {
        setConfirmEliminarTodos(prev => ({ ...prev, loading: true }));
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

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
                            onClick={() => setConfirmEliminarTodos({ open: true, loading: false })}
                            disabled={listaEstudiantes.length === 0}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar lista alumnos
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

                {/* Importación (COLAPSABLE) */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden">
                    <button
                        onClick={() => setImportarOpen(!importarOpen)}
                        className="w-full flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition text-left"
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="text-base font-semibold text-gray-800">Importar estudiantes</span>
                            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
                                ⚠️ Realizar al inicio de cada semestre
                            </span>
                        </div>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${importarOpen ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${importarOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-6 pb-6 border-t border-gray-100">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 mt-4 flex items-start gap-2 text-sm text-amber-800">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <strong>Se recomienda realizar esta importación al inicio de cada semestre.</strong>
                                    <div className="text-xs mt-0.5">Actualiza la lista completa de estudiantes inscritos en el ciclo actual.</div>
                                </div>
                            </div>

                            <form onSubmit={handleImport} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Archivo (.xlsx, .xls, .csv, .txt)
                                    </label>
                                    <input
                                        ref={inputFileRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv,.txt,.tsv"
                                        onChange={handleFileChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={cargando || !archivo}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {cargando ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Importar
                                        </>
                                    )}
                                </button>
                            </form>
                            <p className="text-xs text-gray-400 mt-3">
                                El archivo debe tener las columnas: <strong>id_estudiante, nombre, grado, grupo, telefono_estudiante, telefono_padre</strong>.
                            </p>
                            <p className="text-xs text-gray-400">
                                Las filas con ID existente se actualizarán; las nuevas se insertarán.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                ✅ Acepta <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong> y <strong>.txt</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-md mb-6 border border-gray-100 overflow-hidden">
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

                    <div className={`transition-all duration-300 ease-in-out ${filtrosOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar por nombre o ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={busquedaInput}
                                            onChange={(e) => setBusquedaInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aplicarFiltros(); } }}
                                            placeholder="Ej. Daniela o 800001"
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Grado</label>
                                    <select
                                        value={gradoInput}
                                        onChange={(e) => setGradoInput(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    >
                                        <option value="">Todos los grados</option>
                                        {gradosDisponibles.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Grupo
                                        {!gradoInput && <span className="text-gray-400 ml-1">(elige grado)</span>}
                                    </label>
                                    <select
                                        value={grupoInput}
                                        onChange={(e) => setGrupoInput(e.target.value)}
                                        disabled={!gradoInput}
                                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 ${!gradoInput ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                    >
                                        <option value="">Todos los grupos</option>
                                        {gruposDisponiblesInput.map(g => (
                                            <option key={g} value={g}>Grupo {g}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={aplicarFiltros}
                                    className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Filtrar
                                    </span>
                                </button>
                                <button
                                    onClick={limpiarFiltros}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Lista de estudiantes</h2>
                            <span className="text-sm text-gray-500">
                                {filtrosActivos > 0
                                    ? <>Mostrando <strong className="text-gray-700">{listaFiltradaYOrdenada.length}</strong> de {listaEstudiantes.length}</>
                                    : <>Total: {listaEstudiantes.length}</>
                                }
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setOrden('id_estudiante')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    orden === 'id_estudiante'
                                        ? 'bg-[#FF5900] text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Ordenar por ID Estudiante
                            </button>
                            <button
                                onClick={() => setOrden('grado')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    orden === 'grado'
                                        ? 'bg-[#FF5900] text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Ordenar por Grado-Grupo
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Estudiante</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono estudiante</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono padre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {listaFiltradaYOrdenada.map(e => (
                                    <FilaEstudiante
                                        key={e.id_estudiante}
                                        estudiante={e}
                                        onEditar={abrirModalEditar}
                                        onEliminar={handleDelete}
                                    />
                                ))}
                                {listaFiltradaYOrdenada.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-gray-500">
                                            {filtrosActivos > 0
                                                ? 'No hay estudiantes que coincidan con los filtros.'
                                                : 'No hay estudiantes registrados.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal agregar/editar */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? 'Editar estudiante' : 'Agregar estudiante'}
                            </h3>
                            <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitModal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Estudiante *</label>
                                <input
                                    type="text"
                                    name="id_estudiante"
                                    value={formData.id_estudiante}
                                    onChange={handleChange}
                                    disabled={modoEdicion}
                                    maxLength={10}
                                    placeholder="Ej. 625447"
                                    className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white ${modoEdicion ? 'bg-gray-100 text-gray-500' : ''}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                                    <select
                                        name="grado"
                                        value={formData.grado}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                        required
                                    >
                                        <option value="">Seleccionar</option>
                                        {GRADOS.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Grupo *
                                        <span className="text-gray-400 font-normal ml-1">(A-Z)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="grupo"
                                        value={formData.grupo}
                                        onChange={handleGrupoChange}
                                        maxLength={5}
                                        placeholder="A"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 uppercase focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono estudiante</label>
                                <input
                                    type="text"
                                    name="telefono_estudiante"
                                    value={formData.telefono_estudiante}
                                    onChange={handleChange}
                                    maxLength={10}
                                    placeholder="2712344587"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono padre</label>
                                <input
                                    type="text"
                                    name="telefono_padre"
                                    value={formData.telefono_padre}
                                    onChange={handleChange}
                                    maxLength={10}
                                    placeholder="2712344587"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={cargandoModal}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
                                >
                                    {cargandoModal ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmEliminar.open}
                onClose={() => setConfirmEliminar({ open: false, estudiante: null, loading: false })}
                onConfirm={confirmarEliminarUno}
                title="Eliminar estudiante"
                message={
                    confirmEliminar.estudiante
                        ? `¿Estás seguro de eliminar a ${confirmEliminar.estudiante.nombre} (${confirmEliminar.estudiante.id_estudiante})? Sus citas históricas se conservarán.`
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useMemo } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Estudiantes({ estudiantes, user }) {
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [listaEstudiantes, setListaEstudiantes] = useState(estudiantes);
    const [orden, setOrden] = useState('id_estudiante');

    const inputFileRef = useRef(null);

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

    const abrirModalEditar = (estudiante) => {
        setModoEdicion(true);
        setFormData({
            id_estudiante: estudiante.id_estudiante,
            nombre: estudiante.nombre,
            grado: estudiante.grado,
            grupo: estudiante.grupo,
            telefono_estudiante: estudiante.telefono_estudiante || '',
            telefono_padre: estudiante.telefono_padre || '',
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

    const handleSubmitModal = async (e) => {
        e.preventDefault();
        setCargandoModal(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        if (!formData.id_estudiante || !formData.nombre || !formData.grado || !formData.grupo) {
            setMensaje({ tipo: 'error', texto: 'Todos los campos excepto teléfonos son obligatorios.' });
            setCargandoModal(false);
            return;
        }

        const url = modoEdicion
            ? `/estudiantes/${formData.id_estudiante}`
            : '/estudiantes';
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

    // ===== IMPORTAR EXCEL/CSV =====
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
                setTimeout(() => window.location.reload(), 800);
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
    const handleDelete = (estudiante) => {
        setConfirmEliminar({ open: true, estudiante, loading: false });
    };

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

    // ===== ORDENAMIENTO =====
    const listaOrdenada = useMemo(() => {
        const lista = [...listaEstudiantes];
        if (orden === 'grado') {
            return lista.sort((a, b) => {
                const gradoA = parseInt(a.grado) || 0;
                const gradoB = parseInt(b.grado) || 0;
                if (gradoA !== gradoB) return gradoA - gradoB;
                return a.grupo.localeCompare(b.grupo);
            });
        } else {
            return lista.sort((a, b) =>
                String(a.id_estudiante).localeCompare(String(b.id_estudiante), undefined, { numeric: true })
            );
        }
    }, [listaEstudiantes, orden]);

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de estudiantes" />
            <div className="max-w-7xl mx-auto">
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

                {/* Sección de importación */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Importar estudiantes</h2>
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
                    <p className="text-xs text-gray-400 mt-2">
                        El archivo debe tener las columnas: <strong>id_estudiante, nombre, grado, grupo, telefono_estudiante, telefono_padre</strong>.
                    </p>
                    <p className="text-xs text-gray-400">
                        Las filas con ID existente se actualizarán; las nuevas se insertarán.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        ✅ Acepta <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong> y <strong>.txt</strong>. Puedes subir el archivo de Excel tal como lo tienes.
                    </p>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Lista de estudiantes</h2>
                            <span className="text-sm text-gray-500">Total: {listaEstudiantes.length}</span>
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
                                {listaOrdenada.map(e => (
                                    <tr key={e.id_estudiante} className="hover:bg-[#FF5900]/5 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800 font-mono">{e.id_estudiante}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{e.nombre}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{e.grado}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{e.grupo}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{e.telefono_estudiante || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{e.telefono_padre || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => abrirModalEditar(e)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Modificar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(e)}
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
                                ))}
                                {listaOrdenada.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-gray-500">
                                            No hay estudiantes registrados.
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
                                    <input
                                        type="text"
                                        name="grado"
                                        value={formData.grado}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
                                    <input
                                        type="text"
                                        name="grupo"
                                        value={formData.grupo}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
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

            {/* Confirmar eliminar uno */}
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

            {/* Confirmar eliminar todos */}
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
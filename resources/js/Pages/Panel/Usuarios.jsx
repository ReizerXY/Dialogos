// resources/js/Pages/Panel/Usuarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Usuarios({ usuarios, user }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Acción de suspender/reactivar: maneja 4 combinaciones (visibilidad|acceso) x (suspender|reactivar)
    const [confirmAccion, setConfirmAccion] = useState({
        open: false,
        usuario: null,
        tipo: null,      // 'visibilidad' | 'acceso'
        accion: null,    // 'suspender' | 'reactivar'
        procesando: false,
    });

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        usuario: null,
        procesando: false,
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        usuario: '',
        clave: '',
        nombre: '',
        rol: 'Formador',
    });

    const openCreateModal = () => {
        setEditUser(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (usuario) => {
        setEditUser(usuario);
        setData({
            usuario: usuario.usuario,
            clave: '',
            nombre: usuario.nombre,
            rol: usuario.rol,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        reset();
        setEditUser(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('usuarios.update', editUser.id_usuario), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('usuarios.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    // Abre el modal de confirmación para visibilidad o acceso
    const abrirConfirmacion = (usuario, tipo) => {
        const activoAhora = tipo === 'visibilidad'
            ? usuario.visibilidad_usuario == 1
            : usuario.acceso_usuario == 1;

        setConfirmAccion({
            open: true,
            usuario,
            tipo,
            accion: activoAhora ? 'suspender' : 'reactivar',
            procesando: false,
        });
    };

    const cerrarConfirmacion = () => {
        if (confirmAccion.procesando) return;
        setConfirmAccion({ open: false, usuario: null, tipo: null, accion: null, procesando: false });
    };

    const confirmarAccion = () => {
        if (!confirmAccion.usuario) return;
        setConfirmAccion((prev) => ({ ...prev, procesando: true }));

        const routeName = confirmAccion.tipo === 'visibilidad'
            ? 'usuarios.toggleVisibilidad'
            : 'usuarios.toggleAcceso';

        router.put(route(routeName, confirmAccion.usuario.id_usuario), {}, {
            preserveScroll: true,
            onFinish: () => {
                setConfirmAccion({ open: false, usuario: null, tipo: null, accion: null, procesando: false });
            },
        });
    };

    const abrirEliminar = (usuario) => {
        setDeleteModal({ open: true, usuario, procesando: false });
    };

    const cerrarEliminar = () => {
        if (deleteModal.procesando) return;
        setDeleteModal({ open: false, usuario: null, procesando: false });
    };

    const confirmarEliminar = () => {
        if (!deleteModal.usuario) return;
        setDeleteModal((prev) => ({ ...prev, procesando: true }));
        router.delete(route('usuarios.destroy', deleteModal.usuario.id_usuario), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModal({ open: false, usuario: null, procesando: false });
            },
        });
    };

    // Textos del modal según tipo + acción
    const textosModal = () => {
        const { tipo, accion, usuario } = confirmAccion;
        if (!usuario || !tipo) return {};

        const esAcceso = tipo === 'acceso';
        const esSuspender = accion === 'suspender';

        if (esAcceso) {
            return {
                titulo: esSuspender ? 'Suspender acceso' : 'Restaurar acceso',
                pregunta: esSuspender ? 'suspender el acceso a la plataforma' : 'restaurar el acceso a la plataforma',
                aviso: esSuspender
                    ? 'El usuario NO podrá iniciar sesión a partir del próximo intento. Si tiene una sesión activa, seguirá vigente hasta que expire.'
                    : 'El usuario podrá iniciar sesión en la plataforma con normalidad.',
                color: esSuspender ? 'red' : 'green',
                textoBoton: esSuspender ? 'Sí, suspender acceso' : 'Sí, restaurar acceso',
            };
        }
        return {
            titulo: esSuspender ? 'Suspender atención de citas' : 'Reactivar atención de citas',
            pregunta: esSuspender ? 'suspender la atención de citas' : 'reactivar la atención de citas',
            aviso: esSuspender
                ? 'El usuario seguirá pudiendo ingresar a la plataforma. Sin embargo, ya no aparecerá como opción al agendar nuevas citas.'
                : 'El usuario volverá a aparecer como opción al agendar nuevas citas.',
            color: esSuspender ? 'yellow' : 'green',
            textoBoton: esSuspender ? 'Sí, suspender citas' : 'Sí, reactivar citas',
        };
    };

    const t = textosModal();
    const esAcceso = confirmAccion.tipo === 'acceso';
    const esSuspender = confirmAccion.accion === 'suspender';

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de usuarios" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de usuarios</h1>
                    <p className="text-gray-500 mt-1">Administra los usuarios del sistema</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-medium text-gray-700">{usuarios.length}</span> usuarios
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo usuario
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {usuarios.map(u => {
                                    const accesoOk = u.acceso_usuario == 1;
                                    const visibilidadOk = u.visibilidad_usuario == 1;
                                    const esFormador = u.rol === 'Formador';
                                    const filaAtenuada = !accesoOk || (esFormador && !visibilidadOk);

                                    return (
                                        <tr key={u.id_usuario} className={`transition-colors duration-150 ${filaAtenuada ? 'bg-gray-50 opacity-80' : 'hover:bg-[#FF5900]/5'}`}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{u.id_usuario}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{u.usuario}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{u.nombre}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    u.rol === 'Coordinador' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {u.rol}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5">
                                                    {/* Badge de Acceso (aplica a todos) */}
                                                    {accesoOk ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit"
                                                            title="Puede iniciar sesión en la plataforma"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            Acceso habilitado
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit"
                                                            title="No puede iniciar sesión en la plataforma"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                            Acceso suspendido
                                                        </span>
                                                    )}

                                                    {/* Badge de Visibilidad (solo Formadores) */}
{esFormador && (
    visibilidadOk ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit"
              title="Aparece en los selectores de citas">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Visible en citas
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit"
              title="No aparece en los selectores de citas">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Oculto en citas
        </span>
    )
)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5900] text-white text-xs font-medium rounded-lg hover:bg-[#CC4700] transition-all duration-200 hover:shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Modificar
                                                    </button>

                                                    {u.usuario !== 'admin' && u.id_usuario !== user.id_usuario && (
                                                        <>
                                                            {/* ✅ Solo para Formadores: visibilidad en citas */}
                                                            {esFormador && (
                                                                <button
                                                                    onClick={() => abrirConfirmacion(u, 'visibilidad')}
                                                                    title={visibilidadOk ? 'Ocultar al agendar citas' : 'Mostrar al agendar citas'}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 ${
                                                                        visibilidadOk
                                                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                                    }`}
                                                                >
                                                                    {visibilidadOk ? (
                                                                        <>
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                                            </svg>
                                                                            Suspender citas
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                            Reactivar citas
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}

                                                            {/* ✅ Botón de acceso (visible siempre) */}
                                                            <button
                                                                onClick={() => abrirConfirmacion(u, 'acceso')}
                                                                title={accesoOk ? 'Suspender acceso a la plataforma' : 'Restaurar acceso a la plataforma'}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 ${
                                                                    accesoOk
                                                                        ? 'bg-slate-700 text-white hover:bg-slate-800'
                                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                }`}
                                                            >
                                                                {accesoOk ? (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                        </svg>
                                                                        Suspender acceso
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                                        </svg>
                                                                        Restaurar acceso
                                                                    </>
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => abrirEliminar(u)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-all duration-200 hover:shadow-md active:scale-95"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Eliminar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {usuarios.length === 0 && (
                        <div className="py-12 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-gray-500">No hay usuarios registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal crear / editar usuario (sin cambios) */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {editUser ? 'Editar usuario' : 'Nuevo usuario'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                                <input
                                    type="text"
                                    value={data.usuario}
                                    onChange={e => setData('usuario', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    required
                                />
                                {errors.usuario && <p className="text-red-600 text-sm mt-1">{errors.usuario}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Clave</label>
                                <input
                                    type="password"
                                    value={data.clave}
                                    onChange={e => setData('clave', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    placeholder={editUser ? 'Dejar vacío para no cambiar' : 'Mínimo 4 caracteres'}
                                />
                                {errors.clave && <p className="text-red-600 text-sm mt-1">{errors.clave}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    required
                                />
                                {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rol</label>
                                <select
                                    value={data.rol}
                                    onChange={e => setData('rol', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                >
                                    <option value="Coordinador">Coordinador</option>
                                    <option value="Formador">Formador</option>
                                </select>
                                {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-[#FF5900] text-white rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación unificado (visibilidad o acceso) */}
            {confirmAccion.open && confirmAccion.usuario && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                esSuspender
                                    ? (esAcceso ? 'bg-red-100' : 'bg-yellow-100')
                                    : 'bg-green-100'
                            }`}>
                                {esSuspender ? (
                                    esAcceso ? (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )
                                ) : (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{t.titulo}</h2>
                        </div>

                        <p className="text-gray-600 mb-2">
                            ¿Estás seguro de que deseas <strong>{t.pregunta}</strong> de <strong>{confirmAccion.usuario.nombre}</strong>?
                        </p>

                        <div className={`rounded-xl p-3 mb-4 text-sm ${
                            esSuspender
                                ? (esAcceso
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800')
                                : 'bg-green-50 border border-green-200 text-green-800'
                        }`}>
                            {t.aviso}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                disabled={confirmAccion.procesando}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarAccion}
                                disabled={confirmAccion.procesando}
                                className={`px-6 py-2 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                    esSuspender
                                        ? (esAcceso ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600')
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {confirmAccion.procesando ? 'Procesando...' : t.textoBoton}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de eliminación (sin cambios) */}
            {deleteModal.open && deleteModal.usuario && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Eliminar usuario</h2>
                        </div>

                        <p className="text-gray-600 mb-2">
                            ¿Estás seguro de que deseas <strong>eliminar permanentemente</strong> a{' '}
                            <strong>{deleteModal.usuario.nombre}</strong>?
                        </p>

                        <div className="rounded-xl p-3 mb-4 text-sm bg-red-50 border border-red-200 text-red-800">
                            Esta acción <strong>no se puede deshacer</strong>. El usuario y sus horarios se
                            eliminarán por completo. Sus citas pasadas conservarán el nombre con el que se
                            atendieron, pero ya no estarán vinculadas a ninguna cuenta.
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarEliminar}
                                disabled={deleteModal.procesando}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarEliminar}
                                disabled={deleteModal.procesando}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteModal.procesando ? 'Eliminando...' : 'Sí, eliminar permanentemente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
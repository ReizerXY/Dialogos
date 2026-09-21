// resources/js/Pages/Panel/Usuarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Usuarios({ usuarios, user }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        usuario: null,
        accion: null,
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

    const abrirConfirmacion = (usuario) => {
        setConfirmModal({
            open: true,
            usuario,
            accion: usuario.activo == 1 ? 'baja' : 'reactivar',
            procesando: false,
        });
    };

    const cerrarConfirmacion = () => {
        if (confirmModal.procesando) return;
        setConfirmModal({ open: false, usuario: null, accion: null, procesando: false });
    };

    const confirmarAccion = () => {
        if (!confirmModal.usuario) return;
        setConfirmModal((prev) => ({ ...prev, procesando: true }));
        router.put(route('usuarios.toggleActivo', confirmModal.usuario.id_usuario), {}, {
            preserveScroll: true,
            onFinish: () => {
                setConfirmModal({ open: false, usuario: null, accion: null, procesando: false });
            },
        });
    };

    const abrirEliminar = (usuario) => {
        setDeleteModal({
            open: true,
            usuario,
            procesando: false,
        });
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
                                {usuarios.map(u => (
                                    <tr key={u.id_usuario} className={`transition-colors duration-150 ${u.activo == 0 ? 'bg-gray-50 opacity-70' : 'hover:bg-[#FF5900]/5'}`}>
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
                                            {u.activo == 1 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                                    Dado de baja
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
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
                                                        <button
                                                            onClick={() => abrirConfirmacion(u)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 ${
                                                                u.activo == 1
                                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                            }`}
                                                        >
                                                            {u.activo == 1 ? (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                    </svg>
                                                                    Dar de baja
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    Reactivar
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
                                ))}
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

            {/* Modal crear / editar usuario */}
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
                                    type="text"
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

            {/* Modal de confirmación: dar de baja / reactivar */}
            {confirmModal.open && confirmModal.usuario && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                confirmModal.accion === 'baja' ? 'bg-yellow-100' : 'bg-green-100'
                            }`}>
                                {confirmModal.accion === 'baja' ? (
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {confirmModal.accion === 'baja' ? 'Dar de baja usuario' : 'Reactivar usuario'}
                            </h2>
                        </div>

                        <p className="text-gray-600 mb-2">
                            ¿Estás seguro de que deseas{' '}
                            <strong>{confirmModal.accion === 'baja' ? 'dar de baja' : 'reactivar'}</strong>{' '}
                            a <strong>{confirmModal.usuario.nombre}</strong>?
                        </p>

                        <div className={`rounded-xl p-3 mb-4 text-sm ${
                            confirmModal.accion === 'baja'
                                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                                : 'bg-green-50 border border-green-200 text-green-800'
                        }`}>
                            {confirmModal.accion === 'baja' ? (
                                <>El usuario no podrá iniciar sesión, pero sus citas y datos históricos se conservan.</>
                            ) : (
                                <>El usuario podrá volver a iniciar sesión con sus credenciales actuales.</>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                disabled={confirmModal.procesando}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarAccion}
                                disabled={confirmModal.procesando}
                                className={`px-6 py-2 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                    confirmModal.accion === 'baja'
                                        ? 'bg-yellow-500 hover:bg-yellow-600'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {confirmModal.procesando
                                    ? 'Procesando...'
                                    : confirmModal.accion === 'baja'
                                        ? 'Sí, dar de baja'
                                        : 'Sí, reactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación: ELIMINAR usuario */}
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
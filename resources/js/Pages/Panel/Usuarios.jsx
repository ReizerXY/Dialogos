import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Usuarios({ usuarios, user }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
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
            put(route('usuarios.update', editUser.id), {
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

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            destroy(route('usuarios.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de usuarios" />
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Gestión de usuarios</h1>
                    <button
                        onClick={openCreateModal}
                        className="bg-[#FF5900] text-white px-4 py-2 rounded hover:bg-[#CC4700] flex items-center"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        + Nuevo usuario
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3">{u.id}</td>
                                    <td className="px-4 py-3">{u.usuario}</td>
                                    <td className="px-4 py-3">{u.nombre}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            u.rol === 'Coordinador' ? 'bg-purple-100 text-purple-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-1 flex flex-wrap">
                                        <button
                                            onClick={() => openEditModal(u)}
                                            className="inline-flex items-center px-3 py-1 bg-[#FF5900] text-white text-sm rounded hover:bg-[#CC4700] transition mb-1"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar
                                        </button>
                                        {u.usuario !== 'admin' && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition mb-1"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {usuarios.length === 0 && <p className="p-4 text-center text-gray-500">No hay usuarios registrados.</p>}
                </div>
            </div>

            {/* Modal de creación/edición (sin cambios) */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editUser ? 'Editar usuario' : 'Nuevo usuario'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                                <input
                                    type="text"
                                    value={data.usuario}
                                    onChange={e => setData('usuario', e.target.value)}
                                    className="w-full border rounded p-2"
                                    required
                                />
                                {errors.usuario && <p className="text-red-600 text-sm">{errors.usuario}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Clave</label>
                                <input
                                    type="text"
                                    value={data.clave}
                                    onChange={e => setData('clave', e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder={editUser ? 'Dejar vacío para no cambiar' : 'Mínimo 4 caracteres'}
                                />
                                {errors.clave && <p className="text-red-600 text-sm">{errors.clave}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    className="w-full border rounded p-2"
                                    required
                                />
                                {errors.nombre && <p className="text-red-600 text-sm">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rol</label>
                                <select
                                    value={data.rol}
                                    onChange={e => setData('rol', e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="Coordinador">Coordinador</option>
                                    <option value="Formador">Formador</option>
                                </select>
                                {errors.rol && <p className="text-red-600 text-sm">{errors.rol}</p>}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#FF5900] text-white rounded"
                                >
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
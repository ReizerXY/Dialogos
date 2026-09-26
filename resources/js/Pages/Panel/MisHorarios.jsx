// resources/js/Pages/Panel/MisHorarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

export default function MisHorarios({ horarios, user }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editHorario, setEditHorario] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, horario: null, loading: false });

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
    });

    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    const openCreateModal = () => {
        setEditHorario(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (horario) => {
        setEditHorario(horario);
        setData({
            dia_semana: horario.dia_semana,
            hora_inicio: horario.hora_inicio ? horario.hora_inicio.substring(0, 5) : '',
            hora_fin: horario.hora_fin ? horario.hora_fin.substring(0, 5) : '',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        reset();
        setEditHorario(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editHorario) {
            const url = `/mis-horarios/${editHorario.dia_semana}/${editHorario.hora_inicio?.substring(0, 5)}`;
            put(url, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    // ✅ Inertia ya refrescó la página con el redirect del controller
                },
            });
        } else {
            post(route('mis-horarios.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    // ✅ Inertia ya refrescó la página con el redirect del controller
                },
            });
        }
    };

    const handleDelete = (horario) => {
        setConfirmDelete({ open: true, horario, loading: false });
    };

    const confirmarEliminar = () => {
        const horario = confirmDelete.horario;
        if (!horario) return;

        setConfirmDelete(prev => ({ ...prev, loading: true }));

        const url = `/mis-horarios/${horario.dia_semana}/${horario.hora_inicio?.substring(0, 5)}`;
        destroy(url, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDelete({ open: false, horario: null, loading: false });
                // ✅ Inertia ya refrescó la página con el redirect del controller
            },
            onError: () => {
                setConfirmDelete(prev => ({ ...prev, loading: false }));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mis horarios" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Mis horarios</h1>
                        <p className="text-gray-500 mt-1">Administra tus horarios de disponibilidad</p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo horario
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {horarios.length === 0 ? (
                        <div className="py-16 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">Aún no tienes horarios registrados</p>
                            <p className="text-gray-400 text-sm mt-1">Crea tu primer horario para empezar.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Día</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora inicio</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora fin</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {horarios.map((h, index) => (
                                        <tr key={index} className="hover:bg-[#FF5900]/5 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-800 capitalize">{h.dia_semana}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700] font-mono">
                                                    {h.hora_inicio}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700 font-mono">{h.hora_fin}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(h)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-[#FF5900] text-white text-xs font-medium rounded-lg hover:bg-[#CC4700] transition-all duration-200 hover:shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Modificar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(h)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                        <span>Total: {horarios.length} horarios</span>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {editHorario ? 'Editar horario' : 'Nuevo horario'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Día de la semana</label>
                                <select
                                    value={data.dia_semana}
                                    onChange={e => setData('dia_semana', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    required
                                >
                                    <option value="">Seleccionar día</option>
                                    {diasSemana.map(d => (
                                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                    ))}
                                </select>
                                {errors.dia_semana && <p className="text-red-600 text-sm mt-1">{errors.dia_semana}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora inicio</label>
                                    <input
                                        type="time"
                                        value={data.hora_inicio}
                                        onChange={e => setData('hora_inicio', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                        step="1800"
                                        required
                                    />
                                    {errors.hora_inicio && <p className="text-red-600 text-sm mt-1">{errors.hora_inicio}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora fin</label>
                                    <input
                                        type="time"
                                        value={data.hora_fin}
                                        onChange={e => setData('hora_fin', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                        step="1800"
                                        required
                                    />
                                    {errors.hora_fin && <p className="text-red-600 text-sm mt-1">{errors.hora_fin}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, horario: null, loading: false })}
                onConfirm={confirmarEliminar}
                title="Eliminar horario"
                message={
                    confirmDelete.horario
                        ? `¿Estás seguro de eliminar el horario del ${confirmDelete.horario.dia_semana} de ${confirmDelete.horario.hora_inicio} a ${confirmDelete.horario.hora_fin}?`
                        : ''
                }
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                variant="danger"
                loading={confirmDelete.loading}
            />
        </AuthenticatedLayout>
    );
}
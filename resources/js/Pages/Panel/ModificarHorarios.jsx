import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ModificarHorarios({ horarios, formadores, filtroFormador, user }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editHorario, setEditHorario] = useState(null);
    const [filtro, setFiltro] = useState(filtroFormador || '');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        usuario_id: '',
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
            usuario_id: horario.usuario_id,
            dia_semana: horario.dia_semana,
            hora_inicio: horario.hora_inicio?.substring(0, 5) || '',
            hora_fin: horario.hora_fin?.substring(0, 5) || '',
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
            const url = `/admin/horarios/${editHorario.usuario_id}/${editHorario.dia_semana}/${editHorario.hora_inicio?.substring(0, 5)}`;
            put(url, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.horarios.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (horario) => {
        if (confirm(`¿Estás seguro de eliminar este horario de ${horario.nombre_formador}?`)) {
            const url = `/admin/horarios/${horario.usuario_id}/${horario.dia_semana}/${horario.hora_inicio?.substring(0, 5)}`;
            destroy(url);
        }
    };

    const applyFilter = () => {
        window.location.href = `/admin/horarios?formador=${filtro}`;
    };

    const clearFilter = () => {
        window.location.href = '/admin/horarios';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Modificar Horarios" />
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h1 className="text-2xl font-bold">Modificar Horarios</h1>
                    <div className="flex items-center gap-2">
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Todos los formadores</option>
                            {formadores.map(f => (
                                <option key={f.id} value={f.id}>{f.nombre}</option>
                            ))}
                        </select>
                        <button onClick={applyFilter} className="bg-[#FF5900] text-white px-4 py-2 rounded">Filtrar</button>
                        <button onClick={clearFilter} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Limpiar</button>
                        <button onClick={openCreateModal} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            + Nuevo horario
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formador</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora inicio</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora fin</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {horarios.map((h, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3">{h.nombre_formador}</td>
                                    <td className="px-4 py-3 capitalize">{h.dia_semana}</td>
                                    <td className="px-4 py-3">{h.hora_inicio?.substring(0,5)}</td>
                                    <td className="px-4 py-3">{h.hora_fin?.substring(0,5)}</td>
                                    <td className="px-4 py-3 space-x-1">
                                        <button
                                            onClick={() => openEditModal(h)}
                                            className="inline-flex items-center px-3 py-1 bg-[#FF5900] text-white text-sm rounded hover:bg-[#CC4700] transition"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(h)}
                                            className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {horarios.length === 0 && <p className="p-4 text-center text-gray-500">No hay horarios registrados.</p>}
                </div>
            </div>

            {/* Modal de creación/edición (sin cambios) */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editHorario ? 'Editar horario' : 'Nuevo horario'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Formador</label>
                                <select
                                    value={data.usuario_id}
                                    onChange={e => setData('usuario_id', e.target.value)}
                                    className="w-full border rounded p-2"
                                    required
                                >
                                    <option value="">Seleccionar formador</option>
                                    {formadores.map(f => (
                                        <option key={f.id} value={f.id}>{f.nombre}</option>
                                    ))}
                                </select>
                                {errors.usuario_id && <p className="text-red-600 text-sm">{errors.usuario_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Día de la semana</label>
                                <select
                                    value={data.dia_semana}
                                    onChange={e => setData('dia_semana', e.target.value)}
                                    className="w-full border rounded p-2"
                                    required
                                >
                                    <option value="">Seleccionar día</option>
                                    {diasSemana.map(d => (
                                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                    ))}
                                </select>
                                {errors.dia_semana && <p className="text-red-600 text-sm">{errors.dia_semana}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora inicio</label>
                                    <input
                                        type="time"
                                        value={data.hora_inicio}
                                        onChange={e => setData('hora_inicio', e.target.value)}
                                        className="w-full border rounded p-2"
                                        required
                                    />
                                    {errors.hora_inicio && <p className="text-red-600 text-sm">{errors.hora_inicio}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora fin</label>
                                    <input
                                        type="time"
                                        value={data.hora_fin}
                                        onChange={e => setData('hora_fin', e.target.value)}
                                        className="w-full border rounded p-2"
                                        required
                                    />
                                    {errors.hora_fin && <p className="text-red-600 text-sm">{errors.hora_fin}</p>}
                                </div>
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
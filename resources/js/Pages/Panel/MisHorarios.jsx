// resources/js/Pages/Panel/MisHorarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const DIAS_COLORES = {
    'lunes':     { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-200' },
    'martes':    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'miércoles': { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200' },
    'jueves':    { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-200' },
    'viernes':   { bg: 'bg-pink-100',    text: 'text-pink-800',    border: 'border-pink-200' },
    'sábado':    { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-200' },
    'domingo':   { bg: 'bg-gray-100',    text: 'text-gray-700',    border: 'border-gray-200' },
};

function clasesDia(dia) {
    const c = DIAS_COLORES[dia] || DIAS_COLORES['domingo'];
    return `${c.bg} ${c.text} ${c.border}`;
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    return esMovil || window.innerWidth < 768;
}

export default function MisHorarios({ horarios, user }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editHorario, setEditHorario] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, horario: null, loading: false });
    const [esMovil, setEsMovil] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
    });

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

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
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('mis-horarios.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
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
            onSuccess: () => setConfirmDelete({ open: false, horario: null, loading: false }),
            onError: () => setConfirmDelete(prev => ({ ...prev, loading: false })),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mis horarios" />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Mis horarios</h1>
                        <p className="text-gray-500 mt-1">
                            {horarios.length} {horarios.length === 1 ? 'bloque registrado' : 'bloques registrados'}
                        </p>
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

                {horarios.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">Aún no tienes horarios registrados</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                            Registra tu disponibilidad para que los estudiantes puedan agendar citas contigo.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear mi primer horario
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                        {/* Móvil: cards */}
                        {esMovil && (
                            <div className="divide-y divide-gray-100">
                                {horarios.map((h, index) => (
                                    <div key={index} className="px-4 py-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${clasesDia(h.dia_semana)}`}>
                                                {capitalizar(h.dia_semana)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#FF5900]/10 text-[#CC4700]">
                                                {h.hora_inicio}
                                            </span>
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-700">
                                                {h.hora_fin}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => openEditModal(h)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition active:scale-95"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Modificar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(h)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition active:scale-95"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Desktop: tabla */}
                        {!esMovil && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-white">
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Día</th>
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Hora inicio</th>
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Hora fin</th>
                                            <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {horarios.map((h, index) => (
                                            <tr key={index} className="hover:bg-[#FF5900]/5 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${clasesDia(h.dia_semana)}`}>
                                                        {capitalizar(h.dia_semana)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700] font-mono">
                                                        {h.hora_inicio}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 font-mono">{h.hora_fin}</span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(h)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Modificar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(h)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                    </div>
                )}
            </div>

            {/* Modal crear / editar */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                    {editHorario ? 'Editar horario' : 'Nuevo horario'}
                                </h2>
                                <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                                aria-label="Cerrar"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Día de la semana</label>
                                <select
                                    value={data.dia_semana}
                                    onChange={e => setData('dia_semana', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    required
                                    autoFocus
                                >
                                    <option value="">Seleccionar día</option>
                                    {DIAS_SEMANA.map(d => (
                                        <option key={d} value={d}>{capitalizar(d)}</option>
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

                            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Guardar
                                        </>
                                    )}
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
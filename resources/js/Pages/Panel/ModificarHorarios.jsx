// resources/js/Pages/Panel/ModificarHorarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
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

export default function ModificarHorarios({
    horarios,
    formadores,
    filtroFormador,
    filtroDia,
    filtroHoraDesde,
    filtroHoraHasta,
    user,
}) {
    const { flash } = usePage().props;

    const [filtro, setFiltro]           = useState(filtroFormador || '');
    const [diaFilter, setDiaFilter]     = useState(filtroDia || '');
    const [horaDesde, setHoraDesde]     = useState(filtroHoraDesde || '');
    const [horaHasta, setHoraHasta]     = useState(filtroHoraHasta || '');
    const [filtrosOpen, setFiltrosOpen] = useState(false);

    const [modalOpen, setModalOpen]         = useState(false);
    const [editHorario, setEditHorario]     = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, horario: null, loading: false });
    const [esMovil, setEsMovil] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [formadorExpandido, setFormadorExpandido] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        id_usuario: '',
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

    // Flash messages
    useEffect(() => {
        if (flash?.success) setMensaje({ tipo: 'success', texto: flash.success });
        else if (flash?.error) setMensaje({ tipo: 'error', texto: flash.error });
        if (flash?.success || flash?.error) {
            const t = setTimeout(() => setMensaje(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    // Abre modal para crear sin formador pre-seleccionado
    const openCreateModal = () => {
        setEditHorario(null);
        reset();
        setModalOpen(true);
    };

    // Abre modal para crear con formador pre-seleccionado
    const openCreateModalPara = (idUsuario) => {
        setEditHorario(null);
        reset();
        setData('id_usuario', String(idUsuario));
        setModalOpen(true);
    };

    const openEditModal = (horario) => {
        setEditHorario(horario);
        setData({
            id_usuario:  horario.id_usuario,
            dia_semana:  horario.dia_semana,
            hora_inicio: horario.hora_inicio ? horario.hora_inicio.substring(0, 5) : '',
            hora_fin:    horario.hora_fin    ? horario.hora_fin.substring(0, 5)    : '',
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
            const url = `/admin/horarios/${editHorario.id_usuario}/${editHorario.dia_semana}/${editHorario.hora_inicio?.substring(0, 5)}`;
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
        setConfirmDelete({ open: true, horario, loading: false });
    };

    const confirmarEliminar = () => {
        const horario = confirmDelete.horario;
        if (!horario) return;
        setConfirmDelete(prev => ({ ...prev, loading: true }));
        const url = `/admin/horarios/${horario.id_usuario}/${horario.dia_semana}/${horario.hora_inicio?.substring(0, 5)}`;
        destroy(url, {
            preserveScroll: true,
            onSuccess: () => setConfirmDelete({ open: false, horario: null, loading: false }),
            onError: () => setConfirmDelete(prev => ({ ...prev, loading: false })),
        });
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filtro)    params.append('formador', filtro);
        if (diaFilter) params.append('dia', diaFilter);
        if (horaDesde) params.append('hora_desde', horaDesde);
        if (horaHasta) params.append('hora_hasta', horaHasta);
        window.location.href = `/admin/horarios?${params.toString()}`;
    };

    const clearFilters = () => { window.location.href = '/admin/horarios'; };

    const limpiarFiltroIndividual = (key) => {
        const params = new URLSearchParams(window.location.search);
        params.delete(key);
        window.location.href = `/admin/horarios?${params.toString()}`;
    };

    const filtrosActivos = [filtro, diaFilter, horaDesde, horaHasta].filter(Boolean).length;

    const chipsFiltros = useMemo(() => {
        const chips = [];

        if (filtroFormador) {
            const f = formadores.find(x => String(x.id_usuario) === String(filtroFormador));
            chips.push({
                key: 'formador',
                label: 'Formador',
                valor: f?.nombre || `#${filtroFormador}`,
                onRemove: () => limpiarFiltroIndividual('formador'),
            });
        }
        if (filtroDia) {
            chips.push({
                key: 'dia',
                label: 'Día',
                valor: capitalizar(filtroDia),
                onRemove: () => limpiarFiltroIndividual('dia'),
            });
        }
        if (filtroHoraDesde) {
            chips.push({
                key: 'hora_desde',
                label: 'Desde',
                valor: filtroHoraDesde,
                onRemove: () => limpiarFiltroIndividual('hora_desde'),
            });
        }
        if (filtroHoraHasta) {
            chips.push({
                key: 'hora_hasta',
                label: 'Hasta',
                valor: filtroHoraHasta,
                onRemove: () => limpiarFiltroIndividual('hora_hasta'),
            });
        }

        return chips;
    }, [filtroFormador, filtroDia, filtroHoraDesde, filtroHoraHasta, formadores]);

    // Agrupar horarios por formador. Si hay filtro, solo muestra ese formador.
    const formadoresAgrupados = useMemo(() => {
        const lista = filtroFormador
            ? formadores.filter(f => String(f.id_usuario) === String(filtroFormador))
            : formadores;

        return lista.map(f => ({
            id_usuario: f.id_usuario,
            nombre: f.nombre,
            horarios: horarios.filter(h => h.id_usuario === f.id_usuario),
        }));
    }, [formadores, horarios, filtroFormador]);

    const toggleFormador = (id_usuario) => {
        setFormadorExpandido(prev => prev === id_usuario ? null : id_usuario);
    };

    const totalHorarios = horarios.length;

    return (
        <AuthenticatedLayout>
            <Head title="Modificar Horarios" />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Modificar horarios</h1>
                        <p className="text-gray-500 mt-1">
                            Administra los horarios de disponibilidad de los formadores
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

                {/* Flash message */}
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
                            onClick={clearFilters}
                            className="text-xs text-gray-500 hover:text-[#FF5900] underline font-medium ml-1 transition-colors"
                        >
                            Limpiar todos
                        </button>
                    </div>
                )}

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Formador</label>
                                    <select
                                        value={filtro}
                                        onChange={(e) => setFiltro(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    >
                                        <option value="">Todos los formadores</option>
                                        {formadores.map(f => (
                                            <option key={f.id_usuario} value={f.id_usuario}>{f.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Día de la semana</label>
                                    <select
                                        value={diaFilter}
                                        onChange={(e) => setDiaFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    >
                                        <option value="">Todos los días</option>
                                        {DIAS_SEMANA.map(d => (
                                            <option key={d} value={d}>{capitalizar(d)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora desde</label>
                                    <input
                                        type="time"
                                        value={horaDesde}
                                        onChange={(e) => setHoraDesde(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora hasta</label>
                                    <input
                                        type="time"
                                        value={horaHasta}
                                        onChange={(e) => setHoraHasta(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-gray-100">
                                <button
                                    onClick={applyFilters}
                                    className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Aplicar filtros
                                    </span>
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista por formador */}
                {formadoresAgrupados.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">No hay formadores para mostrar</p>
                        <p className="text-gray-500 text-sm mt-1">Agrega formadores al sistema para asignarles horarios.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formadoresAgrupados.map(f => {
                            const expandido = formadorExpandido === f.id_usuario;
                            const cantidad = f.horarios.length;

                            return (
                                <div key={f.id_usuario} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                    {/* Header del acordeón */}
                                    <button
                                        onClick={() => toggleFormador(f.id_usuario)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FF5900]/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-semibold text-gray-800 truncate">
                                                    {f.nombre}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {cantidad === 0
                                                        ? 'Sin horarios registrados'
                                                        : `${cantidad} ${cantidad === 1 ? 'bloque' : 'bloques'} de horario`}
                                                </p>
                                            </div>
                                        </div>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Contenido */}
                                    {expandido && (
                                        <div className="border-t border-gray-100 bg-gray-50/30">
                                            {cantidad === 0 ? (
                                                <div className="px-5 py-8 text-center">
                                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium">Este formador aún no tiene horarios</p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCreateModalPara(f.id_usuario);
                                                        }}
                                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF5900] text-white text-sm font-medium rounded-lg hover:bg-[#CC4700] transition active:scale-95"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Agregar horario
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Móvil: cards */}
                                                    {esMovil && (
                                                        <div className="divide-y divide-gray-100">
                                                            {f.horarios.map((h, i) => (
                                                                <div key={i} className="px-4 py-3">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${clasesDia(h.dia_semana)}`}>
                                                                            {capitalizar(h.dia_semana)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mb-3 text-sm">
                                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#FF5900]/10 text-[#CC4700]">
                                                                            {h.hora_inicio?.substring(0, 5)}
                                                                        </span>
                                                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                        </svg>
                                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-700">
                                                                            {h.hora_fin?.substring(0, 5)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); openEditModal(h); }}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition active:scale-95"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Modificar
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDelete(h); }}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition active:scale-95"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                            <table className="min-w-full">
                                                                <thead>
                                                                    <tr className="bg-white/50">
                                                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Día</th>
                                                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Hora inicio</th>
                                                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Hora fin</th>
                                                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Acciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {f.horarios.map((h, i) => (
                                                                        <tr key={i} className="hover:bg-[#FF5900]/5 transition-colors">
                                                                            <td className="px-5 py-3 whitespace-nowrap">
                                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${clasesDia(h.dia_semana)}`}>
                                                                                    {capitalizar(h.dia_semana)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-5 py-3 whitespace-nowrap">
                                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700] font-mono">
                                                                                    {h.hora_inicio?.substring(0, 5)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-5 py-3 whitespace-nowrap">
                                                                                <span className="text-sm text-gray-700 font-mono">
                                                                                    {h.hora_fin?.substring(0, 5)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-5 py-3 whitespace-nowrap">
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); openEditModal(h); }}
                                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                                                    >
                                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                        </svg>
                                                                                        Modificar
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); handleDelete(h); }}
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
                                                                </tbody>
                                                            </table>

                                                            {/* Botón agregar horario al formador */}
                                                            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); openCreateModalPara(f.id_usuario); }}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5900] text-white text-sm font-medium rounded-lg hover:bg-[#CC4700] transition active:scale-95"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                    Agregar horario a {f.nombre}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer resumen */}
                {formadoresAgrupados.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-4 flex flex-wrap justify-between items-center gap-3 text-sm">
                        <span className="text-gray-600">
                            <strong className="text-gray-800">{totalHorarios}</strong>{' '}
                            {totalHorarios === 1 ? 'bloque total' : 'bloques totales'}
                        </span>
                        {filtrosActivos > 0 && (
                            <span className="text-[#CC4700] text-xs font-medium">
                                Filtros activos: {filtrosActivos}
                            </span>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Formador</label>
                                <select
                                    value={data.id_usuario}
                                    onChange={e => setData('id_usuario', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    required
                                    autoFocus
                                    disabled={!!editHorario}
                                >
                                    <option value="">Seleccionar formador</option>
                                    {formadores.map(f => (
                                        <option key={f.id_usuario} value={f.id_usuario}>{f.nombre}</option>
                                    ))}
                                </select>
                                {editHorario && (
                                    <p className="text-xs text-gray-500 mt-1">El formador no se puede modificar en edición.</p>
                                )}
                                {errors.id_usuario && <p className="text-red-600 text-sm mt-1">{errors.id_usuario}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Día de la semana</label>
                                <select
                                    value={data.dia_semana}
                                    onChange={e => setData('dia_semana', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                    required
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
                        ? `¿Estás seguro de eliminar el horario de ${confirmDelete.horario.nombre_formador} del ${confirmDelete.horario.dia_semana} de ${confirmDelete.horario.hora_inicio} a ${confirmDelete.horario.hora_fin}?`
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
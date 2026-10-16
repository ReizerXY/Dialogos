// resources/js/Pages/Panel/Horarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

// Color único por día de la semana
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

// Detecta movil / pantalla chica
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    return esMovil || window.innerWidth < 768;
}

export default function Horarios({ horarios, formadores, filtros = {}, user }) {
    const [formadorFilter, setFormadorFilter] = useState(filtros.formador || '');
    const [diaFilter, setDiaFilter]           = useState(filtros.dia || '');
    const [horaDesde, setHoraDesde]           = useState(filtros.hora_desde || '');
    const [horaHasta, setHoraHasta]           = useState(filtros.hora_hasta || '');

    const [filtrosOpen, setFiltrosOpen] = useState(false);
    const [formadorExpandido, setFormadorExpandido] = useState(null);
    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (formadorFilter) params.append('formador', formadorFilter);
        if (diaFilter)      params.append('dia', diaFilter);
        if (horaDesde)      params.append('hora_desde', horaDesde);
        if (horaHasta)      params.append('hora_hasta', horaHasta);
        window.location.href = `/horarios?${params.toString()}`;
    };

    const clearFilters = () => { window.location.href = '/horarios'; };

    const limpiarFiltroIndividual = (key) => {
        const params = new URLSearchParams(window.location.search);
        params.delete(key);
        window.location.href = `/horarios?${params.toString()}`;
    };

    const filtrosActivos = [formadorFilter, diaFilter, horaDesde, horaHasta].filter(Boolean).length;

    // Chips de filtros activos
    const chipsFiltros = useMemo(() => {
        const chips = [];

        if (filtros.formador) {
            const f = formadores.find(x => String(x.id_usuario) === String(filtros.formador));
            chips.push({
                key: 'formador',
                label: 'Formador',
                valor: f?.nombre || `#${filtros.formador}`,
                onRemove: () => limpiarFiltroIndividual('formador'),
            });
        }
        if (filtros.dia) {
            chips.push({
                key: 'dia',
                label: 'Día',
                valor: capitalizar(filtros.dia),
                onRemove: () => limpiarFiltroIndividual('dia'),
            });
        }
        if (filtros.hora_desde) {
            chips.push({
                key: 'hora_desde',
                label: 'Desde',
                valor: filtros.hora_desde,
                onRemove: () => limpiarFiltroIndividual('hora_desde'),
            });
        }
        if (filtros.hora_hasta) {
            chips.push({
                key: 'hora_hasta',
                label: 'Hasta',
                valor: filtros.hora_hasta,
                onRemove: () => limpiarFiltroIndividual('hora_hasta'),
            });
        }

        return chips;
    }, [filtros, formadores]);

    // Agrupa horarios por formador. Si hay filtro de formador, solo muestra ese.
    const formadoresAgrupados = useMemo(() => {
        const lista = filtros.formador
            ? formadores.filter(f => String(f.id_usuario) === String(filtros.formador))
            : formadores;

        return lista.map(f => ({
            id_usuario: f.id_usuario,
            nombre: f.nombre,
            horarios: horarios.filter(h => h.id_usuario === f.id_usuario),
        }));
    }, [formadores, horarios, filtros.formador]);

    const totalHorarios = horarios.length;
    const formadoresConHorarios = formadoresAgrupados.filter(f => f.horarios.length > 0).length;

    const toggleFormador = (id_usuario) => {
        setFormadorExpandido(prev => prev === id_usuario ? null : id_usuario);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Horarios" />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Horarios de formadores</h1>
                    <p className="text-gray-500 mt-1">
                        Consulta la disponibilidad de cada formador por día y hora
                    </p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Formador</label>
                                    <select
                                        value={formadorFilter}
                                        onChange={(e) => setFormadorFilter(e.target.value)}
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

                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
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

                {/* Empty state global */}
                {formadoresAgrupados.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">No hay formadores para mostrar</p>
                        <p className="text-gray-500 text-sm mt-1">Agrega formadores al sistema para ver sus horarios.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formadoresAgrupados.map(f => {
                            const expandido = formadorExpandido === f.id_usuario;
                            const esPropio = f.id_usuario === user?.id_usuario;
                            const cantidad = f.horarios.length;

                            return (
                                <div key={f.id_usuario} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                    {/* Header del acordeón */}
                                    <button
                                        onClick={() => toggleFormador(f.id_usuario)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${esPropio ? 'bg-[#FF5900]/15' : 'bg-gray-100'}`}>
                                                <svg className={`w-5 h-5 ${esPropio ? 'text-[#FF5900]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-base font-semibold text-gray-800 truncate">
                                                        {f.nombre}
                                                    </p>
                                                    {esPropio && (
                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5900]/15 text-[#CC4700] uppercase tracking-wide">
                                                            Tú
                                                        </span>
                                                    )}
                                                </div>
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

                                    {/* Contenido del acordeón */}
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
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Cuando se registren horarios, aparecerán aquí.
                                                    </p>
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
                                                                    <div className="flex items-center gap-2 text-sm">
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
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
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
                            {formadoresConHorarios > 0 && (
                                <> · <strong className="text-gray-800">{formadoresConHorarios}</strong> {formadoresConHorarios === 1 ? 'formador con horarios' : 'formadores con horarios'}</>
                            )}
                        </span>
                        {filtrosActivos > 0 && (
                            <span className="text-[#CC4700] text-xs font-medium">
                                Filtros activos: {filtrosActivos}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
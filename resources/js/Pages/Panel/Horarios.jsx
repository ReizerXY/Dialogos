import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export default function Horarios({ horarios, formadores, filtros = {}, user }) {
    // ============================================================
    // ESTADOS DE FILTROS
    // ============================================================
    const [formadorFilter, setFormadorFilter] = useState(filtros.formador || '');
    const [diaFilter, setDiaFilter]           = useState(filtros.dia || '');
    const [horaDesde, setHoraDesde]           = useState(filtros.hora_desde || '');
    const [horaHasta, setHoraHasta]           = useState(filtros.hora_hasta || '');

    const [filtrosOpen, setFiltrosOpen] = useState(false);

    // ============================================================
    // APLICAR / LIMPIAR
    // ============================================================
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (formadorFilter) params.append('formador', formadorFilter);
        if (diaFilter)      params.append('dia', diaFilter);
        if (horaDesde)      params.append('hora_desde', horaDesde);
        if (horaHasta)      params.append('hora_hasta', horaHasta);
        window.location.href = `/horarios?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/horarios';
    };

    // ============================================================
    // CONTADOR DE FILTROS ACTIVOS
    // ============================================================
    const filtrosActivos = [
        formadorFilter,
        diaFilter,
        horaDesde,
        horaHasta,
    ].filter(Boolean).length;

    // Nombre del formador filtrado (para chip inferior)
    const formadorFiltradoNombre = formadorFilter
        ? formadores.find(f => String(f.id_usuario) === String(formadorFilter))?.nombre
        : null;

    // ============================================================
    // AGRUPAR POR FORMADOR
    // ============================================================
    const formadoresUnicos = new Set(horarios.map(h => h.nombre_formador)).size;

    return (
        <AuthenticatedLayout>
            <Head title="Horarios" />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Horarios de formadores</h1>
                        <p className="text-gray-500 mt-1">Consulta la disponibilidad de cada formador por día y hora</p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* Filtros (colapsables) */}
                {/* ============================================================ */}
                <div className="bg-white rounded-2xl shadow-md mb-8 border border-gray-100 overflow-hidden">
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
                        <div className="px-6 pb-6">
                            {/* Fila: Formador, Día, Hora desde, Hora hasta */}
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
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 capitalize"
                                    >
                                        <option value="">Todos los días</option>
                                        {DIAS_SEMANA.map(d => (
                                            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
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

                            {/* Botones */}
                            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                                <div className="flex gap-3 ml-auto">
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

                            {/* Nota de contexto */}
                            {!filtrosActivos && (
                                <p className="text-xs text-[#FF5900] flex items-center mt-3">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Mostrando todos los horarios activos de formadores
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* Tabla de horarios */}
                {/* ============================================================ */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {horarios.length === 0 ? (
                        <div className="py-16 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No hay horarios para mostrar</p>
                            <p className="text-gray-400 text-sm mt-1">No se encontraron horarios con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Formador</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Día</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora inicio</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora fin</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {horarios.map((h, index) => (
                                        <tr key={index} className="hover:bg-[#FF5900]/5 transition-colors duration-150 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${h.id_usuario === user?.id_usuario ? 'bg-[#FF5900]' : 'bg-gray-300'}`}></div>
                                                    <span className={`text-sm ${h.id_usuario === user?.id_usuario ? 'font-semibold text-[#FF5900]' : 'font-medium text-gray-800'}`}>
                                                        {h.nombre_formador}
                                                        {h.id_usuario === user?.id_usuario && ' (tú)'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700 capitalize">{h.dia_semana}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700] font-mono">
                                                    {h.hora_inicio?.substring(0, 5)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700 font-mono">{h.hora_fin?.substring(0, 5)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer con resumen */}
                    {horarios.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2 text-sm text-gray-500">
                            <span>
                                Total: <strong className="text-gray-700">{horarios.length}</strong> {horarios.length === 1 ? 'hora' : 'horas'}
                                {formadoresUnicos > 1 && <> · <strong className="text-gray-700">{formadoresUnicos}</strong> formadores</>}
                            </span>
                            {filtrosActivos > 0 && (
                                <span className="text-[#FF5900]">
                                    Filtros activos: {filtrosActivos}
                                    {formadorFiltradoNombre && ` · ${formadorFiltradoNombre}`}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
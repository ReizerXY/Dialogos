// resources/js/Pages/Panel/Citas/FiltrosCitas.jsx
import { useState, useEffect } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';
import SelectClasificacionColor from './SelectClasificacionColor';

// Panel de filtros reutilizable. Todas las props son controladas por el padre.
export default function FiltrosCitas({
    mostrarFiltroFormador,
    formadores,
    aniosDisponibles,
    gradosActivos,
    gruposPorGrado,
    filtros,
    setters,
    onAplicar,
    onLimpiar,
    abierto,
    setAbierto,
}) {
    const {
        formadorFilter, estadoFilter, clasificacionFilter, asistenciaFilter,
        gradoFilter, grupoFilter,
        anioFilter, mesFilter, semanaValorFilter, fechaFilter,
        periodoFilter,
    } = filtros;

    const {
        setFormadorFilter, setEstadoFilter, setClasificacionFilter, setAsistenciaFilter,
        setGradoFilter, setGrupoFilter,
        setAnioFilter, setMesFilter, setSemanaValorFilter, setFechaFilter,
        setPeriodoFilter,
    } = setters;

    // Detecta cuál filtro de fecha está activo
    const fechaActiva = (() => {
        if (anioFilter) return 'anio';
        if (mesFilter) return 'mes';
        if (semanaValorFilter) return 'semana';
        if (fechaFilter) return 'fecha';
        return null;
    })();

    // Tab activo dentro del bloque de fecha
    const [tabFecha, setTabFecha] = useState(fechaActiva || 'anio');

    // Si el filtro activo cambia desde afuera, sincroniza la tab
    useEffect(() => {
        if (fechaActiva) setTabFecha(fechaActiva);
    }, [fechaActiva]);

    // Handlers de fecha (cada uno limpia los otros)
    const handleAnioChange = (valor) => {
        setAnioFilter(valor);
        if (valor) { setMesFilter(''); setSemanaValorFilter(''); setFechaFilter(''); }
    };
    const handleMesChange = (valor) => {
        setMesFilter(valor);
        if (valor) { setAnioFilter(''); setSemanaValorFilter(''); setFechaFilter(''); }
    };
    const handleSemanaChange = (valor) => {
        setSemanaValorFilter(valor);
        if (valor) { setAnioFilter(''); setMesFilter(''); setFechaFilter(''); }
    };
    const handleFechaChange = (valor) => {
        setFechaFilter(valor);
        if (valor) { setAnioFilter(''); setMesFilter(''); setSemanaValorFilter(''); }
    };

    const limpiarFecha = () => {
        setAnioFilter('');
        setMesFilter('');
        setSemanaValorFilter('');
        setFechaFilter('');
    };

    const gruposDisponibles = gradoFilter ? (gruposPorGrado[gradoFilter] || []) : [];

    // Cuenta cuántos filtros están activos
    const filtrosActivos = [
        formadorFilter, estadoFilter, clasificacionFilter, asistenciaFilter,
        gradoFilter, grupoFilter,
        anioFilter, mesFilter, semanaValorFilter, fechaFilter,
        periodoFilter !== 'actual' ? periodoFilter : null,
    ].filter(Boolean).length;

    // Etiqueta del tab activo con su valor (para mostrar en el chip)
    const valorTabActivo = (() => {
        if (tabFecha === 'anio') return anioFilter;
        if (tabFecha === 'mes') return mesFilter;
        if (tabFecha === 'semana') return semanaValorFilter;
        if (tabFecha === 'fecha') return fechaFilter;
        return '';
    })();

    return (
        <div className="bg-white rounded-2xl shadow-md mb-6 border border-gray-100 overflow-visible">
            <button
                onClick={() => setAbierto(!abierto)}
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
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${abierto ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className={`transition-all duration-300 ease-in-out ${abierto ? 'max-h-[1400px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'}`}>
                <div className="px-6 pb-6">
                    {/* Fila 1: Formador, Estado, Clasificación, Asistencia */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {mostrarFiltroFormador && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Formador</label>
                                <select
                                    value={formadorFilter}
                                    onChange={(e) => setFormadorFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                >
                                    <option value="">Todos</option>
                                    {formadores?.map(f => (
                                        <option key={f.id_usuario} value={f.id_usuario}>{f.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                            <select
                                value={estadoFilter}
                                onChange={(e) => setEstadoFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                            >
                                <option value="">Todos los estados</option>
                                <option value="programada">Programada</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="cancelada_liberada">Cancelada (liberada)</option>
                                <option value="completada">Completada</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Clasificación</label>
                            <SelectClasificacionColor
                                value={clasificacionFilter}
                                onChange={setClasificacionFilter}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asistencia</label>
                            <select
                                value={asistenciaFilter}
                                onChange={(e) => setAsistenciaFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                            >
                                <option value="">Todas las asistencias</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="asistió">Asistió</option>
                                <option value="no asistió">No asistió</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 2: Grado y Grupo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Grado</label>
                            <select
                                value={gradoFilter}
                                onChange={(e) => setGradoFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                            >
                                <option value="">Todos los grados</option>
                                {gradosActivos.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Grupo
                                {!gradoFilter && <span className="text-gray-400 ml-1">(elige grado)</span>}
                            </label>
                            <select
                                value={grupoFilter}
                                onChange={(e) => setGrupoFilter(e.target.value)}
                                disabled={!gradoFilter}
                                className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 ${!gradoFilter ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                            >
                                <option value="">Todos los grupos</option>
                                {gruposDisponibles.map(g => (
                                    <option key={g} value={g}>Grupo {g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fila 3: Filtro de fecha con tabs */}
                    <div className="bg-gray-50/60 rounded-xl p-4 mb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <label className="text-sm font-semibold text-gray-700">Filtro de fecha</label>
                            {fechaActiva && (
                                <button
                                    type="button"
                                    onClick={limpiarFecha}
                                    className="ml-auto text-xs text-[#CC4700] hover:text-[#FF5900] underline font-medium"
                                >
                                    Quitar filtro de fecha
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                            {[
                                { key: 'anio',   label: 'Año' },
                                { key: 'mes',    label: 'Mes' },
                                { key: 'semana', label: 'Semana' },
                                { key: 'fecha',  label: 'Fecha específica' },
                            ].map(({ key, label }) => {
                                const tieneValor = (() => {
                                    if (key === 'anio') return !!anioFilter;
                                    if (key === 'mes') return !!mesFilter;
                                    if (key === 'semana') return !!semanaValorFilter;
                                    if (key === 'fecha') return !!fechaFilter;
                                    return false;
                                })();
                                const activo = tabFecha === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            if (tabFecha !== key) {
                                                limpiarFecha();
                                                setTabFecha(key);
                                            }
                                        }}
                                        className={`relative px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                                            activo
                                                ? 'bg-[#FF5900] border-[#FF5900] text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {label}
                                        {tieneValor && !activo && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5900]"></span>
                                        )}
                                        {tieneValor && activo && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Input dinámico según tab */}
                        {tabFecha === 'anio' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Selecciona el año</label>
                                <select
                                    value={anioFilter}
                                    onChange={(e) => handleAnioChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                >
                                    <option value="">Cualquier año</option>
                                    {aniosDisponibles.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {tabFecha === 'mes' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Selecciona el mes</label>
                                <input
                                    type="month"
                                    value={mesFilter}
                                    onChange={(e) => handleMesChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                />
                            </div>
                        )}

                        {tabFecha === 'semana' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Selecciona la semana</label>
                                <SelectorSemana
                                    value={semanaValorFilter}
                                    onChange={handleSemanaChange}
                                    label=""
                                />
                            </div>
                        )}

                        {tabFecha === 'fecha' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Selecciona la fecha</label>
                                <input
                                    type="date"
                                    value={fechaFilter}
                                    onChange={(e) => handleFechaChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                />
                            </div>
                        )}

                        {valorTabActivo && (
                            <p className="mt-3 text-xs text-[#CC4700] flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Filtro de fecha activo
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Vista rápida:</label>
                            <select
                                value={periodoFilter}
                                onChange={(e) => setPeriodoFilter(e.target.value)}
                                disabled={!!fechaActiva}
                                className={`px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 text-sm ${fechaActiva ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}
                            >
                                <option value="actual">Semana actual</option>
                                <option value="todas">Todas</option>
                            </select>
                            {fechaActiva && (
                                <span className="text-xs text-gray-500">(desactivada por filtro de fecha)</span>
                            )}
                        </div>

                        <div className="flex gap-3 ml-auto">
                            <button
                                onClick={onAplicar}
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
                                onClick={onLimpiar}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>

                    {!fechaActiva && periodoFilter === 'actual' && (
                        <p className="text-xs text-[#FF5900] flex items-center mt-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mostrando citas desde hoy hasta 7 días después
                        </p>
                    )}

                    {!fechaActiva && periodoFilter === 'todas' && (
                        <p className="text-xs text-[#FF5900] flex items-center mt-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mostrando todas las citas registradas (cualquier estado y fecha)
                        </p>
                    )}

                    {fechaActiva && (
                        <p className="text-xs text-[#FF5900] flex items-center mt-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mostrando todas las citas del periodo seleccionado
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
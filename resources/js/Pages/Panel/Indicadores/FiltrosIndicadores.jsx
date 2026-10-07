// resources/js/Pages/Panel/Indicadores/FiltrosIndicadores.jsx
import SelectorSemana from '@/Components/SelectorSemana';

// Panel de filtros de Indicadores (año, mes, semana, grado, grupo)
export default function FiltrosIndicadores({
    // Estado controlado
    anio, mes, semana, grado, grupo,
    // Setters con exclusividad
    onChangeAnio, onChangeMes, onChangeSemana,
    setGrado, setGrupo,
    // Datos para selects
    aniosDisponibles, gradosActivos, gruposDisponibles,
    // Filtros activos según server
    filtroAnio, filtroMes, filtroSemana, filtroGrado, filtroGrupo,
    // Hint
    hintFechaActiva,
    // Acciones
    onAplicar, onLimpiar,
    // UI
    abierto, setAbierto,
}) {
    const activosCount = [filtroAnio, filtroMes, filtroSemana, filtroGrado, filtroGrupo].filter(Boolean).length;

    return (
        <div className="bg-white rounded-2xl shadow-md mb-6 border border-gray-100 overflow-hidden">
            <button onClick={() => setAbierto(!abierto)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-base font-semibold text-gray-800">Filtros de búsqueda</span>
                    {activosCount > 0 && (
                        <span className="text-sm text-[#CC4700] bg-[#FF5900]/10 rounded-full px-2.5 py-0.5">
                            {activosCount} activo{activosCount === 1 ? '' : 's'}
                        </span>
                    )}
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${abierto ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${abierto ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por año</label>
                            <select
                                value={anio}
                                onChange={(e) => onChangeAnio(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white text-gray-700"
                            >
                                <option value="">Todos</option>
                                {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por mes</label>
                            <input
                                type="month"
                                value={mes}
                                onChange={(e) => onChangeMes(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por semana</label>
                            <SelectorSemana value={semana} onChange={(n) => onChangeSemana(n)} label="" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por grado</label>
                            <select value={grado} onChange={(e) => setGrado(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white text-gray-700">
                                <option value="">Todos los grados</option>
                                {gradosActivos.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                Filtrar por grupo
                                {!grado && <span className="text-gray-400 ml-1">(elige grado)</span>}
                            </label>
                            <select
                                value={grupo}
                                onChange={(e) => setGrupo(e.target.value)}
                                disabled={!grado}
                                className={`w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white text-gray-700 ${!grado ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                            >
                                <option value="">Todos los grupos</option>
                                {gruposDisponibles.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                            </select>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                        {hintFechaActiva}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                        <button onClick={onAplicar} className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] transition active:scale-95">Aplicar filtros</button>
                        <button onClick={onLimpiar} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition active:scale-95">Limpiar filtros</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
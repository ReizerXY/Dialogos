// resources/js/Pages/Panel/Estudiantes/FiltrosEstudiantes.jsx

export default function FiltrosEstudiantes({
    abierto, setAbierto,
    busquedaInput, setBusquedaInput,
    gradoInput, setGradoInput,
    grupoInput, setGrupoInput,
    gradosDisponibles, gruposDisponiblesInput,
    filtrosActivos,
    onAplicar, onLimpiar,
}) {
    return (
        <div className="bg-white rounded-2xl shadow-md mb-6 border border-gray-100 overflow-hidden">
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

            <div className={`transition-all duration-300 ease-in-out ${abierto ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar por nombre, apellido o ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={busquedaInput}
                                    onChange={(e) => setBusquedaInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAplicar(); } }}
                                    placeholder="Ej. Daniela, García o 800001"
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Grado</label>
                            <select
                                value={gradoInput}
                                onChange={(e) => setGradoInput(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                            >
                                <option value="">Todos los grados</option>
                                {gradosDisponibles.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Grupo
                                {!gradoInput && <span className="text-gray-400 ml-1">(elige grado)</span>}
                            </label>
                            <select
                                value={grupoInput}
                                onChange={(e) => setGrupoInput(e.target.value)}
                                disabled={!gradoInput}
                                className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 ${!gradoInput ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                            >
                                <option value="">Todos los grupos</option>
                                {gruposDisponiblesInput.map(g => (
                                    <option key={g} value={g}>Grupo {g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={onAplicar}
                            className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtrar
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
            </div>
        </div>
    );
}
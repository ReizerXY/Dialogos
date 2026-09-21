// resources/js/Pages/Panel/Reportes.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';

export default function Reportes({ user, catalogo, aniosDisponibles }) {
    const anios = aniosDisponibles && aniosDisponibles.length > 0
        ? aniosDisponibles
        : [new Date().getFullYear()];

    const [tipo, setTipo] = useState('ejecutivo');
    const [periodo, setPeriodo] = useState('mes');
    const [semana, setSemana] = useState('');
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState(String(anios[0]));
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState('');
    // ✅ Estado para tooltip
    const [tooltip, setTooltip] = useState(null);

    // Secciones seleccionadas por tipo
    const [seccionesPorTipo, setSeccionesPorTipo] = useState(() => {
        const inicial = {};
        Object.entries(catalogo).forEach(([key, info]) => {
            inicial[key] = Object.entries(info.secciones)
                .filter(([_, cfg]) => cfg.default)
                .map(([secKey]) => secKey);
        });
        return inicial;
    });

    function getWeekNumber(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }

    function getMondayOfLastWeek() {
        const hoy = new Date();
        const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay();
        const lunesEstaSemana = new Date(hoy);
        lunesEstaSemana.setDate(hoy.getDate() - (diaSemana - 1));
        const lunesSemanaPasada = new Date(lunesEstaSemana);
        lunesSemanaPasada.setDate(lunesEstaSemana.getDate() - 7);
        return lunesSemanaPasada;
    }

    useEffect(() => {
        if (periodo === 'semana') {
            const lunesPasado = getMondayOfLastWeek();
            const year = lunesPasado.getFullYear();
            const semanaNum = getWeekNumber(lunesPasado);
            setSemana(`${year}-W${String(semanaNum).padStart(2, '0')}`);
            setMes('');
            setFechaInicio('');
            setFechaFin('');
        } else if (periodo === 'mes') {
            const inicio = new Date();
            inicio.setMonth(inicio.getMonth() - 1);
            inicio.setDate(1);
            const year = inicio.getFullYear();
            const mesNum = inicio.getMonth() + 1;
            setMes(`${year}-${String(mesNum).padStart(2, '0')}`);
            setSemana('');
            setFechaInicio('');
            setFechaFin('');
        } else if (periodo === 'anio') {
            setAnio(String(anios[0]));
            setSemana('');
            setMes('');
            setFechaInicio('');
            setFechaFin('');
        } else {
            setSemana('');
            setMes('');
            setFechaInicio('');
            setFechaFin('');
        }
    }, [periodo]);

    useEffect(() => {
        setError('');
    }, [tipo, periodo, semana, mes, anio, fechaInicio, fechaFin]);

    const seccionesActuales = seccionesPorTipo[tipo] || [];
    const infoActual = catalogo[tipo];

    const toggleSeccion = (seccionKey) => {
        setSeccionesPorTipo(prev => {
            const actual = prev[tipo] || [];
            const nuevas = actual.includes(seccionKey)
                ? actual.filter(k => k !== seccionKey)
                : [...actual, seccionKey];
            return { ...prev, [tipo]: nuevas };
        });
        setError('');
    };

    const seleccionarTodas = () => {
        const todas = Object.keys(infoActual.secciones);
        setSeccionesPorTipo(prev => ({ ...prev, [tipo]: todas }));
        setError('');
    };

    const deseleccionarTodas = () => {
        setSeccionesPorTipo(prev => ({ ...prev, [tipo]: [] }));
        setError('');
    };

    const handleGenerarPDF = (e) => {
        e.preventDefault();
        setError('');

        if (seccionesActuales.length === 0) {
            setError('Debes seleccionar al menos una sección para generar el reporte.');
            return;
        }

        if (generando) return;
        setGenerando(true);

        const params = new URLSearchParams();
        params.append('tipo', tipo);
        params.append('periodo', periodo);

        if (periodo === 'semana' && semana) params.append('semana', semana);
        else if (periodo === 'mes' && mes) params.append('mes', mes);
        else if (periodo === 'anio' && anio) params.append('anio', anio);
        else if (periodo === 'libre') {
            if (fechaInicio) params.append('fecha_inicio', fechaInicio);
            if (fechaFin) params.append('fecha_fin', fechaFin);
        }

        seccionesActuales.forEach(sec => params.append('secciones[]', sec));

        const url = `/reportes/generar?${params.toString()}`;

        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setGenerando(false), 1200);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reportes" />
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                    <p className="text-gray-500 mt-1">Genera reportes en PDF personalizados con los datos del programa</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tipo de reporte */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-3">Tipo de reporte</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(catalogo).map(([key, info]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTipo(key)}
                                        className={`text-left px-4 py-3 rounded-xl border transition ${
                                            tipo === key
                                                ? 'bg-[#FF5900]/5 border-[#FF5900] shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className={`text-sm font-semibold ${tipo === key ? 'text-[#FF5900]' : 'text-gray-800'}`}>
                                            {info.titulo}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 leading-snug">{info.descripcion}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Periodo */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-3">Periodo</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {[
                                    { value: 'semana', label: 'Semana' },
                                    { value: 'mes', label: 'Mes' },
                                    { value: 'anio', label: 'Año' },
                                    { value: 'libre', label: 'Rango libre' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setPeriodo(opt.value)}
                                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                                            periodo === opt.value
                                                ? 'bg-[#FF5900] border-[#FF5900] text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {periodo === 'semana' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Semana específica</label>
                                    <SelectorSemana value={semana} onChange={(n) => setSemana(n)} label="" />
                                </div>
                            )}

                            {periodo === 'mes' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Mes específico</label>
                                    <input
                                        type="month"
                                        value={mes}
                                        onChange={(e) => setMes(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                        required
                                    />
                                </div>
                            )}

                            {periodo === 'anio' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                        Año
                                        <span className="text-gray-400 ml-1">(solo años con citas registradas)</span>
                                    </label>
                                    <select
                                        value={anio}
                                        onChange={(e) => setAnio(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white"
                                    >
                                        {anios.map(a => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {periodo === 'libre' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha inicio</label>
                                        <input
                                            type="date"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha fin</label>
                                        <input
                                            type="date"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contenido del reporte */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800">
                                        Contenido del reporte
                                    </label>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Selecciona qué secciones quieres incluir en el PDF. Pasa el mouse sobre el ícono <strong>?</strong> para ver los detalles.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={seleccionarTodas}
                                        className="text-xs px-3 py-1.5 bg-[#FF5900] text-white rounded-lg hover:bg-[#CC4700] transition"
                                    >
                                        Todas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deseleccionarTodas}
                                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        Ninguna
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {Object.entries(infoActual.secciones).map(([secKey, secInfo]) => {
                                    const activa = seccionesActuales.includes(secKey);
                                    return (
                                        <div
                                            key={secKey}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                                                activa
                                                    ? 'bg-[#FF5900]/5 border-[#FF5900]/30'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                id={`sec-${secKey}`}
                                                type="checkbox"
                                                checked={activa}
                                                onChange={() => toggleSeccion(secKey)}
                                                className="w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900] cursor-pointer"
                                            />
                                            <label
                                                htmlFor={`sec-${secKey}`}
                                                className={`text-sm cursor-pointer flex-1 ${activa ? 'text-gray-800 font-medium' : 'text-gray-600'}`}
                                            >
                                                {secInfo.label}
                                            </label>

                                            {/* ✅ Ícono de info con tooltip */}
                                            <div
                                                className="relative"
                                                onMouseEnter={() => setTooltip(secKey)}
                                                onMouseLeave={() => setTooltip(null)}
                                            >
                                                <button
                                                    type="button"
                                                    className="text-gray-400 hover:text-[#FF5900] transition-colors focus:outline-none"
                                                    aria-label={`Información: ${secInfo.label}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>

                                                {tooltip === secKey && secInfo.descripcion && (
                                                    <div className="absolute right-0 bottom-full mb-3 w-72 z-50">
                                                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
                                                            <div className="font-semibold text-[#FF5900] mb-1">{secInfo.label}</div>
                                                            <div>{secInfo.descripcion}</div>
                                                            <div className="absolute top-full right-4 -mt-px">
                                                                <div className="w-2.5 h-2.5 bg-gray-900 rotate-45"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                                <span className="text-gray-500">
                                    <strong className="text-gray-800">{seccionesActuales.length}</strong> de{' '}
                                    {Object.keys(infoActual.secciones).length} secciones seleccionadas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Resumen lateral */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-3">Resumen del reporte</h3>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Tipo</div>
                                    <div className="text-gray-800 font-medium mt-0.5">{infoActual.titulo}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Periodo</div>
                                    <div className="text-gray-800 font-medium mt-0.5">
                                        {periodo === 'semana' && (semana || 'Semana actual')}
                                        {periodo === 'mes' && (mes || 'Mes actual')}
                                        {periodo === 'anio' && `Año ${anio}`}
                                        {periodo === 'libre' && (
                                            fechaInicio && fechaFin
                                                ? `${fechaInicio} → ${fechaFin}`
                                                : 'Rango por definir'
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Secciones</div>
                                    <div className="text-gray-800 font-medium mt-0.5">
                                        {seccionesActuales.length} seleccionada{seccionesActuales.length === 1 ? '' : 's'}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleGenerarPDF}
                                disabled={generando || seccionesActuales.length === 0}
                                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5900] text-white font-semibold rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generando ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generar reporte
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-xs text-gray-400 text-center leading-snug">
                                El PDF se descargará automáticamente con las secciones seleccionadas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
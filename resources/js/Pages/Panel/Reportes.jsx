// resources/js/Pages/Panel/Reportes.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';

// ✅ Detector de dispositivo móvil / pantalla chica.
// Los navegadores móviles bloquean la previsualización de PDFs
// dentro de iframes con blob:, así que en esos casos mostramos
// un aviso y el botón de descarga en lugar del iframe.
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

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
    const [tooltip, setTooltip] = useState(null);

    // Preview
    const [previewModal, setPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewFilename, setPreviewFilename] = useState('');

    // ✅ Detección de móvil
    const [esMovil, setEsMovil] = useState(false);

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

    // ✅ Detectar móvil al montar + cuando cambia el tamaño de pantalla
    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Cerrar preview con ESC
    useEffect(() => {
        if (!previewModal) return;
        const onKey = (e) => { if (e.key === 'Escape') cerrarPreview(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [previewModal, previewUrl]);

    // Bloquear scroll del body mientras el modal está abierto
    useEffect(() => {
        if (!previewModal) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [previewModal]);

    // Liberar blob al desmontar
    useEffect(() => {
        return () => {
            if (previewUrl) window.URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

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

    const construirParams = () => {
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
        return params;
    };

    const handleGenerarPDF = async (e) => {
        e.preventDefault();
        setError('');

        if (seccionesActuales.length === 0) {
            setError('Debes marcar al menos una sección para poder generar el reporte.');
            return;
        }

        if (generando) return;
        setGenerando(true);

        try {
            const params = construirParams();

            const response = await fetch(`/reportes/preview?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/pdf',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Error al generar el PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            let filename = 'reporte.pdf';
            const disposition = response.headers.get('Content-Disposition');
            if (disposition) {
                const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
                if (match && match[1]) filename = decodeURIComponent(match[1]);
            }

            setPreviewUrl(url);
            setPreviewFilename(filename);
            setPreviewModal(true);
        } catch (err) {
            setError('No se pudo generar el reporte. Intenta de nuevo.');
        } finally {
            setGenerando(false);
        }
    };

    const handleDescargar = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = previewFilename || 'reporte.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const cerrarPreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewFilename('');
        setPreviewModal(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reportes" />
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                    <p className="text-gray-500 mt-1">
                        Genera reportes en PDF con los datos del programa. Puedes elegir qué información incluir en cada uno.
                    </p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tipo de reporte */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">¿Qué tipo de reporte quieres generar?</label>
                            <p className="text-xs text-gray-500 mb-3">Elige el enfoque del reporte. Cada tipo muestra información distinta.</p>
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
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Periodo del reporte</label>
                            <p className="text-xs text-gray-500 mb-3">¿Qué fechas debe cubrir el reporte?</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {[
                                    { value: 'semana', label: 'Una semana' },
                                    { value: 'mes', label: 'Un mes' },
                                    { value: 'anio', label: 'Un año' },
                                    { value: 'libre', label: 'Fechas personalizadas' },
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
                                        <span className="text-gray-400 ml-1">(solo se muestran los años con citas registradas)</span>
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
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Desde</label>
                                        <input
                                            type="date"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Hasta</label>
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
                            <div className="flex items-start justify-between mb-4 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800">
                                        ¿Qué información quieres incluir?
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Marca las secciones que aparecerán en el PDF. Pasa el cursor sobre el ícono <strong>?</strong> para ver qué muestra cada una.
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={seleccionarTodas}
                                        className="text-xs px-3 py-1.5 bg-[#FF5900] text-white rounded-lg hover:bg-[#CC4700] transition"
                                    >
                                        Marcar todas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deseleccionarTodas}
                                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        Quitar todas
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

                                            <div
                                                className="relative"
                                                onMouseEnter={() => setTooltip(secKey)}
                                                onMouseLeave={() => setTooltip(null)}
                                            >
                                                <button
                                                    type="button"
                                                    className="text-gray-400 hover:text-[#FF5900] transition-colors focus:outline-none"
                                                    aria-label={`Más información sobre: ${secInfo.label}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>

                                                {tooltip === secKey && secInfo.descripcion && (
                                                    <div className="absolute right-0 bottom-full mb-3 w-80 z-50">
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
                                    {Object.keys(infoActual.secciones).length} secciones marcadas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Resumen lateral */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-3">Revisa antes de generar</h3>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Tipo de reporte</div>
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
                                                ? `Del ${fechaInicio} al ${fechaFin}`
                                                : 'Fechas por definir'
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Secciones marcadas</div>
                                    <div className="text-gray-800 font-medium mt-0.5">
                                        {seccionesActuales.length} {seccionesActuales.length === 1 ? 'sección' : 'secciones'}
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
                                        Generando PDF...
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
                                Al hacer clic, el PDF se abrirá en una vista previa. Desde ahí podrás descargarlo o cerrarlo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MODAL DE VISTA PREVIA (OPTIMIZADO) ================= */}
            {previewModal && previewUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
                    <div
                        className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden isolate"
                        style={{
                            boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
                            transform: 'translateZ(0)',
                            contain: 'layout paint',
                        }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {esMovil ? 'Reporte generado' : 'Vista previa del reporte'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{previewFilename}</p>
                            </div>
                            <button
                                type="button"
                                onClick={cerrarPreview}
                                className="text-gray-400 hover:text-gray-700 transition-colors p-1 flex-shrink-0"
                                aria-label="Cerrar vista previa"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* En escritorio: iframe con el PDF.
                            En móvil: aviso + botón, porque los navegadores móviles
                            bloquean la previsualización de PDFs en iframes con blob:. */}
                        {esMovil ? (
                            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-8">
                                <div className="max-w-sm text-center">
                                    <div className="mx-auto w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-semibold text-gray-800">
                                        Tu reporte está listo
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                        Los navegadores móviles no permiten ver PDFs aquí dentro.
                                        Toca el botón de abajo para <strong>descargar</strong> o <strong>abrir</strong> el archivo.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex-1 bg-gray-100 overflow-hidden"
                                style={{ contain: 'strict' }}
                            >
                                <iframe
                                    src={previewUrl}
                                    title="Vista previa del reporte"
                                    className="w-full h-full border-0 block"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
                            <button
                                type="button"
                                onClick={cerrarPreview}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={handleDescargar}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white font-semibold rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {esMovil ? 'Descargar PDF' : 'Descargar PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
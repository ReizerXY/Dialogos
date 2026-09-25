// resources/js/Pages/Panel/Indicadores.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';

const CLASIFICACION_COLOR_BLOCK = {
    'académica':     'bg-blue-500',
    'familiar':      'bg-green-500',
    'emocional':     'bg-purple-500',
    'espiritual':    'bg-pink-500',
    'institucional': 'bg-amber-500',
};

const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function mesTitulo(mesYMD) {
    if (!mesYMD) return '';
    const [year, month] = mesYMD.split('-');
    return `${MESES_ES[parseInt(month, 10) - 1]} ${year}`;
}

function semanaTitulo(semanaISO) {
    if (!semanaISO) return '';
    const [year, weekPart] = semanaISO.split('-W');
    return `semana ${parseInt(weekPart, 10)} de ${year}`;
}

function formatHora12(hora24) {
    if (!hora24) return '';
    const [h, m] = hora24.split(':');
    let hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'pm' : 'am';
    if (hNum === 0) hNum = 12;
    else if (hNum > 12) hNum -= 12;
    return `${hNum}:${m} ${ampm}`;
}

// Helper para capitalizar (para el tooltip)
function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const SECCIONES_INFO = [
    { key: 'kpis',         label: 'Números principales',                    default: true },
    { key: 'distribucion', label: 'Cómo se distribuyen las citas',          default: true },
    { key: 'tendencias',   label: 'Cómo cambian las citas en el tiempo',    default: true },
    { key: 'destacados',   label: 'Formadores y estudiantes con más citas', default: true },
    { key: 'comparativas', label: 'Comparación con periodos anteriores',    default: true },
    { key: 'formadores',   label: 'Actividad de cada formador',             default: true },
    { key: 'citas',        label: 'Listado de citas',                       default: true },
    { key: 'estudiantes',  label: 'Estudiantes por grado y grupo',          default: true },
];

const SECCIONES_KEYS = SECCIONES_INFO.map(s => s.key);
const TODAS_COLAPSADAS   = Object.fromEntries(SECCIONES_KEYS.map(k => [k, true]));
const TODOS_SUB_CERRADOS = { estado: false, clasificacion: false, asistencia: false };
const SUB_TEND_CERRADOS  = { mes: false, dia: false, hora: false };

export default function Indicadores({
    totalFormadores, totalEstudiantes, totalCitas, promedioCitasPorFormador,
    estudiantesAtendidos, tasaCompletacion, tasaCancelacion, tasaAsistencia,
    estudiantesAgrupados, gradosActivos, gruposActivos, gruposPorGrado,
    citasPorEstado, citasPorClasificacion, citasPorAsistencia, citasPorHora,
    formadoresTop, estudiantesTop, detalleFormadores,
    citasPorMes, citasPorDiaSemana,
    comparativaSemana, comparativaMes,
    citasDelPeriodo, user,
    filtroAnio, filtroMes, filtroSemana, filtroGrado, filtroGrupo, aniosDisponibles
}) {
    const [anio,   setAnio]   = useState(filtroAnio   || '');
    const [mes,    setMes]    = useState(filtroMes    || '');
    const [semana, setSemana] = useState(filtroSemana || '');
    const [grado,  setGrado]  = useState(filtroGrado  || '');
    const [grupo,  setGrupo]  = useState(filtroGrupo  || '');

    const [personalizadorOpen, setPersonalizadorOpen] = useState(false);
    const [filtrosOpen, setFiltrosOpen] = useState(false);

    const [secciones, setSecciones] = useState(() => {
        if (typeof window === 'undefined') return Object.fromEntries(SECCIONES_INFO.map(s => [s.key, s.default]));
        try {
            const g = localStorage.getItem('indicadores_secciones_v11');
            if (g) return { ...Object.fromEntries(SECCIONES_INFO.map(s => [s.key, s.default])), ...JSON.parse(g) };
        } catch {}
        return Object.fromEntries(SECCIONES_INFO.map(s => [s.key, s.default]));
    });

    const [colapsadas, setColapsadas] = useState(TODAS_COLAPSADAS);
    const [subDist, setSubDist] = useState(TODOS_SUB_CERRADOS);
    const [subTend, setSubTend] = useState(SUB_TEND_CERRADOS);
    const [estudiantesExpandidos, setEstudiantesExpandidos] = useState({});
    const [formadoresExpandidos, setFormadoresExpandidos] = useState({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('indicadores_secciones_v11', JSON.stringify(secciones));
        }
    }, [secciones]);

    useEffect(() => {
        if (grado && grupo) {
            const disp = gruposPorGrado[grado] || [];
            if (!disp.includes(grupo)) setGrupo('');
        }
    }, [grado, gruposPorGrado]);

    const toggleSeccion = (k) => {
        setSecciones(p => ({ ...p, [k]: !p[k] }));
        setColapsadas(TODAS_COLAPSADAS);
        setSubDist(TODOS_SUB_CERRADOS);
        setSubTend(SUB_TEND_CERRADOS);
    };

    const toggleColapsada  = (k) => setColapsadas(p => ({ ...p, [k]: !p[k] }));
    const toggleSubDist    = (k) => setSubDist(p => ({ ...p, [k]: !p[k] }));
    const toggleSubTend    = (k) => setSubTend(p => ({ ...p, [k]: !p[k] }));
    const toggleGradoGrupo = (k) => setEstudiantesExpandidos(p => ({ ...p, [k]: !p[k] }));
    const toggleFormador   = (k) => setFormadoresExpandidos(p => ({ ...p, [k]: !p[k] }));

    const mostrarTodo = () => {
        setSecciones(Object.fromEntries(SECCIONES_INFO.map(s => [s.key, true])));
        setColapsadas(TODAS_COLAPSADAS);
        setSubDist(TODOS_SUB_CERRADOS);
        setSubTend(SUB_TEND_CERRADOS);
    };
    const ocultarTodo = () => {
        setSecciones(Object.fromEntries(SECCIONES_INFO.map(s => [s.key, false])));
        setColapsadas(TODAS_COLAPSADAS);
    };

    const formatFecha = (f) => {
        if (!f) return '';
        const p = f.split('-');
        return `${p[2]}-${p[1]}-${p[0]}`;
    };

    const estadoColores = {
        programada:         { pill: 'bg-yellow-50 border-yellow-200 text-yellow-800', dot: 'bg-yellow-400' },
        cancelada:          { pill: 'bg-red-50 border-red-200 text-red-800',           dot: 'bg-red-400' },
        cancelada_liberada: { pill: 'bg-orange-50 border-orange-200 text-orange-800',  dot: 'bg-orange-400' },
        completada:         { pill: 'bg-green-50 border-green-200 text-green-800',     dot: 'bg-green-400' },
    };
    const estadoLabels = {
        programada: 'Programada',
        cancelada: 'Cancelada',
        cancelada_liberada: 'Cancelada (horario disponible)',
        completada: 'Completada',
    };
    const asistenciaColores = {
        pendiente:    { pill: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
        asistió:      { pill: 'bg-green-50 border-green-200 text-green-800', dot: 'bg-green-400' },
        'no asistió': { pill: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-400' },
    };

    const aplicarFiltros = () => {
        const params = new URLSearchParams();
        if (anio) params.append('anio', anio);
        if (mes) params.append('mes', mes);
        if (semana) params.append('semana', semana);
        if (grado) params.append('grado', grado);
        if (grupo) params.append('grupo', grupo);
        window.location.href = `/indicadores?${params.toString()}`;
    };
    const limpiarFiltros = () => { window.location.href = '/indicadores'; };

    const periodoTexto = (() => {
        if (filtroSemana) return `la ${semanaTitulo(filtroSemana)}`;
        if (filtroMes)    return mesTitulo(filtroMes);
        if (filtroAnio)   return `el año ${filtroAnio}`;
        const ahora = new Date();
        return `${MESES_ES[ahora.getMonth()]} ${ahora.getFullYear()}`;
    })();

    const contextoGradoGrupo = (() => {
        const partes = [];
        if (filtroGrado) partes.push(`grado ${filtroGrado}`);
        if (filtroGrupo) partes.push(`grupo ${filtroGrupo}`);
        return partes.length > 0 ? ` — ${partes.join(', ')}` : '';
    })();

    const contextoSingular = (() => {
        if (filtroSemana) return `de la ${semanaTitulo(filtroSemana)}`;
        if (filtroMes)    return `de ${mesTitulo(filtroMes)}`;
        if (filtroAnio)   return `del año ${filtroAnio}`;
        const ahora = new Date();
        return `de ${MESES_ES[ahora.getMonth()]} ${ahora.getFullYear()}`;
    })();

    const contextoTexto = (() => {
        if (filtroSemana) return `en la ${semanaTitulo(filtroSemana)}`;
        if (filtroMes)    return `en ${mesTitulo(filtroMes)}`;
        if (filtroAnio)   return `en el año ${filtroAnio}`;
        const ahora = new Date();
        return `en ${MESES_ES[ahora.getMonth()]} ${ahora.getFullYear()}`;
    })();

    const tituloCitas = (() => {
        if (filtroMes)    return `Todas las citas de ${mesTitulo(filtroMes)}${contextoGradoGrupo}`;
        if (filtroSemana) return `Todas las citas de la ${semanaTitulo(filtroSemana)}${contextoGradoGrupo}`;
        if (filtroAnio)   return `Todas las citas del año ${filtroAnio}${contextoGradoGrupo}`;
        return 'Próximas citas (próximos 7 días)';
    })();

    const mensajeSinCitas = filtroSemana
        ? 'No hay citas registradas en esa semana.'
        : filtroMes ? 'No hay citas registradas en ese mes.'
        : filtroAnio ? 'No hay citas registradas en ese año.'
        : 'No hay citas programadas en los próximos 7 días.';

    const claseDiff = (v) => v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-gray-500';
    const gruposDisponibles = grado ? (gruposPorGrado[grado] || []) : gruposActivos;

    return (
        <AuthenticatedLayout>
            <Head title="Indicadores" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Indicadores generales</h1>
                        <p className="text-base text-gray-500 mt-1">
                            Mostrando información de <strong className="text-[#FF5900]">{periodoTexto}</strong>
                            {filtroGrado && <> · Grado <strong>{filtroGrado}</strong></>}
                            {filtroGrupo && <> · Grupo <strong>{filtroGrupo}</strong></>}
                        </p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <button
                        onClick={() => setPersonalizadorOpen(!personalizadorOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Personalizar vista
                    </button>
                </div>

                {personalizadorOpen && (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Secciones visibles</h3>
                            <div className="flex gap-2">
                                <button onClick={mostrarTodo} className="text-sm px-3 py-1.5 bg-[#FF5900] text-white rounded-lg hover:bg-[#CC4700] transition">Mostrar todo</button>
                                <button onClick={ocultarTodo} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Ocultar todo</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {SECCIONES_INFO.map(sec => (
                                <label key={sec.key} className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2.5 transition">
                                    <input type="checkbox" checked={secciones[sec.key]} onChange={() => toggleSeccion(sec.key)} className="w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900]" />
                                    <span className="text-sm text-gray-700">{sec.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-md mb-6 border border-gray-100 overflow-hidden">
                    <button onClick={() => setFiltrosOpen(!filtrosOpen)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-base font-semibold text-gray-800">Filtros de búsqueda</span>
                            {(filtroAnio || filtroMes || filtroSemana || filtroGrado || filtroGrupo) && (
                                <span className="text-sm text-[#CC4700] bg-[#FF5900]/10 rounded-full px-2.5 py-0.5">
                                    {[filtroAnio, filtroMes, filtroSemana, filtroGrado, filtroGrupo].filter(Boolean).length} activo{[filtroAnio, filtroMes, filtroSemana, filtroGrado, filtroGrupo].filter(Boolean).length === 1 ? '' : 's'}
                                </span>
                            )}
                        </div>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${filtrosOpen ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${filtrosOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por año</label>
                                    <select value={anio} onChange={(e) => setAnio(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white text-gray-700">
                                        <option value="">Todos</option>
                                        {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por mes</label>
                                    <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white text-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Filtrar por semana</label>
                                    <SelectorSemana value={semana} onChange={(n) => setSemana(n)} label="" />
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
                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                                <button onClick={aplicarFiltros} className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] transition active:scale-95">Aplicar filtros</button>
                                <button onClick={limpiarFiltros} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition active:scale-95">Limpiar filtros</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1. Números principales */}
                {secciones.kpis && (
                    <SeccionColapsable titulo={`Números principales de ${periodoTexto}${contextoGradoGrupo}`} abierta={!colapsadas.kpis} onToggle={() => toggleColapsada('kpis')}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <KpiCard value={totalFormadores} titulo="Formadores activos" subtitulo="Cuentas habilitadas" />
                            <KpiCard value={totalEstudiantes} titulo="Estudiantes inscritos" subtitulo="Registrados en el sistema" />
                            <KpiCard value={totalCitas} titulo="Citas registradas" subtitulo={`En ${periodoTexto}`} />
                            <KpiCard value={promedioCitasPorFormador} titulo="Citas por formador" subtitulo="Promedio del periodo" />
                            <KpiCard value={estudiantesAtendidos} titulo="Estudiantes atendidos" subtitulo="Con al menos 1 cita" accent="blue" />
                            <KpiCard value={`${tasaCompletacion}%`} titulo="Citas ya atendidas" subtitulo={`${tasaCompletacion}% del total`} accent="green" />
                            <KpiCard value={`${tasaCancelacion}%`} titulo="Citas canceladas" subtitulo={`${tasaCancelacion}% del total`} accent="red" />
                            <KpiCard value={`${tasaAsistencia}%`} titulo="Asistencia de estudiantes" subtitulo="De citas con registro" accent="orange" />
                        </div>
                    </SeccionColapsable>
                )}

                {/* 2. Distribución */}
                {secciones.distribucion && (
                    <SeccionColapsable
                        titulo={`Cómo se distribuyen las citas de ${periodoTexto}${contextoGradoGrupo}`}
                        abierta={!colapsadas.distribucion}
                        onToggle={() => toggleColapsada('distribucion')}
                    >
                        <SubDesplegable titulo="Citas por situación" abierta={subDist.estado} onToggle={() => toggleSubDist('estado')}>
                            {Object.keys(citasPorEstado).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {['completada', 'programada', 'cancelada', 'cancelada_liberada'].map(estado => {
                                        if (!citasPorEstado[estado]) return null;
                                        const col = estadoColores[estado];
                                        return (
                                            <div key={estado} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${col.pill}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                                                <span className="text-sm font-medium">{estadoLabels[estado]}</span>
                                                <span className="text-base font-bold">{citasPorEstado[estado]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </SubDesplegable>

                        {/* Clasificación: solo color + número, tooltip con el nombre */}
                        <SubDesplegable titulo="Citas por tema tratado" abierta={subDist.clasificacion} onToggle={() => toggleSubDist('clasificacion')}>
                            {Object.keys(citasPorClasificacion).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(citasPorClasificacion).map(([clasif, total]) => (
                                        <div
                                            key={`c-${clasif}`}
                                            className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-help"
                                            title={capitalizar(clasif)}
                                        >
                                            <div className={`w-4 h-4 rounded ${CLASIFICACION_COLOR_BLOCK[clasif] || 'bg-gray-400'}`}></div>
                                            <span className="text-base font-bold text-gray-800">{total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </SubDesplegable>

                        <SubDesplegable titulo="Asistencia del estudiante a las citas" abierta={subDist.asistencia} onToggle={() => toggleSubDist('asistencia')}>
                            {Object.keys(citasPorAsistencia).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {['asistió', 'no asistió', 'pendiente'].map(asis => {
                                        if (!citasPorAsistencia[asis]) return null;
                                        const col = asistenciaColores[asis];
                                        return (
                                            <div key={asis} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${col.pill}`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                                                <span className="text-sm font-medium capitalize">{asis}</span>
                                                <span className="text-base font-bold">{citasPorAsistencia[asis]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </SubDesplegable>
                    </SeccionColapsable>
                )}

                {/* 3. Tendencias */}
                {secciones.tendencias && (
                    <SeccionColapsable
                        titulo={`Cómo cambian las citas de ${periodoTexto}${contextoGradoGrupo}`}
                        abierta={!colapsadas.tendencias}
                        onToggle={() => toggleColapsada('tendencias')}
                    >
                        <SubDesplegable
                            titulo="Citas por mes"
                            abierta={subTend.mes}
                            onToggle={() => toggleSubTend('mes')}
                        >
                            {citasPorMes.length > 0 ? (
                                <div className="space-y-2">
                                    {citasPorMes.map(item => (
                                        <TrendItem
                                            key={`m-${item.mes}`}
                                            titulo={mesTitulo(item.mes)}
                                            descripcion={`${item.total} ${item.total === 1 ? 'cita registrada' : 'citas registradas'}`}
                                            total={item.total}
                                        />
                                    ))}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </SubDesplegable>

                        <SubDesplegable
                            titulo="Citas por día de la semana"
                            abierta={subTend.dia}
                            onToggle={() => toggleSubTend('dia')}
                        >
                            {Object.keys(citasPorDiaSemana).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorDiaSemana).map(([dia, total]) => {
                                        const plural = total === 1 ? 'cita' : 'citas';
                                        const diaLower = dia.toLowerCase();
                                        const descripcion = filtroSemana
                                            ? `${total} ${plural} el ${diaLower} ${contextoSingular}`
                                            : `${total} ${plural} los ${diaLower} ${contextoSingular}`;
                                        return (
                                            <TrendItem
                                                key={`d-${dia}`}
                                                titulo={dia}
                                                descripcion={descripcion}
                                                total={total}
                                            />
                                        );
                                    })}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </SubDesplegable>

                        <SubDesplegable
                            titulo="Citas por hora del día"
                            abierta={subTend.hora}
                            onToggle={() => toggleSubTend('hora')}
                        >
                            {Object.keys(citasPorHora).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(citasPorHora).map(([hora, total]) => {
                                        const plural = total === 1 ? 'cita' : 'citas';
                                        const descripcion = `${total} ${plural} a las ${formatHora12(hora)} ${contextoTexto}`;
                                        return (
                                            <TrendItem
                                                key={`h-${hora}`}
                                                titulo={formatHora12(hora)}
                                                descripcion={descripcion}
                                                total={total}
                                            />
                                        );
                                    })}
                                </div>
                            ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                        </SubDesplegable>
                    </SeccionColapsable>
                )}

                {/* 4. Destacados */}
                {secciones.destacados && (
                    <SeccionColapsable
                        titulo={`Formadores y estudiantes con más citas de ${periodoTexto}${contextoGradoGrupo}`}
                        abierta={!colapsadas.destacados}
                        onToggle={() => toggleColapsada('destacados')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-base font-medium text-gray-500 mb-3">Formadores con más citas atendidas</h3>
                                {formadoresTop.length > 0 ? (
                                    <div className="space-y-2">
                                        {formadoresTop.map((item, i) => (
                                            <RankingItem
                                                key={`f-${i}`}
                                                posicion={i}
                                                nombre={item.nombre}
                                                etiqueta={`Ocupa el puesto #${i + 1} en el periodo`}
                                                total={item.total}
                                                unidad="cita"
                                            />
                                        ))}
                                    </div>
                                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-gray-500 mb-3">Estudiantes con más citas recibidas</h3>
                                {estudiantesTop.length > 0 ? (
                                    <div className="space-y-2">
                                        {estudiantesTop.map((item, i) => (
                                            <RankingItem
                                                key={`e-${i}`}
                                                posicion={i}
                                                nombre={item.nombre_estudiante}
                                                etiqueta={`Ocupa el puesto #${i + 1} en el periodo`}
                                                total={item.total}
                                                unidad="cita"
                                            />
                                        ))}
                                    </div>
                                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
                            </div>
                        </div>
                    </SeccionColapsable>
                )}

                {/* 5. Comparativas */}
                {secciones.comparativas && (
                    <SeccionColapsable
                        titulo={`Comparación de citas de ${periodoTexto}${contextoGradoGrupo}`}
                        abierta={!colapsadas.comparativas}
                        onToggle={() => toggleColapsada('comparativas')}
                    >
                        <div className={`grid grid-cols-1 gap-6 ${comparativaSemana.mostrar && comparativaMes.mostrar ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                            {comparativaSemana.mostrar && (
                                <ComparativaCard
                                    titulo={`Citas registradas: ${comparativaSemana.titulo}`}
                                    labelActual={comparativaSemana.labelActual}
                                    labelAnterior={comparativaSemana.labelAnterior}
                                    actual={comparativaSemana.actual}
                                    anterior={comparativaSemana.anterior}
                                    diff={comparativaSemana.diff}
                                    pct={comparativaSemana.pct}
                                    claseDiff={claseDiff}
                                />
                            )}
                            {comparativaMes.mostrar && (
                                <ComparativaCard
                                    titulo={`Citas registradas: ${comparativaMes.titulo}`}
                                    labelActual={comparativaMes.labelActual}
                                    labelAnterior={comparativaMes.labelAnterior}
                                    actual={comparativaMes.actual}
                                    anterior={comparativaMes.anterior}
                                    diff={comparativaMes.diff}
                                    pct={comparativaMes.pct}
                                    claseDiff={claseDiff}
                                />
                            )}
                        </div>
                    </SeccionColapsable>
                )}

                {/* 6. Actividad por formador */}
                {secciones.formadores && detalleFormadores.length > 0 && (
                    <SeccionColapsable
                        titulo={`Actividad de cada formador de ${periodoTexto}${contextoGradoGrupo}`}
                        abierta={!colapsadas.formadores}
                        onToggle={() => toggleColapsada('formadores')}
                    >
                        <div className="space-y-3">
                            {detalleFormadores.map((f, idx) => {
                                const expandido = !!formadoresExpandidos[f.nombre];
                                return (
                                    <div key={`det-${f.nombre}-${idx}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <button onClick={() => toggleFormador(f.nombre)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Medal position={idx} />
                                                <div className="min-w-0">
                                                    <div className="text-base font-semibold text-gray-800 truncate">{f.nombre}</div>
                                                    <div className="text-sm text-gray-500 mt-0.5">
                                                        Atendió a {f.estudiantesUnicos} estudiante{f.estudiantesUnicos === 1 ? '' : 's'} en el periodo
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 whitespace-nowrap">
                                                    <span className="font-bold text-gray-800">{f.total}</span>
                                                    <span>cita{f.total === 1 ? '' : 's'}</span>
                                                </span>
                                                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${expandido ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    <MiniStat label="Completadas" value={f.completadas} accent="green" />
                                                    <MiniStat label="Programadas" value={f.programadas} accent="yellow" />
                                                    <MiniStat label="Canceladas" value={f.canceladas} accent="red" />
                                                    <MiniStat label="% de asistencia" value={`${f.tasaAsistencia}%`} accent="orange" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <MiniStat label="Sí asistió" value={f.asistencias} />
                                                    <MiniStat label="No asistió" value={f.faltas} />
                                                </div>
                                                {f.clasificaciones.length > 0 && (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-600 mb-2">Temas más tratados</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {f.clasificaciones.map((c, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 cursor-help"
                                                                    title={capitalizar(c.clasificacion)}
                                                                >
                                                                    <div className={`w-4 h-4 rounded ${CLASIFICACION_COLOR_BLOCK[c.clasificacion] || 'bg-gray-400'}`}></div>
                                                                    <span className="text-base font-bold text-gray-800">{c.total}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SeccionColapsable>
                )}

                {/* 7. Listado de citas */}
                {secciones.citas && (
                    <SeccionColapsable titulo={tituloCitas} abierta={!colapsadas.citas} onToggle={() => toggleColapsada('citas')}>
                        {citasDelPeriodo.length > 0 ? (
                            <div className="overflow-x-auto -mx-6 -mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Formador</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {citasDelPeriodo.map(c => (
                                            <tr key={`cita-${c.id_cita}`} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3.5 text-base text-gray-700">{c.nombre_estudiante}</td>
                                                <td className="px-6 py-3.5 text-base text-gray-700">{c.nombre_formador}</td>
                                                <td className="px-6 py-3.5 text-base text-gray-700">{formatFecha(c.fecha)}</td>
                                                <td className="px-6 py-3.5 text-base text-gray-700">{c.hora?.substring(0,5)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center"><p className="text-gray-500 text-base">{mensajeSinCitas}</p></div>
                        )}
                    </SeccionColapsable>
                )}

                {/* 8. Estudiantes por grado/grupo */}
                {secciones.estudiantes && (
                    <SeccionColapsable titulo="Estudiantes registrados por grado y grupo" abierta={!colapsadas.estudiantes} onToggle={() => toggleColapsada('estudiantes')}>
                        <div className="space-y-4">
                            {Object.entries(estudiantesAgrupados).map(([gradoKey, grupos]) => (
                                <div key={`grado-${gradoKey}`} className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex items-center justify-between">
                                        <span className="text-base font-semibold text-gray-800">Grado {gradoKey}</span>
                                        <span className="text-sm text-gray-500">{grupos.reduce((s, g) => s + g.total, 0)} estudiantes</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
                                        {grupos.map((g) => {
                                            const key = `${gradoKey}-${g.grupo}`;
                                            const expandido = !!estudiantesExpandidos[key];
                                            return (
                                                <div key={key} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                                    <button onClick={() => toggleGradoGrupo(key)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left">
                                                        <div>
                                                            <div className="text-base font-semibold text-gray-800">Grupo {g.grupo}</div>
                                                            <div className="text-sm text-gray-500">{g.total} estudiantes</div>
                                                        </div>
                                                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <div className={`overflow-hidden transition-all duration-300 ${expandido ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        <ul className="border-t border-gray-100 divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                                                            {g.alumnos.map((al) => (
                                                                <li key={al.id_estudiante} className="px-4 py-2.5 text-sm text-gray-700 flex justify-between">
                                                                    <span>{al.nombre}</span>
                                                                    <span className="text-gray-400 font-mono text-xs">{al.id_estudiante}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(estudiantesAgrupados).length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">
                                    No hay estudiantes para el filtro seleccionado.
                                </p>
                            )}
                        </div>
                    </SeccionColapsable>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* ============================================================ */
/* COMPONENTES AUXILIARES                                       */
/* ============================================================ */

function SeccionColapsable({ titulo, abierta, onToggle, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden">
            <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#FF5900] rounded-full"></span>
                    {titulo}
                </h2>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${abierta ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${abierta ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-6 pb-6">{children}</div>
            </div>
        </div>
    );
}

function SubDesplegable({ titulo, abierta, onToggle, children }) {
    return (
        <div className="border border-gray-100 rounded-xl mb-3 overflow-hidden bg-gray-50/40">
            <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/60 transition text-left">
                <span className="text-base font-medium text-gray-700">{titulo}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${abierta ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${abierta ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="px-4 pb-4 pt-1">{children}</div>
            </div>
        </div>
    );
}

function TrendItem({ titulo, descripcion, total }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-gray-800">{titulo}</div>
                <div className="text-sm text-gray-500 mt-0.5">{descripcion}</div>
            </div>
            <div className="text-2xl font-bold text-[#FF5900] shrink-0">{total}</div>
        </div>
    );
}

function RankingItem({ posicion, nombre, etiqueta, total, unidad = 'cita' }) {
    const colores = ['bg-yellow-400', 'bg-gray-400', 'bg-orange-400'];
    const colorMedalla = posicion < 3 ? colores[posicion] : 'bg-gray-300';
    const plural = total === 1 ? '' : 's';

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shrink-0 ${colorMedalla}`}>
                    {posicion + 1}
                </span>
                <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-800 truncate">{nombre}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{etiqueta}</div>
                </div>
            </div>
            <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-2xl font-bold text-[#FF5900]">{total}</span>
                <span className="text-sm text-gray-500">{unidad}{plural}</span>
            </div>
        </div>
    );
}

function KpiCard({ value, titulo, subtitulo, accent = 'orange' }) {
    const accents = { orange: 'text-[#FF5900]', blue: 'text-blue-600', green: 'text-green-600', red: 'text-red-600' };
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center hover:shadow-lg transition-shadow">
            <div className={`text-3xl font-bold ${accents[accent]}`}>{value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1.5 leading-tight">{titulo}</div>
            {subtitulo && <div className="text-xs text-gray-400 mt-1 leading-tight">{subtitulo}</div>}
        </div>
    );
}

function MiniStat({ label, value, accent = 'gray' }) {
    const accents = { gray: 'text-gray-700', green: 'text-green-600', yellow: 'text-yellow-600', red: 'text-red-600', orange: 'text-[#FF5900]' };
    return (
        <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-center">
            <div className={`text-xl font-bold ${accents[accent]}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1 leading-tight uppercase tracking-wide">{label}</div>
        </div>
    );
}

function Medal({ position }) {
    const colors = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-300'];
    const color = position < 3 ? colors[position] : 'bg-gray-200';
    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold text-white shrink-0 ${color}`}>
            {position + 1}
        </span>
    );
}

function ComparativaCard({ titulo, labelActual, labelAnterior, actual, anterior, diff, pct, claseDiff }) {
    return (
        <div className="border border-gray-100 rounded-xl p-5 bg-white">
            <div className="mb-1">
                <h3 className="text-base font-semibold text-gray-800">{titulo}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Cantidad de citas registradas en cada periodo</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1.5">{labelActual}</div>
                    <div className="text-3xl font-bold text-[#FF5900]">{actual}</div>
                    <div className="text-xs text-gray-400 mt-1">citas registradas</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1.5">{labelAnterior}</div>
                    <div className="text-3xl font-bold text-gray-600">{anterior}</div>
                    <div className="text-xs text-gray-400 mt-1">citas registradas</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-base border-t border-gray-100 pt-3">
                <span className="text-gray-500">
                    Diferencia de citas
                </span>
                <span className={`font-bold ${claseDiff(diff)}`}>
                    {diff > 0 ? '+' : ''}{diff} ({pct > 0 ? '+' : ''}{pct}%)
                </span>
            </div>
        </div>
    );
}
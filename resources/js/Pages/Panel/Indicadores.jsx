// resources/js/Pages/Panel/Indicadores.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import { SECCIONES_INFO, MESES_ES, mesTitulo, semanaTitulo } from './Indicadores/helpers';

import FiltrosIndicadores from './Indicadores/FiltrosIndicadores';
import PersonalizadorVista from './Indicadores/PersonalizadorVista';
import BannerSinDatos from './Indicadores/BannerSinDatos';

import SeccionKpis from './Indicadores/Secciones/SeccionKpis';
import SeccionDistribucion from './Indicadores/Secciones/SeccionDistribucion';
import SeccionTendencias from './Indicadores/Secciones/SeccionTendencias';
import SeccionDestacados from './Indicadores/Secciones/SeccionDestacados';
import SeccionComparativas from './Indicadores/Secciones/SeccionComparativas';
import SeccionFormadores from './Indicadores/Secciones/SeccionFormadores';
import SeccionEstudiantes from './Indicadores/Secciones/SeccionEstudiantes';
import SeccionCitas from './Indicadores/Secciones/SeccionCitas';

const SUB_TEND_CERRADOS = { mes: false, dia: false, hora: false };
const SUB_DEST_CERRADOS = { formadores: false, estudiantes: false };

export default function Indicadores({
    totalFormadores, totalEstudiantes, totalCitas, promedioCitasPorFormador,
    estudiantesAtendidos, tasaCompletacion, tasaCancelacion, tasaAsistencia,
    citasPorEstudiante,
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
            const g = localStorage.getItem('indicadores_secciones_v14');
            if (g) return { ...Object.fromEntries(SECCIONES_INFO.map(s => [s.key, s.default])), ...JSON.parse(g) };
        } catch {}
        return Object.fromEntries(SECCIONES_INFO.map(s => [s.key, s.default]));
    });

    const [seccionActiva, setSeccionActiva] = useState('kpis');
    const [subDistExpandido, setSubDistExpandido] = useState(null);
    const [subTend, setSubTend] = useState(SUB_TEND_CERRADOS);
    const [subDest, setSubDest] = useState(SUB_DEST_CERRADOS);
    const [estudiantesExpandidos, setEstudiantesExpandidos] = useState({});
    const [formadoresExpandidos, setFormadoresExpandidos] = useState({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('indicadores_secciones_v14', JSON.stringify(secciones));
        }
    }, [secciones]);

    useEffect(() => {
        const visibles = SECCIONES_INFO.filter(s => secciones[s.key]);
        if (visibles.length > 0 && !visibles.some(s => s.key === seccionActiva)) {
            setSeccionActiva(visibles[0].key);
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
    };

    const toggleSubDist    = (k) => setSubDistExpandido(prev => prev === k ? null : k);
    const toggleSubTend    = (k) => setSubTend(p => ({ ...p, [k]: !p[k] }));
    const toggleSubDest    = (k) => setSubDest(p => ({ ...p, [k]: !p[k] }));
    const toggleGradoGrupo = (k) => setEstudiantesExpandidos(p => ({ ...p, [k]: !p[k] }));
    const toggleFormador   = (k) => setFormadoresExpandidos(p => ({ ...p, [k]: !p[k] }));

    const mostrarTodo = () => {
        setSecciones(Object.fromEntries(SECCIONES_INFO.map(s => [s.key, true])));
        setSeccionActiva('kpis');
    };
    const ocultarTodo = () => {
        setSecciones(Object.fromEntries(SECCIONES_INFO.map(s => [s.key, false])));
    };

    const handleAnioChange = (value) => {
        setAnio(value);
        if (value) { setMes(''); setSemana(''); }
    };
    const handleMesChange = (value) => {
        setMes(value);
        if (value) { setAnio(''); setSemana(''); }
    };
    const handleSemanaChange = (value) => {
        setSemana(value);
        if (value) { setAnio(''); setMes(''); }
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
        if (filtroMes)    return `Listado de citas de ${mesTitulo(filtroMes)}${contextoGradoGrupo}`;
        if (filtroSemana) return `Listado de citas de la ${semanaTitulo(filtroSemana)}${contextoGradoGrupo}`;
        if (filtroAnio)   return `Listado de citas del año ${filtroAnio}${contextoGradoGrupo}`;
        return 'Próximas citas (próximos 7 días)';
    })();

    const mensajeSinCitas = filtroSemana
        ? 'No hay citas registradas en esa semana.'
        : filtroMes ? 'No hay citas registradas en ese mes.'
        : filtroAnio ? 'No hay citas registradas en ese año.'
        : 'No hay citas programadas en los próximos 7 días.';

    const claseDiff = (v) => v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-gray-500';
    const gruposDisponibles = grado ? (gruposPorGrado[grado] || []) : gruposActivos;

    const seccionesVisibles = SECCIONES_INFO.filter(s => secciones[s.key]);

    const hayFiltros = !!(filtroAnio || filtroMes || filtroSemana || filtroGrado || filtroGrupo);
    const sinDatos = totalCitas === 0;

    const descripcionFiltros = (() => {
        const partes = [];
        if (filtroGrado) partes.push(`grado ${filtroGrado}`);
        if (filtroGrupo) partes.push(`grupo ${filtroGrupo}`);
        if (filtroSemana) partes.push(`la ${semanaTitulo(filtroSemana)}`);
        else if (filtroMes) partes.push(mesTitulo(filtroMes));
        else if (filtroAnio) partes.push(`el año ${filtroAnio}`);
        return partes.join(', ');
    })();

    const kpiValue = (valor) => {
        if (!sinDatos) return valor;
        if (valor === 0 || valor === '0' || valor === '0%') return '—';
        return valor;
    };

    const hintFechaActiva = (() => {
        if (semana) return 'Se está filtrando por semana (año y mes se ignoran).';
        if (mes)    return 'Se está filtrando por mes (año y semana se ignoran).';
        if (anio)   return 'Se está filtrando por año (mes y semana se ignoran).';
        return 'Elige un año, un mes o una semana (no se combinan entre sí).';
    })();

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

                    <div className="flex flex-wrap items-center gap-2">
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
                </div>

                {personalizadorOpen && (
                    <PersonalizadorVista
                        secciones={secciones}
                        onToggleSeccion={toggleSeccion}
                        onMostrarTodo={mostrarTodo}
                        onOcultarTodo={ocultarTodo}
                    />
                )}

                <FiltrosIndicadores
                    anio={anio} mes={mes} semana={semana} grado={grado} grupo={grupo}
                    onChangeAnio={handleAnioChange}
                    onChangeMes={handleMesChange}
                    onChangeSemana={handleSemanaChange}
                    setGrado={setGrado}
                    setGrupo={setGrupo}
                    aniosDisponibles={aniosDisponibles}
                    gradosActivos={gradosActivos}
                    gruposDisponibles={gruposDisponibles}
                    filtroAnio={filtroAnio}
                    filtroMes={filtroMes}
                    filtroSemana={filtroSemana}
                    filtroGrado={filtroGrado}
                    filtroGrupo={filtroGrupo}
                    hintFechaActiva={hintFechaActiva}
                    onAplicar={aplicarFiltros}
                    onLimpiar={limpiarFiltros}
                    abierto={filtrosOpen}
                    setAbierto={setFiltrosOpen}
                />

                {sinDatos && (
                    <BannerSinDatos
                        hayFiltros={hayFiltros}
                        descripcionFiltros={descripcionFiltros}
                        periodoTexto={periodoTexto}
                        onLimpiarFiltros={limpiarFiltros}
                    />
                )}

                {seccionesVisibles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                            {seccionesVisibles.map(sec => {
                                const activa = seccionActiva === sec.key;
                                return (
                                    <button
                                        key={sec.key}
                                        onClick={() => setSeccionActiva(sec.key)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                                            activa
                                                ? 'bg-[#FF5900] text-white border-[#FF5900] shadow-md shadow-[#FF5900]/25'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF5900] hover:bg-[#FF5900]/5'
                                        }`}
                                    >
                                        <span className={`w-1 h-5 rounded-full shrink-0 ${activa ? 'bg-white' : 'bg-[#FF5900]'}`}></span>
                                        <span className="text-sm font-medium truncate">{sec.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {seccionActiva === 'kpis' && secciones.kpis && (
                            <SeccionKpis
                                kpiValue={kpiValue}
                                totalCitas={totalCitas}
                                totalFormadores={totalFormadores}
                                totalEstudiantes={totalEstudiantes}
                                promedioCitasPorFormador={promedioCitasPorFormador}
                                estudiantesAtendidos={estudiantesAtendidos}
                                tasaCompletacion={tasaCompletacion}
                                tasaCancelacion={tasaCancelacion}
                                tasaAsistencia={tasaAsistencia}
                                citasPorEstudiante={citasPorEstudiante}
                                periodoTexto={periodoTexto}
                                contextoGradoGrupo={contextoGradoGrupo}
                            />
                        )}

                        {seccionActiva === 'distribucion' && secciones.distribucion && (
                            <SeccionDistribucion
                                citasPorEstado={citasPorEstado}
                                citasPorClasificacion={citasPorClasificacion}
                                citasPorAsistencia={citasPorAsistencia}
                                subDistExpandido={subDistExpandido}
                                toggleSubDist={toggleSubDist}
                                periodoTexto={periodoTexto}
                                contextoGradoGrupo={contextoGradoGrupo}
                            />
                        )}

                        {seccionActiva === 'tendencias' && secciones.tendencias && (
                            <SeccionTendencias
                                citasPorMes={citasPorMes}
                                citasPorDiaSemana={citasPorDiaSemana}
                                citasPorHora={citasPorHora}
                                subTend={subTend}
                                toggleSubTend={toggleSubTend}
                                periodoTexto={periodoTexto}
                                contextoGradoGrupo={contextoGradoGrupo}
                                contextoSingular={contextoSingular}
                                contextoTexto={contextoTexto}
                                filtroSemana={filtroSemana}
                            />
                        )}

                        {seccionActiva === 'destacados' && secciones.destacados && (
                            <SeccionDestacados
                                formadoresTop={formadoresTop}
                                estudiantesTop={estudiantesTop}
                                subDest={subDest}
                                toggleSubDest={toggleSubDest}
                                periodoTexto={periodoTexto}
                                contextoGradoGrupo={contextoGradoGrupo}
                            />
                        )}

                        {seccionActiva === 'comparativas' && secciones.comparativas && (
                            <SeccionComparativas
                                comparativaSemana={comparativaSemana}
                                comparativaMes={comparativaMes}
                                claseDiff={claseDiff}
                                periodoTexto={periodoTexto}
                                contextoGradoGrupo={contextoGradoGrupo}
                            />
                        )}

                        {seccionActiva === 'formadores' && secciones.formadores && detalleFormadores.length > 0 && (
                            <SeccionFormadores
                                detalleFormadores={detalleFormadores}
                                formadoresExpandidos={formadoresExpandidos}
                                toggleFormador={toggleFormador}
                                periodoTexto={periodoTexto}
                                contextoGradoGrupo={contextoGradoGrupo}
                            />
                        )}

                        {seccionActiva === 'estudiantes' && secciones.estudiantes && (
                            <SeccionEstudiantes
                                estudiantesAgrupados={estudiantesAgrupados}
                                estudiantesExpandidos={estudiantesExpandidos}
                                toggleGradoGrupo={toggleGradoGrupo}
                            />
                        )}

                        {seccionActiva === 'citas' && secciones.citas && (
                            <SeccionCitas
                                citasDelPeriodo={citasDelPeriodo}
                                tituloCitas={tituloCitas}
                                mensajeSinCitas={mensajeSinCitas}
                            />
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
                        <p className="text-gray-500">No hay secciones visibles. Usa "Personalizar vista" para activar alguna.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
// resources/js/Pages/Panel/Expediente.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import ClasificacionDot from '@/Components/ClasificacionDot';
import { ESTADO_LABELS, ASISTENCIA_LABELS, formatFecha, etiquetaFechaRelativa } from '@/Pages/Panel/Citas/helpers';

// Detecta móvil / pantalla chica
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

// Estilos personalizados para react-select
const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: '48px',
        fontSize: '1rem',
        borderRadius: '0.75rem',
        borderColor: '#D1D5DB',
        boxShadow: 'none',
        '&:hover': { borderColor: '#FF5900' },
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '4px 12px',
    }),
    singleValue: (base) => ({
        ...base,
        fontSize: '1rem',
        color: '#1F2937',
    }),
    placeholder: (base) => ({
        ...base,
        fontSize: '1rem',
        color: '#9CA3AF',
    }),
    input: (base) => ({
        ...base,
        fontSize: '1rem',
        color: '#1F2937',
        margin: 0,
        padding: 0,
    }),
    menu: (base) => ({
        ...base,
        fontSize: '1rem',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        zIndex: 20,
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '1rem',
        padding: '10px 12px',
        backgroundColor: state.isFocused ? '#FFF7ED' : state.isSelected ? '#FF5900' : 'white',
        color: state.isSelected ? 'white' : '#1F2937',
        cursor: 'pointer',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    clearIndicator: (base) => ({
        ...base,
        cursor: 'pointer',
        color: '#9CA3AF',
        '&:hover': { color: '#EF4444' },
    }),
    dropdownIndicator: (base) => ({
        ...base,
        cursor: 'pointer',
        color: '#9CA3AF',
        '&:hover': { color: '#FF5900' },
    }),
    loadingMessage: (base) => ({
        ...base,
        fontSize: '1rem',
        color: '#6B7280',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        fontSize: '1rem',
        color: '#6B7280',
    }),
};

// Chips de estado para el historial
function clasesEstado(estado) {
    if (estado === 'programada')          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (estado === 'cancelada')           return 'bg-red-100 text-red-800 border-red-200';
    if (estado === 'cancelada_liberada')  return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
}

function clasesAsistencia(asistencia) {
    if (asistencia === 'asistió')     return 'bg-green-100 text-green-800 border-green-200';
    if (asistencia === 'no asistió')  return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
}

function clasesRelativa(tipo) {
    if (tipo === 'hoy')     return 'bg-[#FF5900]/10 text-[#CC4700] border-[#FF5900]/30';
    if (tipo === 'manana')  return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tipo === 'futuro')  return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
}

export default function Expediente({ estudiante, citas, totalCitas, citasProgramadas, citasCompletadas, citasCanceladas, asistencias, faltas, pendientesAsistencia, egresado, user }) {
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [opcionesEstudiantes, setOpcionesEstudiantes] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);
    const [avisoBusqueda, setAvisoBusqueda] = useState('');
    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (estudiante) {
            setEstudianteSeleccionado({
                value: estudiante.id_estudiante,
                label: estudiante.nombre,
                id_estudiante: estudiante.id_estudiante,
                grado: estudiante.grado,
                grupo: estudiante.grupo,
                egresado,
            });
        }
    }, [estudiante, egresado]);

    // Búsqueda con debounce
    useEffect(() => {
        const trimmed = inputValue.trim();
        if (trimmed.length < 1) {
            setOpcionesEstudiantes([]);
            setBuscando(false);
            return;
        }

        setBuscando(true);
        setError(null);

        const delay = setTimeout(() => {
            fetch(`/api/expediente/estudiantes?q=${encodeURIComponent(trimmed)}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Error ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const options = data.map(item => ({
                        value: item.id_estudiante,
                        label: item.nombre,
                        id_estudiante: item.id_estudiante,
                        grado: item.grado,
                        grupo: item.grupo,
                        egresado: item.egresado,
                    }));
                    setOpcionesEstudiantes(options);
                    setBuscando(false);
                })
                .catch(err => {
                    setError('No se pudieron cargar los estudiantes.');
                    setOpcionesEstudiantes([]);
                    setBuscando(false);
                });
        }, 300);

        return () => clearTimeout(delay);
    }, [inputValue]);

    const handleBuscar = () => {
        if (estudianteSeleccionado) {
            window.location.href = `/expediente/${estudianteSeleccionado.value}`;
        } else {
            setAvisoBusqueda('Selecciona un estudiante de la lista antes de buscar.');
            setTimeout(() => setAvisoBusqueda(''), 4000);
        }
    };

    // Nombre completo del estudiante (ya viene compuesto del backend para activos)
    const nombreCompleto = estudiante?.nombre || '';
    const gradoGrupo = (() => {
        if (egresado) return null;
        const partes = [estudiante?.grado, estudiante?.grupo].filter(Boolean);
        return partes.length > 0 ? partes.join(' · ') : null;
    })();

    return (
        <AuthenticatedLayout>
            <Head title="Expediente de estudiantes" />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Expediente de estudiantes</h1>
                    <p className="text-gray-500 mt-1">
                        Consulta el historial completo de citas de cada estudiante
                    </p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* Card de búsqueda */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Buscar estudiante
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                        Escribe al menos 2 caracteres.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Select
                                options={opcionesEstudiantes}
                                value={estudianteSeleccionado}
                                onChange={setEstudianteSeleccionado}
                                onInputChange={(newValue, actionMeta) => {
                                    if (actionMeta.action === 'input-change') {
                                        setInputValue(newValue);
                                    }
                                }}
                                placeholder="Nombre, apellido o ID..."
                                isClearable
                                styles={selectStyles}
                                classNamePrefix="select"
                                isLoading={buscando}
                                noOptionsMessage={() =>
                                    inputValue.trim().length < 2
                                        ? 'Escribe al menos 2 caracteres'
                                        : 'No se encontraron estudiantes'
                                }
                                loadingMessage={() => 'Buscando...'}
                                filterOption={() => true}
                                formatOptionLabel={(option, { context }) => {
                                    if (context === 'value') {
                                        return option.label;
                                    }
                                    const detalle = option.egresado
                                        ? 'Egresado'
                                        : `${option.grado || ''} ${option.grupo || ''}`.trim();
                                    return (
                                        <div className="flex justify-between items-center gap-3">
                                            <span className="text-gray-800">{option.label}</span>
                                            <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                                                {option.id_estudiante}{detalle ? ` · ${detalle}` : ''}
                                            </span>
                                        </div>
                                    );
                                }}
                                onBlur={() => {
                                    if (!estudianteSeleccionado) {
                                        setInputValue('');
                                        setOpcionesEstudiantes([]);
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={handleBuscar}
                            disabled={!estudianteSeleccionado}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 whitespace-nowrap text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Buscar
                        </button>
                    </div>

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {avisoBusqueda && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                            <span>{avisoBusqueda}</span>
                        </div>
                    )}
                </div>

                {/* Contenido */}
                {estudiante ? (
                    <div className="space-y-6">
                        {/* Banner egresado */}
                        {egresado && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-amber-800 text-sm">Estudiante egresado</p>
                                    <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                                        Ya no está en el registro activo, pero se conserva su historial de citas.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Card principal del estudiante */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF5900] to-[#CC4700] flex items-center justify-center shadow-lg shadow-[#FF5900]/20">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-gray-800 leading-tight truncate">
                                            {nombreCompleto}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                {estudiante.id_estudiante}
                                            </span>
                                            {gradoGrupo && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FF5900]/10 text-[#CC4700]">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    {gradoGrupo}
                                                </span>
                                            )}
                                            {egresado && (
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                                    Egresado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Datos de contacto (solo si aplica) */}
                            {(!egresado && (estudiante.contacto || estudiante.contacto_emergencia)) && (
                                <div className="px-6 py-4 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {estudiante.contacto && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contacto</p>
                                                <p className="text-sm text-gray-800 font-mono truncate">{estudiante.contacto}</p>
                                            </div>
                                        </div>
                                    )}
                                    {estudiante.contacto_emergencia && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contacto de emergencia</p>
                                                <p className="text-sm text-gray-800 font-mono truncate">{estudiante.contacto_emergencia}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* KPIs unificados */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
                                <div className="text-2xl font-bold text-gray-800">{totalCitas}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Total citas</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{citasProgramadas}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Programadas</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{citasCompletadas}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Completadas</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{citasCanceladas}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Canceladas</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-600">{asistencias}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Asistió</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center">
                                <div className="text-2xl font-bold text-rose-600">{faltas}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">No asistió</div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-center col-span-2 md:col-span-1">
                                <div className="text-2xl font-bold text-gray-500">{pendientesAsistencia}</div>
                                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">Pendientes</div>
                            </div>
                        </div>

                        {/* Historial de citas */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Historial de citas</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {citas.length} {citas.length === 1 ? 'cita registrada' : 'citas registradas'}
                                    </p>
                                </div>
                            </div>

                            {citas.length > 0 ? (
                                <>
                                    {/* Móvil: cards */}
                                    {esMovil && (
                                        <div className="divide-y divide-gray-100">
                                            {citas.map(c => {
                                                const relativa = etiquetaFechaRelativa(c.fecha);
                                                return (
                                                    <div key={c.id_cita} className="px-4 py-4">
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-gray-800 leading-snug">
                                                                    {c.nombre_formador || 'Sin formador'}
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                    <span className="text-xs text-gray-600">
                                                                        {formatFecha(c.fecha)} · {c.hora?.substring(0, 5)}
                                                                    </span>
                                                                    {relativa && (
                                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${clasesRelativa(relativa.tipo)}`}>
                                                                            {relativa.texto}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ClasificacionDot clasificacion={c.clasificacion} size="md" />
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${clasesEstado(c.estado)}`}>
                                                                {ESTADO_LABELS[c.estado] || c.estado}
                                                            </span>
                                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${clasesAsistencia(c.asistencia)}`}>
                                                                {ASISTENCIA_LABELS[c.asistencia] || c.asistencia || 'Pendiente'}
                                                            </span>
                                                        </div>

                                                        {c.notas && (
                                                            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
                                                                <span className="text-gray-400 font-medium">Notas:</span> {c.notas}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Desktop: tabla */}
                                    {!esMovil && (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead>
                                                    <tr className="bg-white">
                                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Formador</th>
                                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Fecha</th>
                                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Hora</th>
                                                        <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Clasificación</th>
                                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Estado</th>
                                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Asistencia</th>
                                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Notas</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {citas.map(c => {
                                                        const relativa = etiquetaFechaRelativa(c.fecha);
                                                        return (
                                                            <tr key={c.id_cita} className="hover:bg-[#FF5900]/5 transition-colors duration-150">
                                                                <td className="px-5 py-4 text-base text-gray-800">
                                                                    {c.nombre_formador || <span className="text-gray-400">—</span>}
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-base text-gray-700">{formatFecha(c.fecha)}</span>
                                                                        {relativa && (
                                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${clasesRelativa(relativa.tipo)}`}>
                                                                                {relativa.texto}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap text-base text-gray-700">
                                                                    {c.hora?.substring(0, 5)}
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap text-center">
                                                                    <ClasificacionDot clasificacion={c.clasificacion} size="md" />
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${clasesEstado(c.estado)}`}>
                                                                        {ESTADO_LABELS[c.estado] || c.estado}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${clasesAsistencia(c.asistencia)}`}>
                                                                        {ASISTENCIA_LABELS[c.asistencia] || c.asistencia || 'Pendiente'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-4 text-sm text-gray-600 max-w-md">
                                                                    {c.notas ? (
                                                                        <span title={c.notas} className="line-clamp-2 cursor-help">
                                                                            {c.notas}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-300">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-16 px-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 font-semibold">Sin citas registradas</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Este estudiante no tiene citas en su historial.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">Busca un estudiante para empezar</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                            Usa el buscador de arriba para encontrar a cualquier estudiante y ver su expediente completo de citas.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
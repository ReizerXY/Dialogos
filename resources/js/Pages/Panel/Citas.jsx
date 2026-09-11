import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import NotasModal from './Modales/NotasModal';
import ModificarModal from './Modales/ModificarModal';
import CancelarModal from './Modales/CancelarModal';

export default function Citas({ citas, formadores, filtros, rol, soloLectura = false, user }) {
    // Estados de filtros
    const [formadorFilter, setFormadorFilter] = useState(filtros.formador || '');
    const [estadoFilter, setEstadoFilter] = useState(filtros.estado || '');
    const [fechaFilter, setFechaFilter] = useState(filtros.fecha || '');
    const [semanaFilter, setSemanaFilter] = useState(filtros.semana || 'actual');

    // Estados para modales
    const [notasModalOpen, setNotasModalOpen] = useState(false);
    const [modificarModalOpen, setModificarModalOpen] = useState(false);
    const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    const esFormador = rol === 'Formador';

    // Mostrar filtro formador: Coordinador o Formador en modo "ver todas"
    const mostrarFiltroFormador = rol === 'Coordinador' || (esFormador && soloLectura);

    // Mostrar acciones: solo si es formador y NO es solo lectura
    const mostrarAcciones = esFormador && !soloLectura;

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    // Preservar el parámetro `todas=1` en los filtros
    const applyFilters = () => {
        let url = '/citas?';
        if (soloLectura) url += `todas=1&`;
        if (formadorFilter) url += `formador=${formadorFilter}&`;
        if (estadoFilter) url += `estado=${estadoFilter}&`;
        if (fechaFilter && semanaFilter !== 'actual') url += `fecha=${fechaFilter}&`;
        if (semanaFilter) url += `semana=${semanaFilter}&`;
        window.location.href = url.slice(0, -1);
    };

    const clearFilters = () => {
        window.location.href = soloLectura ? '/citas?todas=1' : '/citas';
    };

    const abrirNotas = (cita) => {
        setCitaSeleccionada(cita);
        setNotasModalOpen(true);
    };

    const abrirModificar = (cita) => {
        setCitaSeleccionada(cita);
        setModificarModalOpen(true);
    };

    const abrirCancelar = (cita) => {
        setCitaSeleccionada(cita);
        setCancelarModalOpen(true);
    };

    const esSemanaActual = semanaFilter === 'actual';

    return (
        <AuthenticatedLayout>
            <Head title={soloLectura ? 'Citas de todos los formadores' : 'Citas'} />
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {soloLectura ? 'Citas de todos los formadores' : 'Citas'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {soloLectura
                                ? 'Consulta de solo lectura: citas de todos los formadores'
                                : 'Gestiona tus citas asignadas'}
                        </p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    {soloLectura && (
                        <Link
                            href={route('citas.index')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Ir a mis citas
                        </Link>
                    )}
                </div>

                {/* Banner solo lectura */}
                {soloLectura && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-blue-800 text-sm">Vista de consulta</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Aquí puedes consultar las citas de tus compañeros. Para gestionar tus propias citas, ve a <strong>"Ver mis citas"</strong>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha específica</label>
                            <input
                                type="date"
                                value={fechaFilter}
                                onChange={(e) => setFechaFilter(e.target.value)}
                                className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700 ${
                                    esSemanaActual ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={esSemanaActual}
                            />
                            {esSemanaActual && (
                                <p className="text-xs text-gray-400 mt-1">Desactiva "Semana actual" para usar fecha específica.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Periodo</label>
                            <select
                                value={semanaFilter}
                                onChange={(e) => setSemanaFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                            >
                                <option value="actual">Semana actual</option>
                                <option value="todas">Todas</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
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
                        {esSemanaActual && (
                            <span className="text-sm text-[#FF5900] flex items-center ml-auto">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mostrando citas de esta semana
                            </span>
                        )}
                    </div>
                </div>

                {/* Listado de citas */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {!citas || citas.length === 0 ? (
                        <div className="py-16 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No hay citas para mostrar</p>
                            <p className="text-gray-400 text-sm mt-1">No se encontraron citas con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estudiante</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Formador</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Clasificación</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asistencia</th>
                                        {mostrarAcciones && (
                                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {citas.map(c => (
                                        <tr key={c.id_cita} className="hover:bg-[#FF5900]/5 transition-colors duration-150 group">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{c.nombre_estudiante}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {mostrarFiltroFormador ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${c.id_usuario === user?.id_usuario ? 'bg-[#FF5900]' : 'bg-gray-300'}`}></div>
                                                        <span className={c.id_usuario === user?.id_usuario ? 'font-medium text-[#FF5900]' : ''}>
                                                            {c.nombre_formador}
                                                            {c.id_usuario === user?.id_usuario && ' (tú)'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    c.nombre_formador
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatFecha(c.fecha)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{c.hora?.substring(0, 5) || c.hora}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {c.clasificacion ? (
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {c.clasificacion}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    c.estado === 'programada' ? 'bg-yellow-100 text-yellow-800' :
                                                    c.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                                    c.estado === 'cancelada_liberada' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {c.estado === 'cancelada_liberada' ? 'Cancelada (liberada)' : c.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    c.asistencia === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                                                    c.asistencia === 'asistió' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {c.asistencia || 'pendiente'}
                                                </span>
                                            </td>
                                            {mostrarAcciones && (
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <button
                                                            onClick={() => abrirNotas(c)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                            Notas
                                                        </button>
                                                        <button
                                                            onClick={() => abrirModificar(c)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-[#FF5900] text-white text-xs font-medium rounded-lg hover:bg-[#CC4700] transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Modificar
                                                        </button>
                                                        <button
                                                            onClick={() => abrirCancelar(c)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {citas && citas.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                            <span>Total: {citas.length} citas</span>
                            <span className="text-[#FF5900]">
                                {filtros.semana === 'actual' ? 'Mostrando semana actual' : 'Mostrando todas las citas'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {mostrarAcciones && (
                <>
                    <NotasModal
                        isOpen={notasModalOpen}
                        onClose={() => setNotasModalOpen(false)}
                        cita={citaSeleccionada}
                        onSuccess={() => window.location.reload()}
                    />
                    <ModificarModal
                        isOpen={modificarModalOpen}
                        onClose={() => setModificarModalOpen(false)}
                        cita={citaSeleccionada}
                        onSuccess={() => window.location.reload()}
                    />
                    <CancelarModal
                        isOpen={cancelarModalOpen}
                        onClose={() => setCancelarModalOpen(false)}
                        cita={citaSeleccionada}
                        onSuccess={() => window.location.reload()}
                    />
                </>
            )}
        </AuthenticatedLayout>
    );
}
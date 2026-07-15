import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import NotasModal from './Modales/NotasModal';
import ModificarModal from './Modales/ModificarModal';
import CancelarModal from './Modales/CancelarModal';

export default function Citas({ citas, formadores, filtros, rol, user }) {
    // Estados de los filtros
    const [formadorFilter, setFormadorFilter] = useState(filtros.formador || '');
    const [estadoFilter, setEstadoFilter] = useState(filtros.estado || '');
    const [fechaFilter, setFechaFilter] = useState(filtros.fecha || '');
    const [semanaFilter, setSemanaFilter] = useState(filtros.semana || 'actual');

    // Estados para los modales
    const [notasModalOpen, setNotasModalOpen] = useState(false);
    const [modificarModalOpen, setModificarModalOpen] = useState(false);
    const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    // ✅ Función para formatear fecha a DD-MM-YYYY
    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    // Funciones para abrir modales
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

    const applyFilters = () => {
        let url = '/citas?';
        if (formadorFilter) url += `formador=${formadorFilter}&`;
        if (estadoFilter) url += `estado=${estadoFilter}&`;
        if (fechaFilter) url += `fecha=${fechaFilter}&`;
        if (semanaFilter) url += `semana=${semanaFilter}&`;
        window.location.href = url.slice(0, -1);
    };

    const clearFilters = () => {
        window.location.href = '/citas';
    };

    const mostrarFiltroFormador = rol === 'Coordinador';

    return (
        <AuthenticatedLayout>
            <Head title="Citas" />
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h1 className="text-2xl font-bold">Citas</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {mostrarFiltroFormador && (
                            <select
                                value={formadorFilter}
                                onChange={(e) => setFormadorFilter(e.target.value)}
                                className="border rounded p-2"
                            >
                                <option value="">Todos los formadores</option>
                                {formadores?.map(f => (
                                    <option key={f.id} value={f.id}>{f.nombre}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Todos los estados</option>
                            <option value="programada">Programada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                        </select>
                        <input
                            type="date"
                            value={fechaFilter}
                            onChange={(e) => setFechaFilter(e.target.value)}
                            className="border rounded p-2"
                        />
                        <select
                            value={semanaFilter}
                            onChange={(e) => setSemanaFilter(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="actual">Semana actual</option>
                            <option value="todas">Todas</option>
                        </select>
                        <button onClick={applyFilters} className="bg-[#FF5900] text-white px-4 py-2 rounded">Filtrar</button>
                        <button onClick={clearFilters} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Limpiar</button>
                    </div>
                </div>

                {!citas || citas.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay citas para mostrar.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formador</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clasificación</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {citas.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-4 py-3">{c.nombre_estudiante}</td>
                                        <td className="px-4 py-3">{c.nombre_formador}</td>
                                        <td className="px-4 py-3">{formatFecha(c.fecha)}</td>
                                        <td className="px-4 py-3">{c.hora?.substring(0, 5) || c.hora}</td>
                                        <td className="px-4 py-3">
                                            {c.clasificacion ? (
                                                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                    {c.clasificacion}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                c.estado === 'programada' ? 'bg-yellow-100 text-yellow-800' :
                                                c.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {c.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                c.asistencia === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                                                c.asistencia === 'asistió' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {c.asistencia || 'pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 space-x-1 flex flex-wrap">
                                            <button
                                                onClick={() => abrirNotas(c)}
                                                className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition mb-1"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Notas
                                            </button>
                                            <button
                                                onClick={() => abrirModificar(c)}
                                                className="inline-flex items-center px-3 py-1 bg-[#FF5900] text-white text-sm rounded hover:bg-[#CC4700] transition mb-1"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Modificar
                                            </button>
                                            <button
                                                onClick={() => abrirCancelar(c)}
                                                className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition mb-1"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancelar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modales */}
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
        </AuthenticatedLayout>
    );
}
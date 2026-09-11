import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Horarios({ horarios, formadores, filtroFormador, user }) {
    const [formadorFilter, setFormadorFilter] = useState(filtroFormador || '');

    const applyFilter = () => {
        window.location.href = `/horarios?formador=${formadorFilter}`;
    };

    const clearFilter = () => {
        window.location.href = '/horarios';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Horarios" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Horarios de formadores</h1>
                    <p className="text-gray-500 mt-1">Consulta la disponibilidad de cada formador por día y hora</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filtrar por formador
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <select
                                value={formadorFilter}
                                onChange={(e) => setFormadorFilter(e.target.value)}
                                className="flex-1 sm:w-64 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all duration-200 bg-white text-gray-700"
                            >
                                <option value="">Seleccionar un formador</option>
                                {formadores.map(f => (
                                    <option key={f.id_usuario} value={f.id_usuario}>{f.nombre}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={applyFilter}
                                    className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={clearFilter}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                                >
                                    Limpiar filtro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {horarios.length === 0 ? (
                        <div className="py-16 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No hay horarios registrados</p>
                            <p className="text-gray-400 text-sm mt-1">No se encontraron horarios para los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Formador</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Día</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora inicio</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora fin</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {horarios.map((h, index) => (
                                        <tr key={index} className="hover:bg-[#FF5900]/5 transition-colors duration-150 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#FF5900]"></div>
                                                    <span className="text-sm font-medium text-gray-800">{h.nombre_formador}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700 capitalize">{h.dia_semana}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700]">
                                                    {h.hora_inicio}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">{h.hora_fin}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                        <span>Total: {horarios.length} horarios</span>
                        {formadorFilter && (
                            <span className="text-[#FF5900]">
                                Mostrando filtro por: {formadores.find(f => f.id_usuario == formadorFilter)?.nombre}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Horarios({ horarios, formadores, filtroFormador }) {
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
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Horarios de formadores</h1>
                    <div className="flex items-center space-x-2">
                        <select
                            value={formadorFilter}
                            onChange={(e) => setFormadorFilter(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Todos</option>
                            {formadores.map(f => (
                                <option key={f.id} value={f.id}>{f.nombre}</option>
                            ))}
                        </select>
                        <button onClick={applyFilter} className="bg-[#FF5900] text-white px-4 py-2 rounded">Filtrar</button>
                        <button onClick={clearFilter} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Limpiar</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formador</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora inicio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora fin</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {horarios.map(h => (
                            <tr key={`${h.usuario_id}-${h.dia_semana}-${h.hora_inicio}`}>
                                <td>{h.nombre_formador}</td>
                                <td>{h.dia_semana}</td>
                                <td>{h.hora_inicio}</td>
                                <td>{h.hora_fin}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {horarios.length === 0 && <p className="p-4 text-center text-gray-500">No hay horarios registrados.</p>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
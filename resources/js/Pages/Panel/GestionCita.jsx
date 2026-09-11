import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function GestionCita({ cita, user }) {
    const { data, setData, put, processing } = useForm({
        clasificacion: cita.clasificacion || '',
        notas: cita.notas || '',
        asistencia: cita.asistencia || 'pendiente',
        estado: cita.estado || 'programada',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('citas.update', cita.id_cita));
    };

    // Formatear fecha DD-MM-YYYY
    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestionar cita" />
            <div className="max-w-3xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Gestionar cita</h1>
                    <p className="text-gray-500 mt-1">Solo puedes gestionar tus propias citas asignadas</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    {/* Info cita */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-1">
                        <p><span className="font-medium text-gray-700">ID Cita:</span> <span className="font-mono">{cita.id_cita}</span></p>
                        <p><span className="font-medium text-gray-700">Estudiante:</span> {cita.nombre_estudiante}</p>
                        <p><span className="font-medium text-gray-700">Formador:</span> {cita.nombre_formador}</p>
                        <p><span className="font-medium text-gray-700">Fecha:</span> {formatFecha(cita.fecha)} — <span className="font-medium text-gray-700">Hora:</span> {cita.hora?.substring(0, 5)}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación</label>
                            <select
                                value={data.clasificacion}
                                onChange={e => setData('clasificacion', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white"
                            >
                                <option value="">Sin clasificar</option>
                                <option value="académica">Académica</option>
                                <option value="familiar">Familiar</option>
                                <option value="emocional">Emocional</option>
                                <option value="espiritual">Espiritual</option>
                                <option value="institucional">Institucional</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={data.estado}
                                onChange={e => setData('estado', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white"
                            >
                                <option value="programada">Programada</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada_liberada">Cancelada (horario liberado)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Asistencia</label>
                            <select
                                value={data.asistencia}
                                onChange={e => setData('asistencia', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white"
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="asistió">Asistió</option>
                                <option value="no asistió">No asistió</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                            <textarea
                                value={data.notas}
                                onChange={e => setData('notas', e.target.value)}
                                rows="4"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] resize-none"
                                placeholder="Escribe observaciones..."
                            />
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <Link
                                href={route('citas.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
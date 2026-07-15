import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function GestionCita({ cita, user }) {
    const { data, setData, put, processing } = useForm({
        clasificacion: cita.clasificacion || '',
        notas: cita.notas || '',
        asistencia: cita.asistencia || 'pendiente',
        estado: cita.estado || 'programada',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('citas.update', cita.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestionar cita" />
            <div className="bg-white p-6 rounded shadow max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">Gestionar cita</h1>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Estudiante</label>
                        <p className="border p-2 rounded bg-gray-50">{cita.nombre_estudiante}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Formador</label>
                        <p className="border p-2 rounded bg-gray-50">{cita.nombre_formador}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Fecha</label>
                            <p className="border p-2 rounded bg-gray-50">{cita.fecha}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Hora</label>
                            <p className="border p-2 rounded bg-gray-50">{cita.hora}</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Clasificación</label>
                        <select
                            value={data.clasificacion}
                            onChange={e => setData('clasificacion', e.target.value)}
                            className="w-full border rounded p-2"
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
                        <label className="block text-sm font-medium">Estado</label>
                        <select
                            value={data.estado}
                            onChange={e => setData('estado', e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="programada">Programada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Asistencia</label>
                        <select
                            value={data.asistencia}
                            onChange={e => setData('asistencia', e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="asistió">Asistió</option>
                            <option value="no asistió">No asistió</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Notas</label>
                        <textarea
                            value={data.notas}
                            onChange={e => setData('notas', e.target.value)}
                            rows="3"
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[#FF5900] text-white px-4 py-2 rounded"
                    >
                        Guardar cambios
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
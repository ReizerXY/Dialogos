import { useState, useEffect } from 'react';

export default function NotasModal({ isOpen, onClose, cita, onSuccess }) {
    const [clasificacion, setClasificacion] = useState('');
    const [notas, setNotas] = useState('');
    const [asistencia, setAsistencia] = useState('pendiente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Cargar datos de la cita cuando se abre el modal
    useEffect(() => {
        if (cita) {
            setClasificacion(cita.clasificacion || '');
            setNotas(cita.notas || '');
            setAsistencia(cita.asistencia || 'pendiente');
            setError('');
            setSuccessMessage('');
        }
    }, [cita]);

    // Si el modal no está abierto o no hay cita, no renderizar nada
    if (!isOpen || !cita) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        // Normalizar valores: minúsculas y sin espacios
        const clasificacionEnviar = clasificacion ? clasificacion.trim().toLowerCase() : '';
        const asistenciaEnviar = asistencia ? asistencia.trim().toLowerCase() : 'pendiente';

        // Obtener token CSRF
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
        if (!csrfToken) {
            setError('Error de seguridad: Token CSRF no encontrado. Recarga la página.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/citas/${cita.id}/notas`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    clasificacion: clasificacionEnviar,
                    notas: notas.trim(),
                    asistencia: asistenciaEnviar,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage(data.message || 'Notas actualizadas correctamente.');
                // Esperar un momento para que el usuario vea el mensaje de éxito
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 800);
            } else {
                // Mostrar error detallado del servidor
                setError(data.error || data.message || 'Error al guardar notas.');
            }
        } catch (err) {
            console.error('Error en la petición:', err);
            setError('Error de conexión. Verifica tu conexión a internet o contacta al administrador.');
        } finally {
            setLoading(false);
        }
    };

    // Opciones para la clasificación
    const opcionesClasificacion = [
        { value: '', label: 'Sin clasificar' },
        { value: 'académica', label: 'Académica' },
        { value: 'familiar', label: 'Familiar' },
        { value: 'emocional', label: 'Emocional' },
        { value: 'espiritual', label: 'Espiritual' },
        { value: 'institucional', label: 'Institucional' },
    ];

    // Opciones para la asistencia
    const opcionesAsistencia = [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'asistió', label: 'Asistió' },
        { value: 'no asistió', label: 'No asistió' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Agregar / Editar Notas</h2>
                    
                    {/* Información de la cita */}
                    <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                        <p><strong>Estudiante:</strong> {cita.nombre_estudiante}</p>
                        <p><strong>Formador:</strong> {cita.nombre_formador}</p>
                        <p><strong>Fecha:</strong> {cita.fecha} - <strong>Hora:</strong> {cita.hora?.substring(0, 5)}</p>
                    </div>

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                            ✅ {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            ❌ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Clasificación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Clasificación
                            </label>
                            <select
                                value={clasificacion}
                                onChange={(e) => setClasificacion(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5900] focus:border-transparent"
                            >
                                {opcionesClasificacion.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Asistencia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Asistencia
                            </label>
                            <select
                                value={asistencia}
                                onChange={(e) => setAsistencia(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5900] focus:border-transparent"
                            >
                                {opcionesAsistencia.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                rows="4"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5900] focus:border-transparent resize-none"
                                placeholder="Escribe las notas aquí..."
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#FF5900] text-white rounded-md hover:bg-[#CC4700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : 'Guardar notas'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
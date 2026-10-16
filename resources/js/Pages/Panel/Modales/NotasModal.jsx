// resources/js/Pages/Panel/Modales/NotasModal.jsx
import { useState, useEffect, useMemo } from 'react';
import ClasificacionSelector from '@/Components/ClasificacionSelector';
import { CLASIFICACION_LABELS, ESTADO_LABELS, ASISTENCIA_LABELS, formatFecha } from '@/Pages/Panel/Citas/helpers';

const OPCIONES_ASISTENCIA = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'asistió', label: 'Asistió' },
    { value: 'no asistió', label: 'No asistió' },
];

const MAX_NOTAS = 500;

export default function NotasModal({ isOpen, onClose, cita, onSuccess }) {
    const [clasificacion, setClasificacion] = useState('');
    const [notas, setNotas] = useState('');
    const [asistencia, setAsistencia] = useState('pendiente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (cita) {
            setClasificacion(cita.clasificacion || '');
            setNotas(cita.notas || '');
            setAsistencia(cita.asistencia || 'pendiente');
            setError('');
            setSuccessMessage('');
        }
    }, [cita]);

    if (!isOpen || !cita) return null;

    const calcularNuevoEstado = () => {
        const estadoActual = cita.estado;
        if (estadoActual === 'cancelada' || estadoActual === 'cancelada_liberada') return estadoActual;
        const asistenciaRegistrada = asistencia === 'asistió' || asistencia === 'no asistió';
        return asistenciaRegistrada ? 'completada' : 'programada';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (notas.length > MAX_NOTAS) {
            setError(`Las notas no pueden exceder los ${MAX_NOTAS} caracteres.`);
            setLoading(false);
            return;
        }

        const clasificacionEnviar = clasificacion ? clasificacion.trim().toLowerCase() : '';
        const asistenciaEnviar = asistencia ? asistencia.trim().toLowerCase() : 'pendiente';
        const estadoEnviar = calcularNuevoEstado();

        const csrfToken = (() => {
            const match = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        })();

        if (!csrfToken) {
            setError('Error de seguridad: Token CSRF no encontrado. Recarga la página.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/citas/${cita.id_cita}/notas`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    clasificacion: clasificacionEnviar,
                    notas: notas.trim(),
                    asistencia: asistenciaEnviar,
                    estado: estadoEnviar,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage(data.message || 'Notas actualizadas correctamente.');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 800);
            } else {
                setError(data.error || data.message || 'Error al guardar notas.');
            }
        } catch (err) {
            setError('Error de conexión. Verifica tu conexión a internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">Agregar / Editar Notas</h2>
                    <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="p-6">
                    {/* Info de la cita */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
                        <p><span className="font-medium text-gray-700">Estudiante:</span> {cita.nombre_estudiante}</p>
                        <p><span className="font-medium text-gray-700">Formador:</span> {cita.nombre_formador}</p>
                        <p>
                            <span className="font-medium text-gray-700">Fecha:</span> {formatFecha(cita.fecha)} ·{' '}
                            <span className="font-medium text-gray-700">Hora:</span> {cita.hora?.substring(0, 5)}
                        </p>
                    </div>

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Clasificación
                            </label>
                            <ClasificacionSelector
                                value={clasificacion}
                                onChange={setClasificacion}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {clasificacion
                                    ? <>Seleccionada: <strong>{CLASIFICACION_LABELS[clasificacion]}</strong></>
                                    : 'Toca un círculo para asignar la clasificación.'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Asistencia
                            </label>
                            <select
                                value={asistencia}
                                onChange={(e) => setAsistencia(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white"
                            >
                                {OPCIONES_ASISTENCIA.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {asistencia === 'pendiente'
                                    ? 'Si dejas "Pendiente", la cita se mantiene como programada.'
                                    : 'Al registrar "Asistió" o "No asistió", la cita se marca como completada.'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                rows="4"
                                maxLength={MAX_NOTAS}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] resize-none"
                                placeholder={`Escribe las notas aquí (máximo ${MAX_NOTAS} caracteres)...`}
                            />
                            <div className="mt-1 flex justify-end text-xs text-gray-500">
                                <span className={notas.length >= MAX_NOTAS ? 'text-red-500 font-semibold' : ''}>
                                    {notas.length} / {MAX_NOTAS} caracteres
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardar notas
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
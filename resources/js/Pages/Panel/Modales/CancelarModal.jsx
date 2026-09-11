import { useState, useEffect } from 'react';

export default function CancelarModal({ isOpen, onClose, cita, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notaCancelacion, setNotaCancelacion] = useState('Motivo de cancelación: ');
    const [liberarHorario, setLiberarHorario] = useState(true);

    const MAX_NOTA = 300;

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    useEffect(() => {
        if (isOpen && cita) {
            setNotaCancelacion('Motivo de cancelación: ');
            setLiberarHorario(true);
            setError('');
        }
    }, [isOpen, cita]);

    if (!isOpen || !cita) return null;

    const handleCancelar = async () => {
        setLoading(true);
        setError('');

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        try {
            const response = await fetch(`/citas/${cita.id_cita}/cancelar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    nota_cancelacion: notaCancelacion.trim(),
                    liberar_horario: liberarHorario ? 1 : 0,
                }),
            });

            const data = await response.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.error || 'Error al cancelar la cita.');
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancelar cita</h2>
                <p className="text-gray-600 mb-2">
                    ¿Estás seguro de que deseas cancelar la cita de <strong>{cita.nombre_estudiante}</strong>
                    {' '}con <strong>{cita.nombre_formador}</strong>?
                </p>
                <p className="text-gray-500 text-sm mb-4">
                    Fecha: <strong>{formatFecha(cita.fecha)}</strong> — Hora: <strong>{cita.hora?.substring(0, 5)}</strong>
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de cancelación
                    </label>
                    <textarea
                        value={notaCancelacion}
                        onChange={(e) => setNotaCancelacion(e.target.value)}
                        rows="3"
                        maxLength={MAX_NOTA}
                        placeholder="Motivo de cancelación: "
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] resize-none"
                    />
                    <div className="mt-1 flex justify-end text-xs text-gray-500">
                        <span className={notaCancelacion.length >= MAX_NOTA ? 'text-red-500 font-semibold' : ''}>
                            {notaCancelacion.length} / {MAX_NOTA} caracteres
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Este texto se agregará al campo de notas de la cita.
                    </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={liberarHorario}
                            onChange={(e) => setLiberarHorario(e.target.checked)}
                            className="mt-1 w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900]"
                        />
                        <div>
                            <span className="font-medium text-gray-800 text-sm">
                                Liberar el horario para futuras citas
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                                {liberarHorario
                                    ? 'El horario quedará disponible para que otro estudiante pueda agendar.'
                                    : 'El horario quedará bloqueado y no se podrá agendar en él.'}
                            </p>
                        </div>
                    </label>
                </div>

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        No, mantener
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelar}
                        disabled={loading}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Cancelando...' : 'Sí, cancelar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
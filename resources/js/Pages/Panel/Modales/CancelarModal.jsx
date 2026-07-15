import { useState } from 'react';

export default function CancelarModal({ isOpen, onClose, cita, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !cita) return null;

    const handleCancelar = async () => {
        setLoading(true);
        setError('');

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        try {
            const response = await fetch(`/citas/${cita.id}/cancelar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Cancelar cita</h2>
                <p className="mb-4">
                    ¿Estás seguro de que deseas cancelar la cita de <strong>{cita.nombre_estudiante}</strong> 
                    con <strong>{cita.nombre_formador}</strong> el día <strong>{cita.fecha}</strong> a las <strong>{cita.hora?.substring(0, 5)}</strong>?
                </p>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        No, mantener
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelar}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                        {loading ? 'Cancelando...' : 'Sí, cancelar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';

export default function ModificarModal({ isOpen, onClose, cita, onSuccess }) {
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cita) {
            setFecha(cita.fecha || '');
            setHora(cita.hora?.substring(0, 5) || '');
        }
    }, [cita]);

    if (!isOpen || !cita) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        try {
            const response = await fetch(`/citas/${cita.id}/modificar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ fecha, hora }),
            });

            const data = await response.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.error || 'Error al modificar la cita.');
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
                <h2 className="text-xl font-bold mb-4">Modificar cita</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nueva fecha</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nueva hora</label>
                        <input
                            type="time"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#FF5900] text-white rounded"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
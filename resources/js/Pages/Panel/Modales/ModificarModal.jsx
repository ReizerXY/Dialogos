import { useState, useEffect } from 'react';

export default function ModificarModal({ isOpen, onClose, cita, onSuccess }) {
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const [cargandoHoras, setCargandoHoras] = useState(false);
    const [modoEspecial, setModoEspecial] = useState(false);

    useEffect(() => {
        if (cita) {
            setFecha(cita.fecha || '');
            setHora(cita.hora?.substring(0, 5) || '');
            setModoEspecial(false);
            if (cita.fecha && cita.id_usuario) {
                cargarHorasDisponibles(cita.fecha);
            }
        }
    }, [cita]);

    const cargarHorasDisponibles = async (fechaSeleccionada) => {
        if (!cita) return;
        setCargandoHoras(true);
        setError('');
        try {
            // ✅ FIX: query param 'usuario_id' (no 'id_usuario') para coincidir con el backend
            const res = await fetch(
                `/api/disponibilidad-para-modificar?usuario_id=${cita.id_usuario}&fecha=${fechaSeleccionada}&cita_id=${cita.id_cita}`
            );
            const data = await res.json();
            setHorasDisponibles(data);
            if (hora && !data.includes(hora)) {
                setHora('');
            }
        } catch (err) {
            setError('Error al cargar disponibilidad.');
        } finally {
            setCargandoHoras(false);
        }
    };

    const handleFechaChange = (e) => {
        const nuevaFecha = e.target.value;
        setFecha(nuevaFecha);
        setHora('');
        if (nuevaFecha && !modoEspecial) {
            cargarHorasDisponibles(nuevaFecha);
        }
    };

    const toggleModoEspecial = () => {
        setModoEspecial(!modoEspecial);
        setHora('');
        if (!modoEspecial) {
            const horas = [];
            for (let h = 8; h <= 18; h++) {
                for (let m = 0; m < 60; m += 30) {
                    const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    horas.push(horaStr);
                }
            }
            setHorasDisponibles(horas);
        } else {
            if (fecha) cargarHorasDisponibles(fecha);
        }
    };

    if (!isOpen || !cita) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        try {
            const response = await fetch(`/citas/${cita.id_cita}/modificar`, {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Modificar cita</h2>
                
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <p><strong>Estudiante:</strong> {cita.nombre_estudiante}</p>
                    <p><strong>Formador:</strong> {cita.nombre_formador}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nueva fecha</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={handleFechaChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Nueva hora</label>
                            <button
                                type="button"
                                onClick={toggleModoEspecial}
                                className="text-xs text-[#FF5900] hover:underline font-medium"
                            >
                                {modoEspecial ? '↩ Volver a horario normal' : '⚡ Horario especial'}
                            </button>
                        </div>
                        {cargandoHoras ? (
                            <p className="text-sm text-gray-500">Cargando horarios...</p>
                        ) : (
                            <>
                                {modoEspecial ? (
                                    <input
                                        type="time"
                                        value={hora}
                                        onChange={(e) => setHora(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                        step="1800"
                                        required
                                    />
                                ) : (
                                    <select
                                        value={hora}
                                        onChange={(e) => setHora(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] bg-white"
                                        required
                                    >
                                        <option value="">-- Elige una hora --</option>
                                        {horasDisponibles.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                )}
                                {!modoEspecial && horasDisponibles.length === 0 && fecha && (
                                    <p className="text-sm text-yellow-600 mt-1">No hay horas disponibles para esta fecha. Usa "Horario especial".</p>
                                )}
                                {modoEspecial && (
                                    <p className="text-xs text-gray-400 mt-1">Modo especial: puedes seleccionar cualquier hora.</p>
                                )}
                            </>
                        )}
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !hora}
                            className="px-6 py-2 bg-[#FF5900] text-white rounded-xl hover:bg-[#CC4700] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
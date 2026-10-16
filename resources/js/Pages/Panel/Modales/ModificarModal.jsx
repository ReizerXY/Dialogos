// resources/js/Pages/Panel/Modales/ModificarModal.jsx
import { useState, useEffect } from 'react';

// Fecha de hoy en YYYY-MM-DD (zona local)
function hoyLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function ModificarModal({ isOpen, onClose, cita, onSuccess }) {
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const [cargandoHoras, setCargandoHoras] = useState(false);
    const [modo, setModo] = useState('normal'); // 'normal' | 'especial'

    const MIN_FECHA = hoyLocal();

    useEffect(() => {
        if (cita) {
            setFecha(cita.fecha || '');
            setHora(cita.hora?.substring(0, 5) || '');
            setModo('normal');
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
            const res = await fetch(
                `/api/disponibilidad-para-modificar?usuario_id=${cita.id_usuario}&fecha=${fechaSeleccionada}&cita_id=${cita.id_cita}`
            );
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            setHorasDisponibles(Array.isArray(data) ? data : []);
            if (hora && !data.includes(hora)) setHora('');
        } catch (err) {
            setError('Error al cargar disponibilidad.');
            setHorasDisponibles([]);
        } finally {
            setCargandoHoras(false);
        }
    };

    const handleFechaChange = (e) => {
        const nuevaFecha = e.target.value;
        setFecha(nuevaFecha);
        setHora('');
        if (nuevaFecha && modo === 'normal') {
            cargarHorasDisponibles(nuevaFecha);
        }
    };

    const cambiarModo = (nuevoModo) => {
        if (nuevoModo === modo) return;
        setModo(nuevoModo);
        setHora('');
        if (nuevoModo === 'normal') {
            if (fecha) cargarHorasDisponibles(fecha);
        } else {
            // Genera todas las horas en punto y medias
            const horas = [];
            for (let h = 8; h <= 18; h++) {
                for (let m = 0; m < 60; m += 30) {
                    horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                }
            }
            setHorasDisponibles(horas);
        }
    };

    if (!isOpen || !cita) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const csrfToken = (() => {
            const match = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        })();

        try {
            const response = await fetch(`/citas/${cita.id_cita}/modificar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">Modificar cita</h2>
                    <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
                        <p><span className="font-medium text-gray-700">Estudiante:</span> {cita.nombre_estudiante}</p>
                        <p><span className="font-medium text-gray-700">Formador:</span> {cita.nombre_formador}</p>
                        <p>
                            <span className="font-medium text-gray-700">Fecha actual:</span> {cita.fecha} ·{' '}
                            <span className="font-medium text-gray-700">Hora:</span> {cita.hora?.substring(0, 5)}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                min={MIN_FECHA}
                                onChange={handleFechaChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Modo de selección de hora</label>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => cambiarModo('normal')}
                                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                                        modo === 'normal'
                                            ? 'bg-[#FF5900] border-[#FF5900] text-white shadow-sm'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    Horario normal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => cambiarModo('especial')}
                                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                                        modo === 'especial'
                                            ? 'bg-[#FF5900] border-[#FF5900] text-white shadow-sm'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    Horario especial
                                </button>
                            </div>

                            {cargandoHoras ? (
                                <p className="text-sm text-gray-500">Cargando horarios...</p>
                            ) : modo === 'normal' ? (
                                <>
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
                                    {horasDisponibles.length === 0 && fecha && (
                                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
                                            No hay horas disponibles para esta fecha. Prueba con "Horario especial".
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <input
                                        type="time"
                                        value={hora}
                                        onChange={(e) => setHora(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                                        step="1800"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Modo especial: puedes seleccionar cualquier hora.
                                    </p>
                                </>
                            )}
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
                                disabled={loading || !hora || !fecha}
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
                                    'Guardar cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
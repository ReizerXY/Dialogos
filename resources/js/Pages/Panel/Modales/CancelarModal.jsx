// resources/js/Pages/Panel/Modales/CancelarModal.jsx
import { useState, useEffect } from 'react';
import { formatFecha } from '@/Pages/Panel/Citas/helpers';

const MAX_NOTA = 300;
const PREFIJO = 'Motivo de cancelación: ';

export default function CancelarModal({ isOpen, onClose, cita, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [motivo, setMotivo] = useState('');
    const [motivoError, setMotivoError] = useState('');
    const [liberarHorario, setLiberarHorario] = useState(true);

    useEffect(() => {
        if (isOpen && cita) {
            setMotivo('');
            setMotivoError('');
            setLiberarHorario(true);
            setError('');
        }
    }, [isOpen, cita]);

    if (!isOpen || !cita) return null;

    const handleMotivoChange = (e) => {
        setMotivo(e.target.value);
        if (motivoError && e.target.value.trim()) setMotivoError('');
    };

    const handleCancelar = async () => {
        setError('');
        const motivoLimpio = motivo.trim();

        if (!motivoLimpio) {
            setMotivoError('Debes escribir el motivo de la cancelación.');
            return;
        }

        setLoading(true);

        const csrfToken = (() => {
            const match = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
            return match ? decodeURIComponent(match.split('=')[1]) : '';
        })();

        try {
            const response = await fetch(`/citas/${cita.id_cita}/cancelar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    nota_cancelacion: PREFIJO + motivoLimpio,
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">Cancelar cita</h2>
                    <div className="w-12 h-1 bg-red-500 rounded-full mt-3"></div>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 mb-2">
                        ¿Estás seguro de que deseas cancelar la cita de <strong>{cita.nombre_estudiante}</strong> con <strong>{cita.nombre_formador}</strong>?
                    </p>
                    <p className="text-gray-500 text-sm mb-5">
                        Fecha: <strong>{formatFecha(cita.fecha)}</strong> · Hora: <strong>{cita.hora?.substring(0, 5)}</strong>
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Motivo de cancelación <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={motivo}
                            onChange={handleMotivoChange}
                            rows="3"
                            maxLength={MAX_NOTA}
                            placeholder="Escribe aquí el motivo de la cancelación..."
                            className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 resize-none ${
                                motivoError
                                    ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-[#FF5900]/50 focus:border-[#FF5900]'
                            }`}
                        />
                        <div className="mt-1 flex justify-between text-xs">
                            <span className={motivoError ? 'text-red-600 font-medium' : 'text-transparent'}>
                                {motivoError || '.'}
                            </span>
                            <span className={motivo.length >= MAX_NOTA ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                                {motivo.length} / {MAX_NOTA} caracteres
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
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${liberarHorario ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {liberarHorario ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        )}
                                    </svg>
                                    <span className="font-medium text-gray-800 text-sm">
                                        {liberarHorario ? 'Liberar el horario' : 'Mantener el horario bloqueado'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {liberarHorario
                                        ? 'El horario quedará disponible para que otro estudiante pueda agendar.'
                                        : 'El horario quedará bloqueado y no se podrá agendar en él.'}
                                </p>
                            </div>
                        </label>
                    </div>

                    {error && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            No, mantener
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelar}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cancelando...
                                </>
                            ) : (
                                'Sí, cancelar cita'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
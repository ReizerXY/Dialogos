// resources/js/Pages/Panel/Citas/SelectClasificacionColor.jsx
import { useState, useEffect, useRef } from 'react';
import { CLASIFICACION_COLOR, CLASIFICACIONES, CLASIFICACION_LABELS } from './helpers';

// Dropdown custom para clasificación: el botón muestra solo el color,
// el menú abierto muestra color + nombre para que se elija fácil.
export default function SelectClasificacionColor({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Cierra el menú al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const colorActual = value ? (CLASIFICACION_COLOR[value] || 'bg-gray-400') : null;

    return (
        <div ref={ref} className="relative">
            {/* Botón cerrado */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white flex items-center justify-between min-h-[46px]"
            >
                {colorActual ? (
                    <span
                        className={`inline-block w-7 h-7 rounded-md ${colorActual} shadow-sm`}
                        title={CLASIFICACION_LABELS[value]}
                        aria-label={value}
                    ></span>
                ) : (
                    <span className="text-sm text-gray-500">Todas las clasificaciones</span>
                )}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Menú desplegable: solo colores, con tooltip */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2">
                    <button
                        type="button"
                        onClick={() => { onChange(''); setOpen(false); }}
                        className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg hover:bg-orange-50 transition ${!value ? 'bg-orange-50' : ''}`}
                        title="Todas las clasificaciones"
                    >
                        <span className="text-xs text-gray-600">Todas</span>
                    </button>

                    <div className="flex flex-wrap gap-2 mt-1 p-2">
                        {CLASIFICACIONES.map(op => (
                            <button
                                key={op}
                                type="button"
                                onClick={() => { onChange(op); setOpen(false); }}
                                className={`w-9 h-9 rounded-lg ${CLASIFICACION_COLOR[op]} shadow-sm transition-all duration-150 hover:scale-110 ${
                                    value === op ? 'ring-2 ring-offset-2 ring-gray-700' : ''
                                }`}
                                title={CLASIFICACION_LABELS[op]}
                                aria-label={CLASIFICACION_LABELS[op]}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
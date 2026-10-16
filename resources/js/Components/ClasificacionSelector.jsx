// resources/js/Components/ClasificacionSelector.jsx
import { useState, useEffect, useRef } from 'react';
import { CLASIFICACION_COLOR, CLASIFICACIONES, CLASIFICACION_LABELS } from '@/Pages/Panel/Citas/helpers';

// Detecta movil / pantalla chica
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

// Selector de clasificación con círculos de color.
// PC: hover -> tooltip con nombre. Click -> selecciona.
// Movil: tap -> tooltip + selecciona.
export default function ClasificacionSelector({ value, onChange }) {
    const [esMovil, setEsMovil] = useState(false);
    const [hoverId, setHoverId] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Cierra el tooltip en movil al tocar afuera
    useEffect(() => {
        if (!esMovil || !hoverId) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setHoverId(null);
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [esMovil, hoverId]);

    return (
        <div ref={ref} className="flex flex-wrap items-center gap-2">
            {CLASIFICACIONES.map(op => {
                const activa = value === op;
                const mostrarTooltip = hoverId === op;
                return (
                    <div key={op} className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                onChange(activa ? '' : op);
                                if (esMovil) setHoverId(mostrarTooltip ? null : op);
                            }}
                            onMouseEnter={() => { if (!esMovil) setHoverId(op); }}
                            onMouseLeave={() => { if (!esMovil) setHoverId(null); }}
                            aria-label={CLASIFICACION_LABELS[op]}
                            aria-pressed={activa}
                            title={!esMovil ? CLASIFICACION_LABELS[op] : undefined}
                            className={`w-9 h-9 rounded-full ${CLASIFICACION_COLOR[op]} transition-all duration-200 ${
                                activa
                                    ? 'ring-2 ring-offset-2 ring-gray-700 scale-110'
                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                        />
                        {mostrarTooltip && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap z-50 pointer-events-none">
                                <div className="bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-1.5 shadow-xl">
                                    {CLASIFICACION_LABELS[op]}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                        <div className="w-2.5 h-2.5 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="ml-1 text-xs text-gray-500 hover:text-gray-800 underline font-medium transition-colors"
                >
                    Limpiar
                </button>
            )}
        </div>
    );
}
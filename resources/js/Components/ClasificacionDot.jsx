// resources/js/Components/ClasificacionDot.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CLASIFICACION_COLOR, CLASIFICACION_LABELS } from '@/Pages/Panel/Citas/helpers';

// Detecta movil / pantalla chica
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

// Punto de color de clasificación con tooltip.
// El tooltip se renderiza en document.body via Portal, para que ningun
// contenedor con overflow-hidden (acordeones, tablas) lo recorte.
export default function ClasificacionDot({ clasificacion, size = 'md', mostrarVacio = true }) {
    const [abierto, setAbierto] = useState(false);
    const [esMovil, setEsMovil] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const ref = useRef(null);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Cierra el tooltip al hacer clic/tap fuera (solo movil)
    useEffect(() => {
        if (!abierto) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [abierto]);

    // Calcula la posicion del tooltip cuando se abre y al hacer scroll/resize
    useEffect(() => {
        if (!abierto || !ref.current) return;
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setPos({
                top: rect.top,
                left: rect.left + rect.width / 2,
            });
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [abierto]);

    const tamanos = {
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-8 h-8',
    };
    const tamano = tamanos[size] || tamanos.md;

    // Clasificación vacía
    if (!clasificacion) {
        if (!mostrarVacio) return null;
        return (
            <div
                className={`${tamano} rounded-lg bg-gray-100 border border-gray-200 inline-block align-middle`}
                aria-label="Sin clasificar"
                title={!esMovil ? 'Sin clasificar' : undefined}
            />
        );
    }

    const color = CLASIFICACION_COLOR[clasificacion] || 'bg-gray-400';
    const label = CLASIFICACION_LABELS[clasificacion] || clasificacion;

    // Tooltip renderizado en document.body via portal
    const tooltip = abierto && typeof document !== 'undefined'
        ? createPortal(
            <div
                style={{
                    position: 'fixed',
                    top: `${pos.top - 8}px`,
                    left: `${pos.left}px`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}
                className="bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap"
            >
                {label}
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-1px)',
                    }}
                >
                    <div className="w-2.5 h-2.5 bg-gray-900 rotate-45"></div>
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div ref={ref} className="relative inline-block align-middle">
                <button
                    type="button"
                    className={`${tamano} rounded-lg ${color} shadow-sm cursor-help transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FF5900]/50`}
                    onMouseEnter={() => !esMovil && setAbierto(true)}
                    onMouseLeave={() => !esMovil && setAbierto(false)}
                    onClick={() => esMovil && setAbierto(v => !v)}
                    aria-label={`Clasificación: ${label}`}
                />
            </div>
            {tooltip}
        </>
    );
}
// resources/js/Components/BotonVolverArriba.jsx
import { useState, useEffect } from 'react';

/**
 * Botón flotante "Volver arriba" — se muestra cuando el usuario
 * ha hecho scroll más de `umbral` píxeles. Al hacer clic, sube suave.
 *
 * Props:
 *   - umbral (number): desde qué scroll se muestra. Default 300.
 *   - color   (string): clases del botón. Default naranja institucional.
 *   - posicion(string): clases de posición. Default 'bottom-6 right-6'.
 */
export default function BotonVolverArriba({
    umbral = 300,
    color = 'bg-[#FF5900] hover:bg-[#CC4700]',
    posicion = 'bottom-6 right-6',
}) {
    const [mostrar, setMostrar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setMostrar(window.scrollY > umbral);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [umbral]);

    const irArriba = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            type="button"
            onClick={irArriba}
            aria-label="Volver arriba"
            title="Volver arriba"
            className={`fixed ${posicion} z-40 inline-flex items-center justify-center w-12 h-12 rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ${color} ${
                mostrar
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
}
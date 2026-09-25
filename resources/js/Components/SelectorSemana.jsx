// resources/js/Components/SelectorSemana.jsx
import { useState, useEffect } from 'react';

export default function SelectorSemana({ value, onChange, label = 'Semana', disabled = false }) {
    const [semana, setSemana] = useState(value || '');
    const [rangoFechas, setRangoFechas] = useState('');

    // Sincronizar cuando el padre cambia el valor externo
    useEffect(() => {
        setSemana(value || '');
    }, [value]);

    // Calcular rango de fechas cuando cambia la semana
    useEffect(() => {
        if (semana) {
            const [year, week] = semana.split('-W');
            const fechaInicio = new Date(year, 0, 1);
            const diasOffset = (parseInt(week) - 1) * 7;
            fechaInicio.setDate(fechaInicio.getDate() + diasOffset);
            while (fechaInicio.getDay() !== 1) {
                fechaInicio.setDate(fechaInicio.getDate() - 1);
            }
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 4);

            const opciones = { day: '2-digit', month: 'short' };
            const inicioStr = fechaInicio.toLocaleDateString('es-ES', opciones);
            const finStr = fechaFin.toLocaleDateString('es-ES', opciones);
            setRangoFechas(`${inicioStr} - ${finStr}`);
        } else {
            setRangoFechas('');
        }
    }, [semana]);

    const semanaAnterior = () => {
        if (!semana || disabled) return;
        const [year, week] = semana.split('-W');
        let newWeek = parseInt(week) - 1;
        let newYear = parseInt(year);
        if (newWeek < 1) { newWeek = 52; newYear--; }
        const nuevaSemana = `${newYear}-W${String(newWeek).padStart(2, '0')}`;
        setSemana(nuevaSemana);
        if (onChange) onChange(nuevaSemana);
    };

    const semanaSiguiente = () => {
        if (!semana || disabled) return;
        const [year, week] = semana.split('-W');
        let newWeek = parseInt(week) + 1;
        let newYear = parseInt(year);
        if (newWeek > 52) { newWeek = 1; newYear++; }
        const nuevaSemana = `${newYear}-W${String(newWeek).padStart(2, '0')}`;
        setSemana(nuevaSemana);
        if (onChange) onChange(nuevaSemana);
    };

    const irASemanaActual = () => {
        if (disabled) return;
        const ahora = new Date();
        const year = ahora.getFullYear();
        const inicio = new Date(year, 0, 1);
        const diff = (ahora - inicio) / (86400000 * 7);
        const weekNum = Math.ceil(diff);
        const nuevaSemana = `${year}-W${String(weekNum).padStart(2, '0')}`;
        setSemana(nuevaSemana);
        if (onChange) onChange(nuevaSemana);
    };

    const handleChange = (e) => {
        const valor = e.target.value;
        setSemana(valor);
        if (onChange) onChange(valor);
    };

    const getSemanaActual = () => {
        const ahora = new Date();
        const year = ahora.getFullYear();
        const inicio = new Date(year, 0, 1);
        const diff = (ahora - inicio) / (86400000 * 7);
        const weekNum = Math.ceil(diff);
        return `${year}-W${String(weekNum).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">{label}</label>
            )}

            {/* Input + flechas de navegación */}
            <div className={`flex items-center gap-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                    type="button"
                    onClick={semanaAnterior}
                    disabled={disabled}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                    title="Semana anterior"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex-1 min-w-0">
                    <input
                        type="week"
                        value={semana}
                        onChange={handleChange}
                        disabled={disabled}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                        placeholder={`Ej: ${getSemanaActual()}`}
                    />
                </div>

                <button
                    type="button"
                    onClick={semanaSiguiente}
                    disabled={disabled}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                    title="Semana siguiente"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Rango de fechas + botón "Ir a hoy" */}
            <div className="flex items-center justify-between gap-2 min-h-[24px]">
                {rangoFechas ? (
                    <span className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1 truncate">
                        📅 {rangoFechas}
                    </span>
                ) : (
                    <span />
                )}
                <button
                    type="button"
                    onClick={irASemanaActual}
                    disabled={disabled}
                    className="text-xs font-medium text-[#FF5900] hover:bg-[#FF5900]/10 rounded-lg px-2 py-1 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ir a la semana actual"
                >
                    Semana Actual
                </button>
            </div>
        </div>
    );
}
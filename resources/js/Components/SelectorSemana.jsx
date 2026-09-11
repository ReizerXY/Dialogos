import { useState, useEffect } from 'react';

export default function SelectorSemana({ value, onChange, label = 'Semana' }) {
    const [semana, setSemana] = useState(value || '');
    const [rangoFechas, setRangoFechas] = useState('');

    // Calcular rango de fechas cuando cambia la semana
    useEffect(() => {
        if (semana) {
            const [year, week] = semana.split('-W');
            const fechaInicio = new Date(year, 0, 1);
            const diasOffset = (parseInt(week) - 1) * 7;
            fechaInicio.setDate(fechaInicio.getDate() + diasOffset);
            // Ajustar al lunes
            while (fechaInicio.getDay() !== 1) {
                fechaInicio.setDate(fechaInicio.getDate() - 1);
            }
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 4); // viernes

            const opciones = { day: '2-digit', month: 'short' };
            const inicioStr = fechaInicio.toLocaleDateString('es-ES', opciones);
            const finStr = fechaFin.toLocaleDateString('es-ES', opciones);
            setRangoFechas(`${inicioStr} - ${finStr}`);
        } else {
            setRangoFechas('');
        }
    }, [semana]);

    // Ir a la semana anterior
    const semanaAnterior = () => {
        if (!semana) return;
        const [year, week] = semana.split('-W');
        let newWeek = parseInt(week) - 1;
        let newYear = parseInt(year);
        if (newWeek < 1) {
            newWeek = 52;
            newYear--;
        }
        const nuevaSemana = `${newYear}-W${String(newWeek).padStart(2, '0')}`;
        setSemana(nuevaSemana);
        if (onChange) onChange(nuevaSemana);
    };

    // Ir a la semana siguiente
    const semanaSiguiente = () => {
        if (!semana) return;
        const [year, week] = semana.split('-W');
        let newWeek = parseInt(week) + 1;
        let newYear = parseInt(year);
        if (newWeek > 52) {
            newWeek = 1;
            newYear++;
        }
        const nuevaSemana = `${newYear}-W${String(newWeek).padStart(2, '0')}`;
        setSemana(nuevaSemana);
        if (onChange) onChange(nuevaSemana);
    };

    // Ir a la semana actual
    const semanaActual = () => {
        const ahora = new Date();
        const year = ahora.getFullYear();
        // Calcular número de semana
        const inicio = new Date(year, 0, 1);
        const diff = (ahora - inicio) / (86400000 * 7);
        const weekNum = Math.ceil(diff);
        const nuevaSemana = `${year}-W${String(weekNum).padStart(2, '0')}`;
        setSemana(nuevaSemana);
        if (onChange) onChange(nuevaSemana);
    };

    // Manejar cambio manual
    const handleChange = (e) => {
        const valor = e.target.value;
        setSemana(valor);
        if (onChange) onChange(valor);
    };

    // Obtener semana actual para el placeholder
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
            <div className="flex items-center gap-2">
                {/* Botón semana anterior */}
                <button
                    type="button"
                    onClick={semanaAnterior}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Semana anterior"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Selector de semana (input type week) */}
                <div className="flex-1">
                    <input
                        type="week"
                        value={semana}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                        placeholder={`Ej: ${getSemanaActual()}`}
                    />
                </div>

                {/* Botón semana siguiente */}
                <button
                    type="button"
                    onClick={semanaSiguiente}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Semana siguiente"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Botón "Hoy" */}
                <button
                    type="button"
                    onClick={semanaActual}
                    className="px-3 py-2 text-sm font-medium text-[#FF5900] hover:bg-[#FF5900]/10 rounded-xl transition-colors whitespace-nowrap"
                    title="Ir a la semana actual"
                >
                    Hoy
                </button>
            </div>

            {/* Mostrar rango de fechas */}
            {rangoFechas && (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
                    📅 {rangoFechas}
                </div>
            )}
        </div>
    );
}
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SelectorSemana from '@/Components/SelectorSemana';

export default function Reportes({ user }) {
    const [tipo, setTipo] = useState('citas');
    const [periodo, setPeriodo] = useState('semana');
    const [semana, setSemana] = useState('');
    const [mes, setMes] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [generando, setGenerando] = useState(false);

    // ✅ Función corregida para obtener la semana ISO
    function getWeekNumber(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }

    // ✅ Obtener el lunes de la semana pasada (correctamente)
    function getMondayOfLastWeek() {
        const hoy = new Date();
        const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay(); // Dom=7, Lun=1, ..., Sáb=6
        const lunesEstaSemana = new Date(hoy);
        lunesEstaSemana.setDate(hoy.getDate() - (diaSemana - 1));
        const lunesSemanaPasada = new Date(lunesEstaSemana);
        lunesSemanaPasada.setDate(lunesEstaSemana.getDate() - 7);
        return lunesSemanaPasada;
    }

    // Calcular fechas por defecto según el periodo
    useEffect(() => {
        if (periodo === 'semana') {
            const lunesPasado = getMondayOfLastWeek();
            const year = lunesPasado.getFullYear();
            const semanaNum = getWeekNumber(lunesPasado);
            setSemana(`${year}-W${String(semanaNum).padStart(2, '0')}`);
            setMes('');
            setFechaInicio('');
            setFechaFin('');
        } else if (periodo === 'mes') {
            const inicio = new Date();
            inicio.setMonth(inicio.getMonth() - 1);
            inicio.setDate(1);
            const year = inicio.getFullYear();
            const mesNum = inicio.getMonth() + 1;
            setMes(`${year}-${String(mesNum).padStart(2, '0')}`);
            setSemana('');
            setFechaInicio('');
            setFechaFin('');
        } else {
            setSemana('');
            setMes('');
            setFechaInicio('');
            setFechaFin('');
        }
    }, [periodo]);

    // ✅ Generar PDF con descarga sin navegación
    const handleGenerarPDF = (e) => {
        e.preventDefault();

        if (generando) return;
        setGenerando(true);

        let url = `/reportes/generar?tipo=${tipo}&periodo=${periodo}`;

        if (periodo === 'semana' && semana) {
            url += `&semana=${semana}`;
        } else if (periodo === 'mes' && mes) {
            url += `&mes=${mes}`;
        } else if (periodo === 'libre') {
            if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
            if (fechaFin) url += `&fecha_fin=${fechaFin}`;
        }

        // ✅ Descargar sin navegar (mantiene el estado del formulario)
        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // ✅ Dar tiempo a que el navegador procese la descarga
        setTimeout(() => setGenerando(false), 1200);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reportes" />
            <div className="max-w-4xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                    <p className="text-gray-500 mt-1">Genera reportes en PDF para análisis y seguimiento</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                    <form onSubmit={handleGenerarPDF} className="space-y-6">
                        {/* Tipo de reporte */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de reporte</label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                            >
                                <option value="citas">Citas</option>
                                <option value="estudiantes">Estudiantes atendidos</option>
                                <option value="formadores">Productividad por formador</option>
                            </select>
                        </div>

                        {/* Periodo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Periodo</label>
                            <select
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                            >
                                <option value="semana">Semana</option>
                                <option value="mes">Mes</option>
                                <option value="libre">Elección libre</option>
                            </select>
                        </div>

                        {/* Campos según el periodo */}
                        {periodo === 'semana' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar semana</label>
                                <SelectorSemana
                                    value={semana}
                                    onChange={(nuevaSemana) => setSemana(nuevaSemana)}
                                    label=""
                                />
                                <p className="text-xs text-gray-400 mt-1">Navega con las flechas o selecciona una semana en el calendario.</p>
                            </div>
                        )}

                        {periodo === 'mes' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar mes</label>
                                <input
                                    type="month"
                                    value={mes}
                                    onChange={(e) => setMes(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Selecciona un mes para generar el reporte.</p>
                            </div>
                        )}

                        {periodo === 'libre' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha inicio</label>
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha fin</label>
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Botón de generar */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={generando}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5900] text-white font-semibold rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generando ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generar PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Los reportes se generan en formato PDF con los datos seleccionados.
                            {periodo === 'semana' && ' Selecciona una semana específica.'}
                            {periodo === 'mes' && ' Selecciona un mes específico.'}
                            {periodo === 'libre' && ' Selecciona un rango de fechas personalizado.'}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
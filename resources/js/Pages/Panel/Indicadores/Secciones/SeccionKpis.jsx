// resources/js/Pages/Panel/Indicadores/Secciones/SeccionKpis.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import KpiCard from '../Componentes/KpiCard';

export default function SeccionKpis({
    kpiValue,
    totalCitas, totalFormadores, totalEstudiantes, promedioCitasPorFormador,
    estudiantesAtendidos, tasaCompletacion, tasaCancelacion, tasaAsistencia,
    citasPorEstudiante,
    periodoTexto, contextoGradoGrupo,
}) {
    return (
        <SeccionPanel titulo={`Resumen general de ${periodoTexto}${contextoGradoGrupo}`}>
            <div className="space-y-6">

                {/* ─── Bloque: Volumen del periodo ─── */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#FF5900] rounded-full"></span>
                        Volumen del periodo
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <KpiCard value={kpiValue(totalCitas)} titulo="Citas registradas" subtitulo={`En ${periodoTexto}`} />
                        <KpiCard value={kpiValue(estudiantesAtendidos)} titulo="Estudiantes atendidos" subtitulo="Con al menos 1 cita" accent="blue" />
                        <KpiCard value={totalEstudiantes} titulo="Estudiantes inscritos" subtitulo="Registrados en el sistema" />
                        <KpiCard value={totalFormadores} titulo="Formadores activos" subtitulo="Cuentas habilitadas" />
                    </div>
                </div>

                {/* ─── Bloque: Eficiencia ─── */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#FF5900] rounded-full"></span>
                        Eficiencia
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <KpiCard value={kpiValue(`${tasaCompletacion}%`)} titulo="Citas completadas" subtitulo={`${tasaCompletacion}% del total`} accent="green" />
                        <KpiCard value={kpiValue(`${tasaCancelacion}%`)} titulo="Citas canceladas" subtitulo={`${tasaCancelacion}% del total`} accent="red" />
                        <KpiCard value={kpiValue(`${tasaAsistencia}%`)} titulo="Tasa de asistencia" subtitulo="De citas atendidas" accent="orange" />
                    </div>
                </div>

                {/* ─── Bloque: Promedios ─── */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#FF5900] rounded-full"></span>
                        Promedios
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                        <KpiCard value={kpiValue(promedioCitasPorFormador)} titulo="Citas por formador" subtitulo="Promedio del periodo" />
                        <KpiCard value={kpiValue(citasPorEstudiante)} titulo="Citas por estudiante" subtitulo="Promedio del periodo" accent="blue" />
                    </div>
                </div>

            </div>
        </SeccionPanel>
    );
}
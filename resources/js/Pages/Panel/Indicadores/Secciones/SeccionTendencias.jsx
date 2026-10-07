// resources/js/Pages/Panel/Indicadores/Secciones/SeccionTendencias.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import SubDesplegable from '../Componentes/SubDesplegable';
import TrendItem from '../Componentes/TrendItem';
import { mesTitulo, formatHora12 } from '../helpers';

export default function SeccionTendencias({
    citasPorMes,
    citasPorDiaSemana,
    citasPorHora,
    subTend,
    toggleSubTend,
    periodoTexto,
    contextoGradoGrupo,
    contextoSingular,
    contextoTexto,
    filtroSemana,
}) {
    return (
        <SeccionPanel titulo={`Tendencias de citas de ${periodoTexto}${contextoGradoGrupo}`}>
            <SubDesplegable
                titulo="Distribución mensual de citas"
                abierta={subTend.mes}
                onToggle={() => toggleSubTend('mes')}
            >
                {citasPorMes.length > 0 ? (
                    <div className="space-y-2">
                        {citasPorMes.map(item => (
                            <TrendItem
                                key={`m-${item.mes}`}
                                titulo={mesTitulo(item.mes)}
                                descripcion={`${item.total} ${item.total === 1 ? 'cita registrada' : 'citas registradas'}`}
                                total={item.total}
                            />
                        ))}
                    </div>
                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
            </SubDesplegable>

            <SubDesplegable
                titulo="Distribución de citas por día de la semana"
                abierta={subTend.dia}
                onToggle={() => toggleSubTend('dia')}
            >
                {Object.keys(citasPorDiaSemana).length > 0 ? (
                    <div className="space-y-2">
                        {Object.entries(citasPorDiaSemana).map(([dia, total]) => {
                            const plural = total === 1 ? 'cita' : 'citas';
                            const diaLower = dia.toLowerCase();
                            const descripcion = filtroSemana
                                ? `${total} ${plural} el ${diaLower} ${contextoSingular}`
                                : `${total} ${plural} los ${diaLower} ${contextoSingular}`;
                            return (
                                <TrendItem
                                    key={`d-${dia}`}
                                    titulo={dia}
                                    descripcion={descripcion}
                                    total={total}
                                />
                            );
                        })}
                    </div>
                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
            </SubDesplegable>

            <SubDesplegable
                titulo="Distribución de citas por hora del día"
                abierta={subTend.hora}
                onToggle={() => toggleSubTend('hora')}
            >
                {Object.keys(citasPorHora).length > 0 ? (
                    <div className="space-y-2">
                        {Object.entries(citasPorHora).map(([hora, total]) => {
                            const plural = total === 1 ? 'cita' : 'citas';
                            const descripcion = `${total} ${plural} a las ${formatHora12(hora)} ${contextoTexto}`;
                            return (
                                <TrendItem
                                    key={`h-${hora}`}
                                    titulo={formatHora12(hora)}
                                    descripcion={descripcion}
                                    total={total}
                                />
                            );
                        })}
                    </div>
                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
            </SubDesplegable>
        </SeccionPanel>
    );
}
// resources/js/Pages/Panel/Indicadores/Secciones/SeccionDestacados.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import SubDesplegable from '../Componentes/SubDesplegable';
import RankingItem from '../Componentes/RankingItem';

export default function SeccionDestacados({
    formadoresTop,
    estudiantesTop,
    subDest,
    toggleSubDest,
    periodoTexto,
    contextoGradoGrupo,
}) {
    return (
        <SeccionPanel titulo={`Formadores y estudiantes con más citas de ${periodoTexto}${contextoGradoGrupo}`}>
            <SubDesplegable
                titulo="Formadores con más citas atendidas"
                abierta={subDest.formadores}
                onToggle={() => toggleSubDest('formadores')}
            >
                {formadoresTop.length > 0 ? (
                    <div className="space-y-2">
                        {formadoresTop.map((item, i) => (
                            <RankingItem
                                key={`f-${i}`}
                                posicion={i}
                                nombre={item.nombre}
                                etiqueta={`Ocupa el puesto #${i + 1} en el periodo`}
                                total={item.total}
                                unidad="cita"
                            />
                        ))}
                    </div>
                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
            </SubDesplegable>

            <SubDesplegable
                titulo="Estudiantes con más citas recibidas"
                abierta={subDest.estudiantes}
                onToggle={() => toggleSubDest('estudiantes')}
            >
                {estudiantesTop.length > 0 ? (
                    <div className="space-y-2">
                        {estudiantesTop.map((item, i) => (
                            <RankingItem
                                key={`e-${i}`}
                                posicion={i}
                                nombre={item.nombre_estudiante}
                                etiqueta={`Ocupa el puesto #${i + 1} en el periodo`}
                                total={item.total}
                                unidad="cita"
                            />
                        ))}
                    </div>
                ) : <p className="text-gray-400 text-sm">No hay datos</p>}
            </SubDesplegable>
        </SeccionPanel>
    );
}
// resources/js/Pages/Panel/Indicadores/Secciones/SeccionComparativas.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import ComparativaCard from '../Componentes/ComparativaCard';

export default function SeccionComparativas({
    comparativaSemana,
    comparativaMes,
    claseDiff,
    periodoTexto,
    contextoGradoGrupo,
}) {
    return (
        <SeccionPanel titulo={`Comparativas de citas de ${periodoTexto}${contextoGradoGrupo}`}>
            {/* Ajustamos el grid para que respiren mejor si están las dos tarjetas */}
            <div className={`grid grid-cols-1 gap-6 ${comparativaSemana.mostrar && comparativaMes.mostrar ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
                {comparativaSemana.mostrar && (
                    <ComparativaCard
                        titulo={`Citas registradas: ${comparativaSemana.titulo}`}
                        labelActual={comparativaSemana.labelActual}
                        labelAnterior={comparativaSemana.labelAnterior}
                        actual={comparativaSemana.actual}
                        anterior={comparativaSemana.anterior}
                        diff={comparativaSemana.diff}
                        pct={comparativaSemana.pct}
                        claseDiff={claseDiff}
                    />
                )}
                {comparativaMes.mostrar && (
                    <ComparativaCard
                        titulo={`Citas registradas: ${comparativaMes.titulo}`}
                        labelActual={comparativaMes.labelActual}
                        labelAnterior={comparativaMes.labelAnterior}
                        actual={comparativaMes.actual}
                        anterior={comparativaMes.anterior}
                        diff={comparativaMes.diff}
                        pct={comparativaMes.pct}
                        claseDiff={claseDiff}
                    />
                )}
            </div>
        </SeccionPanel>
    );
}
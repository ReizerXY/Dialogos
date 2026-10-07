// resources/js/Pages/Panel/Indicadores/Secciones/SeccionCitas.jsx
import SeccionPanel from '../Componentes/SeccionPanel';
import { formatFecha } from '../helpers';

export default function SeccionCitas({
    citasDelPeriodo,
    tituloCitas,
    mensajeSinCitas,
}) {
    return (
        <SeccionPanel titulo={tituloCitas}>
            {citasDelPeriodo.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Formador</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {citasDelPeriodo.map(c => (
                                <tr key={`cita-${c.id_cita}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3.5 text-base text-gray-700">{c.nombre_estudiante}</td>
                                    <td className="px-6 py-3.5 text-base text-gray-700">{c.nombre_formador}</td>
                                    <td className="px-6 py-3.5 text-base text-gray-700">{formatFecha(c.fecha)}</td>
                                    <td className="px-6 py-3.5 text-base text-gray-700">{c.hora?.substring(0,5)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-12 text-center"><p className="text-gray-500 text-base">{mensajeSinCitas}</p></div>
            )}
        </SeccionPanel>
    );
}
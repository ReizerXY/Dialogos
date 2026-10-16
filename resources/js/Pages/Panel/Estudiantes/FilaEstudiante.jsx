// resources/js/Pages/Panel/Estudiantes/FilaEstudiante.jsx
import { memo } from 'react';

// Fila individual de la tabla de estudiantes (desktop)
const FilaEstudiante = memo(function FilaEstudiante({ estudiante, onEditar, onEliminar }) {
    const nombreCompleto = [estudiante.nombre, estudiante.apellido_paterno, estudiante.apellido_materno]
        .filter(Boolean)
        .join(' ');

    return (
        <tr className="hover:bg-[#FF5900]/5 transition-colors">
            <td className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {estudiante.id_estudiante}
                </span>
            </td>
            <td className="px-5 py-4 text-base text-gray-800 font-medium">
                {nombreCompleto}
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700]">
                    {estudiante.grado} · {estudiante.grupo}
                </span>
            </td>
            <td className="px-5 py-4">
                <div className="text-sm space-y-1">
                    {estudiante.contacto ? (
                        <div className="flex items-center gap-2 text-gray-700 font-mono">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {estudiante.contacto}
                        </div>
                    ) : (
                        <div className="text-gray-300 font-mono">—</div>
                    )}
                    {estudiante.contacto_emergencia && (
                        <div className="flex items-center gap-2 text-gray-500 font-mono">
                            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                            {estudiante.contacto_emergencia}
                            <span className="text-gray-400 font-sans text-xs">Emg.</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onEditar(estudiante)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar
                    </button>
                    <button
                        onClick={() => onEliminar(estudiante)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default FilaEstudiante;
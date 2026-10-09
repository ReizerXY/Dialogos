// resources/js/Pages/Panel/Estudiantes/FilaEstudiante.jsx
import { memo } from 'react';

// Fila individual de la tabla de estudiantes
const FilaEstudiante = memo(function FilaEstudiante({ estudiante, onEditar, onEliminar }) {
    return (
        <tr className="hover:bg-[#FF5900]/5 transition-colors">
            <td className="px-4 py-3 text-sm font-medium text-gray-800 font-mono">{estudiante.id_estudiante}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.nombre}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.apellido_paterno}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.apellido_materno}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.grado}</td>
            <td className="px-4 py-3 text-sm text-gray-700">{estudiante.grupo}</td>
            <td className="px-4 py-3 text-sm text-gray-700 font-mono">{estudiante.contacto || '-'}</td>
            <td className="px-4 py-3 text-sm text-gray-700 font-mono">{estudiante.contacto_emergencia || '-'}</td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onEditar(estudiante)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar
                    </button>
                    <button
                        onClick={() => onEliminar(estudiante)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
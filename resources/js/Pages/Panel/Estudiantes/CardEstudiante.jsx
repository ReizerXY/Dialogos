// resources/js/Pages/Panel/Estudiantes/CardEstudiante.jsx
import { memo } from 'react';

// Card de estudiante (vista móvil)
const CardEstudiante = memo(function CardEstudiante({ estudiante, onEditar, onEliminar }) {
    const nombreCompleto = [estudiante.nombre, estudiante.apellido_paterno, estudiante.apellido_materno]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="px-4 py-4">
            {/* Fila 1: ID + nombre */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {estudiante.id_estudiante}
                    </span>
                    <p className="text-base font-semibold text-gray-800 leading-snug mt-2">
                        {nombreCompleto}
                    </p>
                </div>
            </div>

            {/* Fila 2: Grado y grupo */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#FF5900]/10 text-[#CC4700]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {estudiante.grado} · Grupo {estudiante.grupo}
                </span>
            </div>

            {/* Fila 3: Contactos */}
            {(estudiante.contacto || estudiante.contacto_emergencia) && (
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                    {estudiante.contacto && (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="font-mono">{estudiante.contacto}</span>
                        </div>
                    )}
                    {estudiante.contacto_emergencia && (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                            <span className="font-mono">{estudiante.contacto_emergencia}</span>
                            <span className="text-gray-400 text-xs">(emergencia)</span>
                        </div>
                    )}
                </div>
            )}

            {/* Fila 4: Acciones */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onEditar(estudiante)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modificar
                </button>
                <button
                    onClick={() => onEliminar(estudiante)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
    );
});

export default CardEstudiante;
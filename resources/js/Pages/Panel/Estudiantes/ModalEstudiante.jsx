// resources/js/Pages/Panel/Estudiantes/ModalEstudiante.jsx
import { GRADOS } from './helpers';

export default function ModalEstudiante({
    isOpen,
    onClose,
    modoEdicion,
    formData,
    onChange,
    onGrupoChange,
    onSubmit,
    cargando,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 leading-tight">
                            {modoEdicion ? 'Editar estudiante' : 'Agregar estudiante'}
                        </h3>
                        <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                        aria-label="Cerrar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Estudiante *</label>
                        <input
                            type="text"
                            name="id_estudiante"
                            value={formData.id_estudiante}
                            onChange={onChange}
                            disabled={modoEdicion}
                            maxLength={10}
                            placeholder="Ej. 625447"
                            className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white ${modoEdicion ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            required
                        />
                        {modoEdicion && (
                            <p className="text-xs text-gray-500 mt-1">El ID no se puede modificar.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={onChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido paterno *</label>
                            <input
                                type="text"
                                name="apellido_paterno"
                                value={formData.apellido_paterno}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido materno *</label>
                            <input
                                type="text"
                                name="apellido_materno"
                                value={formData.apellido_materno}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Grado *</label>
                            <select
                                name="grado"
                                value={formData.grado}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white text-gray-700"
                                required
                            >
                                <option value="">Seleccionar</option>
                                {GRADOS.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Grupo * <span className="text-gray-400 font-normal">(A-Z)</span>
                            </label>
                            <input
                                type="text"
                                name="grupo"
                                value={formData.grupo}
                                onChange={onGrupoChange}
                                maxLength={5}
                                placeholder="A"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 uppercase focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Contacto</label>
                        <input
                            type="text"
                            name="contacto"
                            value={formData.contacto}
                            onChange={onChange}
                            maxLength={10}
                            placeholder="2712344587"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Contacto de emergencia</label>
                        <input
                            type="text"
                            name="contacto_emergencia"
                            value={formData.contacto_emergencia}
                            onChange={onChange}
                            maxLength={10}
                            placeholder="2712344587"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                        />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={cargando}
                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cargando ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {modoEdicion ? 'Guardar cambios' : 'Agregar estudiante'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
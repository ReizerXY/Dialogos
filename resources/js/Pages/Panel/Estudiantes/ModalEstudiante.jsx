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
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        {modoEdicion ? 'Editar estudiante' : 'Agregar estudiante'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Estudiante *</label>
                        <input
                            type="text"
                            name="id_estudiante"
                            value={formData.id_estudiante}
                            onChange={onChange}
                            disabled={modoEdicion}
                            maxLength={10}
                            placeholder="Ej. 625447"
                            className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white ${modoEdicion ? 'bg-gray-100 text-gray-500' : ''}`}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={onChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido paterno *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido materno *</label>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                        <input
                            type="text"
                            name="telefono_estudiante"
                            value={formData.telefono_estudiante}
                            onChange={onChange}
                            maxLength={10}
                            placeholder="2712344587"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de emergencia</label>
                        <input
                            type="text"
                            name="telefono_padre"
                            value={formData.telefono_padre}
                            onChange={onChange}
                            maxLength={10}
                            placeholder="2712344587"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                            {cargando ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
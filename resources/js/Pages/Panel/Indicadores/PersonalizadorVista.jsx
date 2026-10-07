// resources/js/Pages/Panel/Indicadores/PersonalizadorVista.jsx
import { SECCIONES_INFO } from './helpers';

// Panel para activar/desactivar secciones visibles
export default function PersonalizadorVista({ secciones, onToggleSeccion, onMostrarTodo, onOcultarTodo }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">Secciones visibles</h3>
                <div className="flex gap-2">
                    <button onClick={onMostrarTodo} className="text-sm px-3 py-1.5 bg-[#FF5900] text-white rounded-lg hover:bg-[#CC4700] transition">Mostrar todo</button>
                    <button onClick={onOcultarTodo} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Ocultar todo</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {SECCIONES_INFO.map(sec => (
                    <label key={sec.key} className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2.5 transition">
                        <input type="checkbox" checked={secciones[sec.key]} onChange={() => onToggleSeccion(sec.key)} className="w-4 h-4 text-[#FF5900] border-gray-300 rounded focus:ring-[#FF5900]" />
                        <span className="text-sm text-gray-700">{sec.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
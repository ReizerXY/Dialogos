import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function Expediente({ estudiante, citas, totalCitas, citasProgramadas, citasCompletadas, citasCanceladas, asistencias, faltas, pendientesAsistencia, egresado, user }) {
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [opcionesEstudiantes, setOpcionesEstudiantes] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    useEffect(() => {
        if (estudiante) {
            setEstudianteSeleccionado({
                value: estudiante.id_estudiante,
                label: egresado
                    ? `${estudiante.nombre} (${estudiante.id_estudiante}) - Egresado`
                    : `${estudiante.nombre} (${estudiante.id_estudiante}) - ${estudiante.grado} ${estudiante.grupo}`
            });
        }
    }, [estudiante, egresado]);

    useEffect(() => {
        if (inputValue.length < 1) {
            setOpcionesEstudiantes([]);
            return;
        }

        const delay = setTimeout(() => {
            setBuscando(true);
            setError(null);
            fetch(`/api/expediente/estudiantes?q=${encodeURIComponent(inputValue)}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Error ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const options = data.map(item => ({
                        value: item.id_estudiante,
                        label: item.egresado
                            ? `${item.nombre} (${item.id_estudiante}) - Egresado`
                            : `${item.nombre} (${item.id_estudiante}) - ${item.grado} ${item.grupo}`
                    }));
                    setOpcionesEstudiantes(options);
                    setBuscando(false);
                })
                .catch(err => {
                    console.error('Error:', err);
                    setError('No se pudieron cargar los estudiantes.');
                    setOpcionesEstudiantes([]);
                    setBuscando(false);
                });
        }, 500);

        return () => clearTimeout(delay);
    }, [inputValue]);

    const handleBuscar = () => {
        if (estudianteSeleccionado) {
            window.location.href = `/expediente/${estudianteSeleccionado.value}`;
        } else {
            alert('Por favor, selecciona un estudiante de la lista.');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Expediente de estudiantes" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Expediente de estudiantes</h1>
                    <p className="text-gray-500 mt-1">Consulta el historial completo de citas de cada estudiante</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar estudiante por nombre o ID
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Select
                                options={opcionesEstudiantes}
                                value={estudianteSeleccionado}
                                onChange={setEstudianteSeleccionado}
                                onInputChange={(newValue) => setInputValue(newValue)}
                                placeholder="Escribe nombre o ID..."
                                isClearable
                                className="mt-1"
                                classNamePrefix="select"
                                isLoading={buscando}
                                noOptionsMessage={() => inputValue.length < 1 ? 'Escribe para buscar' : 'No se encontraron estudiantes'}
                                loadingMessage={() => 'Buscando...'}
                                filterOption={() => true}
                                onBlur={() => {
                                    if (!estudianteSeleccionado) {
                                        setInputValue('');
                                        setOpcionesEstudiantes([]);
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={handleBuscar}
                            className="px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                            Buscar
                        </button>
                    </div>
                    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    <p className="mt-2 text-xs text-gray-400">
                        Escribe al menos 1 carácter para buscar por nombre o ID. Se incluyen estudiantes egresados.
                    </p>
                </div>

                {estudiante ? (
                    <div className="space-y-6">
                        {egresado && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-yellow-800">Estudiante egresado de la institución</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Este estudiante ya no está en el registro activo. Se conserva su historial de citas.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#FF5900]/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Datos del estudiante</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">ID Estudiante</span>
                                    <p className="font-semibold text-gray-800 font-mono">{estudiante.id_estudiante}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Nombre completo</span>
                                    <p className="font-semibold text-gray-800">{estudiante.nombre}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Grado</span>
                                    <p className="font-semibold text-gray-800">{estudiante.grado}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Grupo</span>
                                    <p className="font-semibold text-gray-800">{estudiante.grupo}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Teléfono estudiante</span>
                                    <p className="font-semibold text-gray-800 font-mono">{estudiante.telefono_estudiante || 'No registrado'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Teléfono padre/tutor</span>
                                    <p className="font-semibold text-gray-800 font-mono">{estudiante.telefono_padre || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Estados de citas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                                    <div className="text-2xl font-bold text-blue-600">{totalCitas}</div>
                                    <div className="text-sm text-gray-600">Total citas</div>
                                </div>
                                <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-100">
                                    <div className="text-2xl font-bold text-yellow-600">{citasProgramadas}</div>
                                    <div className="text-sm text-gray-600">Programadas</div>
                                </div>
                                <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                                    <div className="text-2xl font-bold text-green-600">{citasCompletadas}</div>
                                    <div className="text-sm text-gray-600">Completadas</div>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                                    <div className="text-2xl font-bold text-red-600">{citasCanceladas}</div>
                                    <div className="text-sm text-gray-600">Canceladas</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Asistencia a citas</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                                    <div className="text-2xl font-bold text-green-600">{asistencias}</div>
                                    <div className="text-sm text-gray-600">Asistió</div>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                                    <div className="text-2xl font-bold text-red-600">{faltas}</div>
                                    <div className="text-sm text-gray-600">No asistió</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200">
                                    <div className="text-2xl font-bold text-gray-600">{pendientesAsistencia}</div>
                                    <div className="text-sm text-gray-600">Pendiente</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800">Historial de citas</h2>
                            </div>
                            {citas.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formador</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clasificación</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {citas.map(c => (
                                                <tr key={c.id_cita} className="hover:bg-[#FF5900]/5 transition-colors duration-150">
                                                    <td className="px-4 py-3 text-sm text-gray-700">{c.nombre_formador}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{formatFecha(c.fecha)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{c.hora?.substring(0,5)}</td>
                                                    <td className="px-4 py-3">
                                                        {c.clasificacion ? (
                                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {c.clasificacion}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            c.estado === 'programada' ? 'bg-yellow-100 text-yellow-800' :
                                                            c.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                                            c.estado === 'cancelada_liberada' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {c.estado === 'cancelada_liberada' ? 'Cancelada (liberada)' : c.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            c.asistencia === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                                                            c.asistencia === 'asistió' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {c.asistencia || 'pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                                        {c.notas || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500">No hay citas registradas para este estudiante.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-16 text-center">
                        <svg className="mx-auto h-20 w-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-600">Busca un estudiante</h3>
                        <p className="text-gray-400 mt-1">Escribe el nombre o el ID y haz clic en "Buscar" para ver su expediente completo.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
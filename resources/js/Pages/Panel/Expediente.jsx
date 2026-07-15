import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function Expediente({ estudiante, citas, totalCitas, citasProgramadas, citasCompletadas, citasCanceladas, user }) {
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [opcionesEstudiantes, setOpcionesEstudiantes] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);

    // Si ya hay un estudiante cargado (por parámetro URL), lo seteamos
    useEffect(() => {
        if (estudiante) {
            setEstudianteSeleccionado({
                value: estudiante.matricula,
                label: `${estudiante.nombre} (${estudiante.matricula}) - ${estudiante.grado} ${estudiante.grupo}`
            });
        }
    }, [estudiante]);

    // Buscar estudiantes con debounce (igual que en SolicitarCita)
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
                    console.log('Estudiantes encontrados:', data); // Depuración
                    const options = data.map(item => ({
                        value: item.matricula,
                        label: `${item.nombre} (${item.matricula}) - ${item.grado} ${item.grupo}`
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
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Expediente de estudiantes</h1>

                {/* Buscador predictivo (igual que el formulario) */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar estudiante por nombre o matrícula
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Select
                                options={opcionesEstudiantes}
                                value={estudianteSeleccionado}
                                onChange={setEstudianteSeleccionado}
                                onInputChange={(newValue) => setInputValue(newValue)}
                                placeholder="Escribe nombre o matrícula..."
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
                            className="mt-1 px-6 py-2 bg-[#FF5900] text-white rounded hover:bg-[#CC4700] transition-colors whitespace-nowrap"
                        >
                            Buscar
                        </button>
                    </div>
                    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                        Escribe al menos 1 carácter para buscar por nombre o matrícula.
                    </p>
                </div>

                {/* Mostrar expediente si hay estudiante seleccionado */}
                {estudiante ? (
                    <div className="space-y-6">
                        {/* Tarjeta de datos del estudiante */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold text-[#FF5900] mb-4">Datos del estudiante</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-sm text-gray-500">Matrícula</span>
                                    <p className="font-semibold">{estudiante.matricula}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-sm text-gray-500">Nombre completo</span>
                                    <p className="font-semibold">{estudiante.nombre}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-sm text-gray-500">Grado</span>
                                    <p className="font-semibold">{estudiante.grado}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-sm text-gray-500">Grupo</span>
                                    <p className="font-semibold">{estudiante.grupo}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-sm text-gray-500">Teléfono estudiante</span>
                                    <p className="font-semibold">{estudiante.telefono_estudiante || 'No registrado'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <span className="text-sm text-gray-500">Teléfono padre/tutor</span>
                                    <p className="font-semibold">{estudiante.telefono_padre || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-blue-600">{totalCitas}</div>
                                <div className="text-sm text-gray-600">Total citas</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-yellow-600">{citasProgramadas}</div>
                                <div className="text-sm text-gray-600">Programadas</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-green-600">{citasCompletadas}</div>
                                <div className="text-sm text-gray-600">Completadas</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg shadow text-center">
                                <div className="text-2xl font-bold text-red-600">{citasCanceladas}</div>
                                <div className="text-sm text-gray-600">Canceladas</div>
                            </div>
                        </div>

                        {/* Historial de citas */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4">Historial de citas</h2>
                            {citas.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formador</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clasificación</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {citas.map(c => (
                                                <tr key={c.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">{c.nombre_formador}</td>
                                                    <td className="px-4 py-3">{c.fecha}</td>
                                                    <td className="px-4 py-3">{c.hora?.substring(0,5)}</td>
                                                    <td className="px-4 py-3">
                                                        {c.clasificacion ? (
                                                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                                                {c.clasificacion}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            c.estado === 'programada' ? 'bg-yellow-100 text-yellow-800' :
                                                            c.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {c.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            c.asistencia === 'pendiente' ? 'bg-gray-100 text-gray-600' :
                                                            c.asistencia === 'asistió' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {c.asistencia || 'pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-xs truncate">
                                                        {c.notas || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">No hay citas registradas para este estudiante.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-600">Busca un estudiante</h3>
                        <p className="text-gray-400">Escribe el nombre o la matrícula y haz clic en "Buscar" para ver su expediente completo.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
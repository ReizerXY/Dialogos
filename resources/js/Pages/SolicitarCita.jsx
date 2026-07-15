import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Select from 'react-select';

export default function SolicitarCita({ formadores }) {
    const [formador, setFormador] = useState(null);
    const [estudiante, setEstudiante] = useState(null);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());
    const [disponibilidad, setDisponibilidad] = useState({});
    const [loading, setLoading] = useState(false);
    const [estudiantesOptions, setEstudiantesOptions] = useState([]);
    const [buscandoEstudiantes, setBuscandoEstudiantes] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Obtener disponibilidad cuando cambia formador
    useEffect(() => {
        if (!formador) {
            setDisponibilidad({});
            setFechaSeleccionada(null);
            setHoraSeleccionada('');
            return;
        }
        setLoading(true);
        fetch(`/api/disponibilidad?formador_id=${formador.value}`)
            .then(res => res.json())
            .then(data => {
                setDisponibilidad(data);
                setLoading(false);
                setFechaSeleccionada(null);
                setHoraSeleccionada('');
            })
            .catch(() => setLoading(false));
    }, [formador]);

    // Buscar estudiantes con debounce
    useEffect(() => {
        if (inputValue.length < 1) {
            setEstudiantesOptions([]);
            return;
        }

        const delay = setTimeout(() => {
            setBuscandoEstudiantes(true);
            fetch(`/api/estudiantes?q=${encodeURIComponent(inputValue)}`)
                .then(res => res.json())
                .then(data => {
                    const options = data.map(item => ({
                        value: item.matricula,
                        label: `${item.nombre} (${item.matricula}) - ${item.grado} ${item.grupo}`
                    }));
                    setEstudiantesOptions(options);
                    setBuscandoEstudiantes(false);
                })
                .catch(() => {
                    setEstudiantesOptions([]);
                    setBuscandoEstudiantes(false);
                });
        }, 500);

        return () => clearTimeout(delay);
    }, [inputValue]);

    // Funciones del calendario
    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();
    const formatDate = (year, month, day) => {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const today = new Date();
    const hoy = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 7);
    const limiteStr = formatDate(fechaLimite.getFullYear(), fechaLimite.getMonth() + 1, fechaLimite.getDate());

    const diasEnMes = getDaysInMonth(anioActual, mesActual);
    const primerDia = getFirstDayOfMonth(anioActual, mesActual);
    const dias = [];

    for (let i = 0; i < primerDia; i++) {
        dias.push(null);
    }

    const fechasDisponibles = Object.keys(disponibilidad);

    for (let i = 1; i <= diasEnMes; i++) {
        const fechaStr = formatDate(anioActual, mesActual, i);
        const esPasada = fechaStr < hoy;
        const esFutura = fechaStr > limiteStr;
        const deshabilitado = esPasada || esFutura;
        const disponible = fechasDisponibles.includes(fechaStr) && !deshabilitado;

        dias.push({
            dia: i,
            fechaStr,
            disponible,
            deshabilitado,
            esHoy: fechaStr === hoy,
        });
    }

    const cambiarMes = (incremento) => {
        let nuevoMes = mesActual + incremento;
        let nuevoAnio = anioActual;
        if (nuevoMes > 12) { nuevoMes = 1; nuevoAnio++; }
        else if (nuevoMes < 1) { nuevoMes = 12; nuevoAnio--; }
        setMesActual(nuevoMes);
        setAnioActual(nuevoAnio);
        setFechaSeleccionada(null);
        setHoraSeleccionada('');
    };

    // Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!estudiante || !estudiante.value) {
            alert('Por favor, selecciona un estudiante válido de la lista.');
            return;
        }

        if (!formador || !fechaSeleccionada || !horaSeleccionada) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Obtener token CSRF
        let csrfToken = null;
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            csrfToken = metaToken.getAttribute('content');
        }
        if (!csrfToken) {
            alert('Error de seguridad: no se encontró el token CSRF. Recarga la página.');
            return;
        }

        const data = {
            nombre_estudiante: estudiante.label.split(' (')[0],
            usuario_id: formador.value,
            fecha: fechaSeleccionada,
            hora: horaSeleccionada,
        };

        try {
            const response = await fetch('/solicitar-cita', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ ' + result.message);
                // Limpiar formulario
                setEstudiante(null);
                setFormador(null);
                setFechaSeleccionada(null);
                setHoraSeleccionada('');
                setInputValue('');
                setEstudiantesOptions([]);
            } else {
                alert('❌ ' + (result.message || 'Error desconocido'));
            }
        } catch (error) {
            alert('❌ Error de conexión. Inténtalo de nuevo.');
            console.error('Error:', error);
        }
    };

    // Preparar opciones para el select de formadores
    const formadorOptions = formadores.map(f => ({ value: f.id, label: f.nombre }));

    return (
        <GuestLayout title="Solicitar cita">
            <Head title="Solicitar cita" />
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Solicitar cita</h1>
                <p className="text-gray-600 mb-6">Completa el formulario para solicitar una cita con el personal administrativo.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Formador */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Selecciona un formador</label>
                        <Select
                            options={formadorOptions}
                            value={formador}
                            onChange={setFormador}
                            placeholder="-- Elige un formador --"
                            isClearable
                            className="mt-1"
                            classNamePrefix="select"
                        />
                    </div>

                    {/* Estudiante */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estudiante (nombre o matrícula)</label>
                        <Select
                            options={estudiantesOptions}
                            value={estudiante}
                            onChange={setEstudiante}
                            onInputChange={(newValue) => setInputValue(newValue)}
                            placeholder="Escribe nombre o matrícula..."
                            isClearable
                            className="mt-1"
                            classNamePrefix="select"
                            isLoading={buscandoEstudiantes}
                            noOptionsMessage={() => inputValue.length < 1 ? 'Escribe para buscar' : 'No se encontraron estudiantes'}
                            loadingMessage={() => 'Buscando...'}
                            filterOption={() => true}
                            onBlur={() => {
                                if (!estudiante) {
                                    setInputValue('');
                                    setEstudiantesOptions([]);
                                }
                            }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Escribe al menos 1 carácter para buscar por nombre o matrícula.
                        </p>
                    </div>

                    {/* Calendario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona una fecha</label>
                        {loading && <p className="text-sm text-gray-500">Cargando disponibilidad...</p>}
                        {!loading && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="flex justify-between items-center mb-4">
                                    <button type="button" onClick={() => cambiarMes(-1)} className="text-[#FF5900] hover:text-[#CC4700]">&larr;</button>
                                    <span className="font-semibold">
                                        {new Date(anioActual, mesActual - 1).toLocaleString('es', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button type="button" onClick={() => cambiarMes(1)} className="text-[#FF5900] hover:text-[#CC4700]">&rarr;</button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d} className="text-xs font-medium text-gray-500">{d}</div>)}

                                    {dias.map((dia, index) => {
                                        if (dia === null) return <div key={index} className="p-2"></div>;

                                        const esSeleccionada = fechaSeleccionada === dia.fechaStr;
                                        let claseDia = 'p-2 rounded-md cursor-pointer text-sm transition-colors duration-150';

                                        if (dia.deshabilitado) {
                                            claseDia += ' text-gray-300 cursor-not-allowed';
                                        } else if (dia.disponible) {
                                            claseDia += ' bg-green-100 hover:bg-green-200 text-gray-800';
                                            if (esSeleccionada) {
                                                claseDia += ' ring-2 ring-[#FF5900]';
                                            }
                                        } else {
                                            claseDia += ' bg-gray-100 hover:bg-gray-200 text-gray-400';
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className={claseDia}
                                                onClick={() => {
                                                    if (!dia.deshabilitado && dia.disponible) {
                                                        setFechaSeleccionada(dia.fechaStr);
                                                        setHoraSeleccionada('');
                                                    } else if (!dia.deshabilitado && !dia.disponible) {
                                                        alert('No hay disponibilidad para esta fecha con el formador seleccionado.');
                                                    }
                                                }}
                                            >
                                                {dia.dia}
                                                {dia.esHoy && <span className="block text-[8px] text-[#FF5900]">Hoy</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {fechaSeleccionada && (
                            <p className="mt-2 text-sm text-gray-600">
                                Fecha seleccionada: <span className="font-medium">{fechaSeleccionada}</span>
                            </p>
                        )}
                    </div>

                    {/* Hora */}
                    {formador && fechaSeleccionada && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Selecciona una hora</label>
                            <select
                                value={horaSeleccionada}
                                onChange={(e) => setHoraSeleccionada(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF5900] focus:border-[#FF5900]"
                            >
                                <option value="">-- Elige una hora --</option>
                                {disponibilidad[fechaSeleccionada]?.map(hora => (
                                    <option key={hora} value={hora.substring(0, 5)}>
                                        {hora.substring(0, 5)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#FF5900] text-white font-semibold rounded-lg hover:bg-[#CC4700] transition-colors duration-200"
                            disabled={!estudiante || !formador || !fechaSeleccionada || !horaSeleccionada}
                        >
                            Solicitar cita
                        </button>
                    </div>
                </form>

                {/* ✅ Nuevo enlace "Volver al inicio" con estilo mejorado */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF5900] border border-gray-300 hover:border-[#FF5900] px-4 py-2 rounded-md transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
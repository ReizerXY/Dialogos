import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function SolicitarCita({ formadores }) {
    const [formadorId, setFormadorId] = useState('');
    const [idEstudiante, setIdEstudiante] = useState('');
    const [estudianteNombre, setEstudianteNombre] = useState('');
    const [idValido, setIdValido] = useState(false);
    const [mensajeId, setMensajeId] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());
    const [disponibilidad, setDisponibilidad] = useState({});
    const [loading, setLoading] = useState(false);

    // ✅ Nuevo: aviso de disponibilidad (reemplaza alert)
    const [avisoDisponibilidad, setAvisoDisponibilidad] = useState('');

    const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
    const [modalExitoOpen, setModalExitoOpen] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    const [errores, setErrores] = useState({
        formador: false,
        idEstudiante: false,
        fecha: false,
        hora: false,
    });

    // ✅ Auto-cerrar el aviso después de 4 segundos
    useEffect(() => {
        if (avisoDisponibilidad) {
            const t = setTimeout(() => setAvisoDisponibilidad(''), 4000);
            return () => clearTimeout(t);
        }
    }, [avisoDisponibilidad]);

    // Verificar ID de estudiante con debounce
    useEffect(() => {
        if (idEstudiante.length < 1) {
            setIdValido(false);
            setEstudianteNombre('');
            setMensajeId('');
            return;
        }

        const delay = setTimeout(() => {
            fetch(`/api/verificar-estudiante/${encodeURIComponent(idEstudiante)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.existe) {
                        setIdValido(true);
                        setEstudianteNombre(data.nombre);
                        setMensajeId('✅ Estudiante válido: ' + data.nombre);
                    } else {
                        setIdValido(false);
                        setEstudianteNombre('');
                        setMensajeId('❌ ID no encontrado');
                    }
                })
                .catch(() => {
                    setIdValido(false);
                    setMensajeId('❌ Error al verificar');
                });
        }, 500);

        return () => clearTimeout(delay);
    }, [idEstudiante]);

    // Obtener disponibilidad cuando cambia formador
    useEffect(() => {
        if (!formadorId) {
            setDisponibilidad({});
            setFechaSeleccionada(null);
            setHoraSeleccionada('');
            return;
        }
        setLoading(true);
        fetch(`/api/disponibilidad?formador_id=${formadorId}`)
            .then(res => res.json())
            .then(data => {
                setDisponibilidad(data);
                setLoading(false);
                setFechaSeleccionada(null);
                setHoraSeleccionada('');
            })
            .catch(() => setLoading(false));
    }, [formadorId]);

    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();
    const formatDate = (year, month, day) => {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const today = new Date();
    const hoy = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const manana = new Date(today);
    manana.setDate(manana.getDate() + 1);
    const fechaMinima = formatDate(manana.getFullYear(), manana.getMonth() + 1, manana.getDate());

    const fechaLimite = new Date(today);
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
        const esHoy = fechaStr === hoy;
        const esPasada = fechaStr < fechaMinima;
        const esFutura = fechaStr > limiteStr;
        const deshabilitado = esPasada || esFutura;
        const disponible = fechasDisponibles.includes(fechaStr) && !deshabilitado;

        dias.push({
            dia: i,
            fechaStr,
            disponible,
            deshabilitado,
            esHoy,
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

    const handleAbrirConfirmacion = (e) => {
        e.preventDefault();

        const nuevosErrores = {
            formador: !formadorId,
            idEstudiante: !idValido || !estudianteNombre,
            fecha: !fechaSeleccionada,
            hora: !horaSeleccionada,
        };

        setErrores(nuevosErrores);

        if (Object.values(nuevosErrores).some(v => v === true)) {
            return;
        }

        setModalConfirmacionOpen(true);
    };

    const handleConfirmarCita = async () => {
        setEnviando(true);
        setMensajeError('');

        const metaToken = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = metaToken ? metaToken.getAttribute('content') : null;

        if (!csrfToken) {
            setMensajeError('Error de seguridad: no se encontró el token CSRF. Recarga la página.');
            setEnviando(false);
            return;
        }

        const data = {
            nombre_estudiante: estudianteNombre,
            usuario_id: formadorId,
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
                setModalConfirmacionOpen(false);
                setModalExitoOpen(true);
                setIdEstudiante('');
                setEstudianteNombre('');
                setIdValido(false);
                setMensajeId('');
                setFormadorId('');
                setFechaSeleccionada(null);
                setHoraSeleccionada('');
                setErrores({
                    formador: false,
                    idEstudiante: false,
                    fecha: false,
                    hora: false,
                });
            } else {
                setMensajeError(result.message || 'Error desconocido al guardar la cita.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMensajeError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setEnviando(false);
        }
    };

    const cerrarExito = () => {
        setModalExitoOpen(false);
    };

    const getErrorMensaje = (campo) => {
        const mensajes = {
            formador: 'Selecciona un formador.',
            idEstudiante: 'Ingresa un ID de estudiante válido.',
            fecha: 'Selecciona una fecha disponible.',
            hora: 'Selecciona una hora disponible.',
        };
        return errores[campo] ? mensajes[campo] : null;
    };

    return (
        <GuestLayout title="Solicitar cita">
            <Head title="Solicitar cita" />
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Solicitar cita</h1>
                <p className="text-gray-600 mb-6">Ingresa tu ID de estudiante y selecciona un formador, fecha y hora.</p>

                <form onSubmit={handleAbrirConfirmacion} className="space-y-6">
                    {/* Formador */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Selecciona un formador
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            value={formadorId}
                            onChange={(e) => {
                                setFormadorId(e.target.value);
                                setErrores(prev => ({ ...prev, formador: false }));
                            }}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF5900] focus:border-[#FF5900] ${
                                errores.formador ? 'border-red-500 ring-1 ring-red-500' : ''
                            }`}
                        >
                            <option value="">-- Elige un formador --</option>
                            {formadores.map(f => (
                                <option key={f.id} value={f.id}>{f.nombre}</option>
                            ))}
                        </select>
                        {getErrorMensaje('formador') && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {getErrorMensaje('formador')}
                            </p>
                        )}
                    </div>

                    {/* ID Estudiante */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            ID del estudiante
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            value={idEstudiante}
                            onChange={(e) => {
                                setIdEstudiante(e.target.value);
                                setErrores(prev => ({ ...prev, idEstudiante: false }));
                            }}
                            maxLength={10}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm font-mono focus:ring-[#FF5900] focus:border-[#FF5900] ${
                                idEstudiante && mensajeId.includes('❌') ? 'border-red-500' : ''
                            } ${idEstudiante && mensajeId.includes('✅') ? 'border-green-500' : ''} ${
                                errores.idEstudiante && !mensajeId.includes('✅') ? 'border-red-500 ring-1 ring-red-500' : ''
                            }`}
                            placeholder="Ej. 625447"
                            autoFocus
                        />
                        {mensajeId && (
                            <p className={`mt-1 text-sm ${mensajeId.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
                                {mensajeId}
                            </p>
                        )}
                        {errores.idEstudiante && !mensajeId.includes('✅') && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {getErrorMensaje('idEstudiante')}
                            </p>
                        )}
                    </div>

                    {/* Calendario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona una fecha
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        {loading && <p className="text-sm text-gray-500">Cargando disponibilidad...</p>}
                        {!loading && (
                            <div className={`bg-gray-50 p-4 rounded-md ${errores.fecha ? 'border-2 border-red-500' : ''}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <button type="button" onClick={() => cambiarMes(-1)} className="text-[#FF5900] hover:text-[#CC4700]">&larr;</button>
                                    <span className="font-semibold">
                                        {new Date(anioActual, mesActual - 1).toLocaleString('es', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button type="button" onClick={() => cambiarMes(1)} className="text-[#FF5900] hover:text-[#CC4700]">&rarr;</button>
                                </div>

                                {/* ✅ Aviso visual en lugar de alert */}
                                {avisoDisponibilidad && (
                                    <div className="mb-3 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                        </svg>
                                        <span>{avisoDisponibilidad}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d} className="text-xs font-medium text-gray-500">{d}</div>)}

                                    {dias.map((dia, index) => {
                                        if (dia === null) return <div key={index} className="p-2"></div>;

                                        const esSeleccionada = fechaSeleccionada === dia.fechaStr;
                                        let claseDia = 'p-2 rounded-md text-sm transition-colors duration-150';

                                        if (dia.deshabilitado) {
                                            claseDia += ' text-gray-300 cursor-not-allowed';
                                        } else if (dia.disponible) {
                                            claseDia += ' bg-green-100 hover:bg-green-200 text-gray-800 cursor-pointer';
                                            if (esSeleccionada) {
                                                claseDia += ' ring-2 ring-[#FF5900]';
                                            }
                                        } else {
                                            claseDia += ' bg-gray-100 text-gray-400 cursor-not-allowed';
                                        }

                                        if (dia.esHoy) {
                                            claseDia = 'p-2 rounded-md text-sm bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className={claseDia}
                                                onClick={() => {
                                                    if (!dia.deshabilitado && dia.disponible) {
                                                        setFechaSeleccionada(dia.fechaStr);
                                                        setErrores(prev => ({ ...prev, fecha: false }));
                                                        setHoraSeleccionada('');
                                                        setAvisoDisponibilidad(''); // limpiar aviso al seleccionar
                                                    } else if (!dia.deshabilitado && !dia.disponible) {
                                                        // ✅ Reemplazo del alert por banner visual
                                                        setAvisoDisponibilidad(`No hay disponibilidad para el ${dia.dia} con el formador seleccionado. Prueba otra fecha.`);
                                                    }
                                                }}
                                            >
                                                {dia.dia}
                                                {dia.esHoy && <span className="block text-[8px] text-[#FF5900] font-semibold">Hoy</span>}
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
                        {errores.fecha && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {getErrorMensaje('fecha')}
                            </p>
                        )}
                    </div>

                    {/* Hora */}
                    {formadorId && fechaSeleccionada && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Selecciona una hora
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                                value={horaSeleccionada}
                                onChange={(e) => {
                                    setHoraSeleccionada(e.target.value);
                                    setErrores(prev => ({ ...prev, hora: false }));
                                }}
                                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF5900] focus:border-[#FF5900] ${
                                    errores.hora ? 'border-red-500 ring-1 ring-red-500' : ''
                                }`}
                            >
                                <option value="">-- Elige una hora --</option>
                                {disponibilidad[fechaSeleccionada]?.map(hora => (
                                    <option key={hora} value={hora.substring(0, 5)}>
                                        {hora.substring(0, 5)}
                                    </option>
                                ))}
                            </select>
                            {getErrorMensaje('hora') && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {getErrorMensaje('hora')}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#FF5900] text-white font-semibold rounded-lg hover:bg-[#CC4700] transition-colors duration-200"
                        >
                            Solicitar cita
                        </button>
                    </div>
                </form>

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

            {/* Modal de confirmación */}
            {modalConfirmacionOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmar cita</h2>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
                            <p><span className="font-medium">Estudiante:</span> {estudianteNombre}</p>
                            <p><span className="font-medium">ID:</span> {idEstudiante}</p>
                            <p><span className="font-medium">Formador:</span> {formadores.find(f => f.id == formadorId)?.nombre}</p>
                            <p><span className="font-medium">Fecha:</span> {fechaSeleccionada}</p>
                            <p><span className="font-medium">Hora:</span> {horaSeleccionada}</p>
                        </div>
                        {mensajeError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                                ❌ {mensajeError}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setModalConfirmacionOpen(false);
                                    setMensajeError('');
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmarCita}
                                disabled={enviando}
                                className="px-6 py-2 bg-[#FF5900] text-white rounded-xl hover:bg-[#CC4700] transition disabled:opacity-50"
                            >
                                {enviando ? 'Enviando...' : 'Confirmar cita'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de éxito */}
            {modalExitoOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cita realizada!</h2>
                        <p className="text-gray-600 mb-6">
                            Tu cita ha sido agendada exitosamente. Recibirás un recordatorio por mensaje.
                        </p>
                        <button
                            type="button"
                            onClick={cerrarExito}
                            className="px-6 py-2 bg-[#FF5900] text-white rounded-xl hover:bg-[#CC4700] transition"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
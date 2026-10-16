// resources/js/Pages/Panel/Configuracion.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

// Valor por defecto (debe coincidir con el backend)
const MENSAJE_CIERRE_DEFAULT = 'Por el momento no estamos agendando citas nuevas. Vuelve a intentarlo más tarde.';

// Detecta movil
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    return esMovil || window.innerWidth < 768;
}

// Encabezado de sección temática
function HeaderSeccion({ titulo, descripcion }) {
    return (
        <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {titulo}
            </h2>
            {descripcion && (
                <p className="text-sm text-gray-400 mt-1">{descripcion}</p>
            )}
        </div>
    );
}

// Badge de estado del servicio
function BadgeEstado({ activo, textoActivo = 'Activo', textoInactivo = 'Inactivo' }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            activo
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
            <span className={`w-2 h-2 rounded-full ${activo ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {activo ? textoActivo : textoInactivo}
        </span>
    );
}

export default function Configuracion({
    user,
    whatsappActivo,
    solicitudActiva,
    diasAnticipacion,
    mensajeCierreCitas,
}) {
    const [togglingWhatsApp, setTogglingWhatsApp] = useState(false);
    const [togglingSolicitud, setTogglingSolicitud] = useState(false);

    const [diasForm, setDiasForm] = useState(Number(diasAnticipacion) || 1);
    const [guardandoDias, setGuardandoDias] = useState(false);

    const [mensajeForm, setMensajeForm] = useState(mensajeCierreCitas || '');
    const [guardandoMensaje, setGuardandoMensaje] = useState(false);

    const [esMovil, setEsMovil] = useState(false);

    // Modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        tipo: null,       // 'whatsapp' | 'solicitud'
        accion: null,     // 'activar' | 'desactivar'
        procesando: false,
    });

    // Toast
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!toast.visible) return;
        const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
        return () => clearTimeout(timer);
    }, [toast.visible]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };

    const abrirConfirmacion = (tipo) => {
        const mapActivo = {
            whatsapp: whatsappActivo,
            solicitud: solicitudActiva,
        };
        const activo = mapActivo[tipo];
        setConfirmModal({
            open: true,
            tipo,
            accion: activo ? 'desactivar' : 'activar',
            procesando: false,
        });
    };

    const cerrarConfirmacion = () => {
        if (confirmModal.procesando) return;
        setConfirmModal({ open: false, tipo: null, accion: null, procesando: false });
    };

    const confirmarAccion = () => {
        setConfirmModal(prev => ({ ...prev, procesando: true }));

        const mapRoute = {
            whatsapp: 'configuracion.whatsapp.toggle',
            solicitud: 'configuracion.solicitud.toggle',
        };
        const routeName = mapRoute[confirmModal.tipo];

        const esWhatsApp = confirmModal.tipo === 'whatsapp';
        const esSolicitud = confirmModal.tipo === 'solicitud';
        const esActivar = confirmModal.accion === 'activar';

        if (esWhatsApp) setTogglingWhatsApp(true);
        else if (esSolicitud) setTogglingSolicitud(true);

        router.put(route(routeName), {}, {
            preserveScroll: true,
            onSuccess: () => {
                let msg = '';
                if (esWhatsApp) {
                    msg = esActivar ? 'Notificaciones por WhatsApp activadas.' : 'Notificaciones por WhatsApp desactivadas.';
                } else if (esSolicitud) {
                    msg = esActivar ? 'Solicitud de citas activada.' : 'Solicitud de citas desactivada.';
                }
                showToast(msg, 'success');
            },
            onError: () => showToast('Error al cambiar el estado.', 'error'),
            onFinish: () => {
                setTogglingWhatsApp(false);
                setTogglingSolicitud(false);
                setConfirmModal({ open: false, tipo: null, accion: null, procesando: false });
            },
        });
    };

    // Textos del modal según tipo + acción
    const textosModal = () => {
        const { tipo, accion } = confirmModal;
        if (!tipo || !accion) return {};

        const esActivar = accion === 'activar';

        if (tipo === 'whatsapp') {
            return {
                titulo: esActivar ? 'Activar WhatsApp' : 'Desactivar WhatsApp',
                pregunta: esActivar
                    ? 'activar las notificaciones por WhatsApp'
                    : 'desactivar las notificaciones por WhatsApp',
                aviso: esActivar
                    ? 'Los estudiantes recibirán notificaciones automáticas cuando se agende, modifique o cancele una cita.'
                    : 'Los estudiantes NO recibirán ninguna notificación. Los envíos de confirmación, modificación y cancelación quedarán bloqueados hasta que lo reactives.',
                textoBoton: esActivar ? 'Sí, activar WhatsApp' : 'Sí, desactivar WhatsApp',
                color: esActivar ? 'emerald' : 'red',
            };
        }

        return {
            titulo: esActivar ? 'Activar solicitud de citas' : 'Desactivar solicitud de citas',
            pregunta: esActivar
                ? 'activar la solicitud de citas'
                : 'desactivar la solicitud de citas',
            aviso: esActivar
                ? 'Los estudiantes podrán volver a agendar citas desde la página pública.'
                : 'La página pública mostrará el mensaje de cierre que configuraste. Los estudiantes NO podrán agendar nuevas citas.',
            textoBoton: esActivar ? 'Sí, activar solicitud' : 'Sí, desactivar solicitud',
            color: esActivar ? 'emerald' : 'red',
        };
    };

    const t = textosModal();
    const colorClase = {
        emerald: 'bg-emerald-600 hover:bg-emerald-700',
        red: 'bg-red-600 hover:bg-red-700',
    };
    const botonModalClase = colorClase[t.color] || colorClase.emerald;
    const esActivarModal = confirmModal.accion === 'activar';

    // Guardar días de anticipación
    const guardarDias = (e) => {
        e.preventDefault();
        setGuardandoDias(true);
        router.put(route('configuracion.diasAnticipacion'), {
            dias_anticipacion: diasForm,
        }, {
            preserveScroll: true,
            onSuccess: () => showToast('Días de anticipación actualizados.', 'success'),
            onError: (err) => {
                const msg = err.dias_anticipacion || 'Error al guardar.';
                showToast(msg, 'error');
            },
            onFinish: () => setGuardandoDias(false),
        });
    };

    // Guardar mensaje de cierre
    const guardarMensaje = (e) => {
        e.preventDefault();
        setGuardandoMensaje(true);
        router.put(route('configuracion.mensajeCierre'), {
            mensaje_cierre_citas: mensajeForm,
        }, {
            preserveScroll: true,
            onSuccess: () => showToast('Mensaje de cierre actualizado.', 'success'),
            onError: (err) => {
                const msg = err.mensaje_cierre_citas || 'Error al guardar.';
                showToast(msg, 'error');
            },
            onFinish: () => setGuardandoMensaje(false),
        });
    };

    // Restaurar mensaje por defecto (dentro del editor)
    const restaurarMensajeDefault = () => {
        setMensajeForm(MENSAJE_CIERRE_DEFAULT);
    };

    // Contador de servicios activos (solo los 2 que quedan)
    const serviciosActivos = useMemo(() => {
        let count = 0;
        if (whatsappActivo) count++;
        if (solicitudActiva) count++;
        return count;
    }, [whatsappActivo, solicitudActiva]);

    const totalServicios = 2;

    // Hint visual para días de anticipación
    const diasHint = useMemo(() => {
        const n = Number(diasForm);
        if (isNaN(n) || n < 0 || n > 15) {
            return { texto: 'Valor fuera de rango (0-15)', color: 'text-red-600' };
        }
        if (n === 0) return { texto: 'Los estudiantes pueden agendar para hoy mismo.', color: 'text-amber-600' };
        if (n <= 2) return { texto: 'Se requiere poca anticipación.', color: 'text-green-600' };
        if (n <= 7) return { texto: 'Anticipación moderada.', color: 'text-blue-600' };
        return { texto: 'Se requiere mucha anticipación.', color: 'text-purple-600' };
    }, [diasForm]);

    return (
        <AuthenticatedLayout>
            <Head title="Ajustes del sistema" />

            {/* Toast */}
            {toast.visible && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border ${
                        toast.type === 'error'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-green-50 text-green-800 border-green-200'
                    }`}>
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Encabezado */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Ajustes del sistema</h1>
                    <p className="text-gray-500 mt-1">
                        Activa o desactiva las funciones principales del programa Diálogos
                    </p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>

                    {/* Resumen del estado actual */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            serviciosActivos === totalServicios
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : serviciosActivos === 0
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${
                                serviciosActivos === totalServicios ? 'bg-green-500' :
                                serviciosActivos === 0 ? 'bg-red-500' : 'bg-amber-500'
                            }`}></span>
                            {serviciosActivos} de {totalServicios} servicios operativos
                        </span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* SECCIÓN: CITAS Y AGENDAMIENTO */}
                {/* ═══════════════════════════════════════════════════════ */}
                <HeaderSeccion
                    titulo="Citas y agendamiento"
                    descripcion="Controla cómo y cuándo los estudiantes pueden agendar citas"
                />

                {/* Card: Solicitud de citas */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${solicitudActiva ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <svg className={`w-6 h-6 ${solicitudActiva ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-bold text-gray-800">Solicitud de citas</h3>
                                    <BadgeEstado activo={solicitudActiva} textoActivo="Activa" textoInactivo="Inactiva" />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {solicitudActiva
                                        ? 'Los estudiantes pueden agendar citas desde la página pública.'
                                        : 'La página pública muestra el mensaje de cierre. No se aceptan nuevas citas.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => abrirConfirmacion('solicitud')}
                            disabled={togglingSolicitud}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                                solicitudActiva
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {solicitudActiva ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </div>

                {/* Card: Mensaje de cierre */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-800">Mensaje de cierre de citas</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Se muestra en la página pública cuando la solicitud está desactivada.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={guardarMensaje}>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                            Mensaje
                        </label>
                        <textarea
                            value={mensajeForm}
                            onChange={(e) => setMensajeForm(e.target.value)}
                            maxLength={500}
                            rows={4}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all resize-none text-sm"
                            placeholder="Escribe el mensaje que verán los estudiantes..."
                        />
                        <div className="flex items-center justify-between mt-1.5">
                            <button
                                type="button"
                                onClick={restaurarMensajeDefault}
                                disabled={mensajeForm === MENSAJE_CIERRE_DEFAULT}
                                className="text-xs text-gray-500 hover:text-[#FF5900] underline font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                            >
                                Restaurar mensaje por defecto
                            </button>
                            <span className={`text-xs ${mensajeForm.length >= 500 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                                {mensajeForm.length} / 500
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={guardandoMensaje || mensajeForm.trim().length === 0}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardandoMensaje ? (
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
                                        Guardar mensaje
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Card: Días de anticipación */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-800">Días de anticipación mínima</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Cuántos días mínimo antes debe agendar un estudiante. La ventana visible es de 7 días a partir del día mínimo.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={guardarDias}>
                        <div className={`flex flex-wrap items-end gap-3 ${!esMovil ? 'pl-16' : ''}`}>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Días (0 a 15)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="15"
                                    value={diasForm}
                                    onChange={(e) => setDiasForm(e.target.value)}
                                    className="w-28 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={guardandoDias}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                            >
                                {guardandoDias ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </button>
                            <span className={`text-xs font-medium ${diasHint.color} pb-3`}>
                                {diasHint.texto}
                            </span>
                        </div>
                    </form>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* SECCIÓN: NOTIFICACIONES */}
                {/* ═══════════════════════════════════════════════════════ */}
                <HeaderSeccion
                    titulo="Notificaciones"
                    descripcion="Controla el envío de mensajes a los estudiantes"
                />

                {/* Card: WhatsApp */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${whatsappActivo ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <svg className={`w-6 h-6 ${whatsappActivo ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-bold text-gray-800">Notificaciones por WhatsApp</h3>
                                    <BadgeEstado activo={whatsappActivo} />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {whatsappActivo
                                        ? 'Los estudiantes reciben notificaciones de confirmación, modificación y cancelación de citas.'
                                        : 'Los envíos están pausados. Ningún tipo de notificación se enviará hasta que lo actives.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => abrirConfirmacion('whatsapp')}
                            disabled={togglingWhatsApp}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                                whatsappActivo
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {whatsappActivo ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                                    t.color === 'emerald' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {esActivarModal ? (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h2 className="text-lg font-bold text-gray-800 leading-tight">{t.titulo}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-3">
                                ¿Estás seguro de que deseas <strong>{t.pregunta}</strong>?
                            </p>

                            <div className={`rounded-xl p-3.5 mb-2 text-sm ${
                                t.color === 'emerald'
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                                {t.aviso}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                disabled={confirmModal.procesando}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarAccion}
                                disabled={confirmModal.procesando}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${botonModalClase}`}
                            >
                                {confirmModal.procesando ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : t.textoBoton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
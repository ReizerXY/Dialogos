// resources/js/Pages/Panel/Configuracion.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Configuracion({
    user,
    whatsappActivo,
    solicitudActiva,
    diasAnticipacion,
    mensajeCierreCitas,
}) {
    // Estados de toggles
    const [togglingWhatsApp, setTogglingWhatsApp] = useState(false);
    const [togglingSolicitud, setTogglingSolicitud] = useState(false);

    // Estados de formularios
    const [diasForm, setDiasForm] = useState(Number(diasAnticipacion) || 1);
    const [guardandoDias, setGuardandoDias] = useState(false);

    const [mensajeForm, setMensajeForm] = useState(mensajeCierreCitas || '');
    const [guardandoMensaje, setGuardandoMensaje] = useState(false);

    // Modal de confirmación (2 tipos)
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        tipo: null,       // 'whatsapp' | 'solicitud'
        accion: null,     // 'activar' | 'desactivar'
        procesando: false,
    });

    // Toast (abajo-centro)
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        if (!toast.visible) return;
        const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
        return () => clearTimeout(timer);
    }, [toast.visible]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };

    // Abre el modal de confirmación
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

    // Confirma y ejecuta el toggle
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
                    msg = esActivar
                        ? 'Notificaciones por WhatsApp activadas.'
                        : 'Notificaciones por WhatsApp desactivadas.';
                } else if (esSolicitud) {
                    msg = esActivar
                        ? 'Solicitud de citas activada.'
                        : 'Solicitud de citas desactivada.';
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
    const botonModalClase = colorClase[t.color] || 'bg-[#FF5900] hover:bg-[#CC4700]';
    const esActivarModal = confirmModal.accion === 'activar';

    // Guarda los días de anticipación
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

    // Guarda el mensaje de cierre
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

    return (
        <AuthenticatedLayout>
            <Head title="Ajustes del sistema" />

            {/* Toast (abajo-centro) */}
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Ajustes del sistema</h1>
                    <p className="text-gray-500 mt-1">Activa o desactiva las funciones principales del programa Diálogos</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* ============================================================= */}
                {/* PANEL: NOTIFICACIONES POR WHATSAPP                             */}
                {/* ============================================================= */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${whatsappActivo ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <svg className={`w-6 h-6 ${whatsappActivo ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Notificaciones por WhatsApp</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {whatsappActivo
                                        ? 'Los estudiantes reciben notificaciones de confirmación, modificación y cancelación de citas.'
                                        : 'Los envíos están pausados. Ningún tipo de notificación se enviará hasta que lo actives.'}
                                </p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${whatsappActivo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                        <span className={`w-2 h-2 rounded-full ${whatsappActivo ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {whatsappActivo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => abrirConfirmacion('whatsapp')}
                            disabled={togglingWhatsApp}
                            className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                whatsappActivo ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {whatsappActivo ? 'Desactivar WhatsApp' : 'Activar WhatsApp'}
                        </button>
                    </div>
                </div>

                {/* ============================================================= */}
                {/* PANEL: SOLICITUD DE CITAS + MENSAJE DE CIERRE                  */}
                {/* ============================================================= */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${solicitudActiva ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <svg className={`w-6 h-6 ${solicitudActiva ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Solicitud de citas</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {solicitudActiva
                                        ? 'Los estudiantes pueden agendar citas desde la página pública.'
                                        : 'La página pública muestra el mensaje de cierre. No se aceptan nuevas citas.'}
                                </p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${solicitudActiva ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                        <span className={`w-2 h-2 rounded-full ${solicitudActiva ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {solicitudActiva ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => abrirConfirmacion('solicitud')}
                            disabled={togglingSolicitud}
                            className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                solicitudActiva ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {solicitudActiva ? 'Desactivar solicitud' : 'Activar solicitud'}
                        </button>
                    </div>

                    {/* Sub-sección: Mensaje de cierre */}
                    <div className="mt-5 pt-5 border-t border-gray-100">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                    Mensaje que verán los estudiantes al cerrar las citas
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Se muestra en la página principal cuando la solicitud de citas esté desactivada.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={guardarMensaje}>
                            <textarea
                                value={mensajeForm}
                                onChange={(e) => setMensajeForm(e.target.value)}
                                maxLength={500}
                                rows={3}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all resize-none"
                                placeholder="Escribe aquí el mensaje que verán los estudiantes..."
                            />
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-gray-400">
                                    {mensajeForm.length} / 500 caracteres
                                </p>
                                <button
                                    type="submit"
                                    disabled={guardandoMensaje}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
                                >
                                    {guardandoMensaje ? 'Guardando...' : 'Guardar mensaje'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ============================================================= */}
                {/* PANEL: DIAS DE ANTICIPACION MINIMA                              */}
                {/* ============================================================= */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-800">Días de anticipación mínima</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Cuántos días mínimo antes debe agendar un estudiante. Se muestra siempre una ventana de 7 días a partir del día mínimo.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={guardarDias} className="flex flex-wrap items-end gap-3 pl-16">
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
                                className="w-32 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={guardandoDias}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {guardandoDias ? 'Guardando...' : 'Guardar'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal de confirmación */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                t.color === 'emerald' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                {esActivarModal ? (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{t.titulo}</h2>
                        </div>

                        <p className="text-gray-600 mb-2">
                            ¿Estás seguro de que deseas <strong>{t.pregunta}</strong>?
                        </p>

                        <div className={`rounded-xl p-3 mb-4 text-sm ${
                            t.color === 'emerald'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                            {t.aviso}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                disabled={confirmModal.procesando}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarAccion}
                                disabled={confirmModal.procesando}
                                className={`px-6 py-2 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${botonModalClase}`}
                            >
                                {confirmModal.procesando ? 'Procesando...' : t.textoBoton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
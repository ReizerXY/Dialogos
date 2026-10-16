// resources/js/Pages/Panel/Usuarios.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Detecta movil / pantalla chica
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const esPantallaChica = window.innerWidth < 768;
    return esMovil || esPantallaChica;
}

// Chips de estado compactos con iconos
function EstadoChips({ usuario }) {
    const accesoOk = usuario.acceso_usuario == 1;
    const visibilidadOk = usuario.visibilidad_usuario == 1;
    const esFormador = usuario.rol === 'Formador';

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {accesoOk ? (
                <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                    title="Puede iniciar sesión en la plataforma"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Acceso
                </span>
            ) : (
                <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
                    title="No puede iniciar sesión en la plataforma"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Suspendido
                </span>
            )}

            {esFormador && (
                visibilidadOk ? (
                    <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                        title="Aparece en los selectores de citas"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Visible
                    </span>
                ) : (
                    <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                        title="No aparece en los selectores de citas"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                        Oculto
                    </span>
                )
            )}
        </div>
    );
}

// Chip de rol
function RolChip({ rol }) {
    const esCoordinador = rol === 'Coordinador';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            esCoordinador
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {esCoordinador ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                )}
            </svg>
            {rol}
        </span>
    );
}

// Dropdown "Suspender" con Portal + auto-flip
function DropdownEstado({ usuario, onAccion }) {
    const [abierto, setAbierto] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 256, abrirArriba: false });
    const buttonWrapperRef = useRef(null);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const esFormador = usuario.rol === 'Formador';
    const menuWidth = 256; // w-64
    const menuHeight = esFormador ? 230 : 140;

    // Cierra al hacer click fuera (chequeando boton Y menu)
    useEffect(() => {
        if (!abierto) return;
        const handler = (e) => {
            if (
                buttonWrapperRef.current && buttonWrapperRef.current.contains(e.target)
            ) return;
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            setAbierto(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [abierto]);

    // Calcula posicion al abrir y en scroll/resize
    useEffect(() => {
        if (!abierto) return;
        const update = () => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            const espacioAbajo = window.innerHeight - rect.bottom;
            const abrirArriba = espacioAbajo < menuHeight + 20;

            setPos({
                top: abrirArriba ? rect.top - 4 : rect.bottom + 4,
                left: Math.max(8, rect.right - menuWidth), // no salirse por la izquierda
                width: menuWidth,
                abrirArriba,
            });
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [abierto, menuHeight]);

    const accesoOk = usuario.acceso_usuario == 1;
    const visibilidadOk = usuario.visibilidad_usuario == 1;
    const textoBoton = accesoOk ? 'Suspender' : 'Restaurar';

    // Menu renderizado via Portal
    const menu = abierto && typeof document !== 'undefined'
        ? createPortal(
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: pos.abrirArriba ? 'auto' : `${pos.top}px`,
                    bottom: pos.abrirArriba ? `${window.innerHeight - pos.top}px` : 'auto',
                    left: `${pos.left}px`,
                    width: `${pos.width}px`,
                    zIndex: 9999,
                }}
                className="bg-white rounded-xl shadow-xl border border-gray-200 py-1.5"
            >
                {/* SECCIÓN ACCESO */}
                <div className="px-3 pt-1.5 pb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Acceso</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setAbierto(false); onAccion(usuario, 'acceso'); }}
                    title={accesoOk
                        ? 'El usuario no podrá iniciar sesión a partir del próximo intento'
                        : 'El usuario podrá iniciar sesión normalmente'
                    }
                    className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-3 ${
                        accesoOk ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                >
                    {accesoOk ? (
                        <>
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Suspender acceso
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Restaurar acceso
                        </>
                    )}
                </button>

                {/* SECCIÓN ATENCIÓN DE CITAS (solo Formador) */}
                {esFormador && (
                    <>
                        <div className="border-t border-gray-100 my-1.5"></div>
                        <div className="px-3 pt-1.5 pb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Atención de citas</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setAbierto(false); onAccion(usuario, 'visibilidad'); }}
                            title={visibilidadOk
                                ? 'Dejará de aparecer en el selector al agendar citas'
                                : 'Volverá a aparecer en el selector al agendar citas'
                            }
                            className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-3 ${
                                visibilidadOk ? 'text-yellow-700 hover:bg-yellow-50' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            {visibilidadOk ? (
                                <>
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                    Ocultar en citas
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Reactivar en citas
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div ref={buttonWrapperRef} className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setAbierto(!abierto)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all duration-200 hover:shadow-md active:scale-95"
                    title="Opciones para cambiar el estado del usuario"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {textoBoton}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            {menu}
        </>
    );
}

export default function Usuarios({ usuarios, user }) {
    const { flash } = usePage().props;

    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [esMovil, setEsMovil] = useState(false);

    const [confirmAccion, setConfirmAccion] = useState({
        open: false,
        usuario: null,
        tipo: null,
        accion: null,
        procesando: false,
    });

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        usuario: null,
        procesando: false,
    });

    const [mensaje, setMensaje] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        usuario: '',
        clave: '',
        nombre: '',
        rol: 'Formador',
    });

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Muestra el flash message del backend
    useEffect(() => {
        if (flash?.success) setMensaje({ tipo: 'success', texto: flash.success });
        else if (flash?.error) setMensaje({ tipo: 'error', texto: flash.error });

        if (flash?.success || flash?.error) {
            const t = setTimeout(() => setMensaje(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const openCreateModal = () => {
        setEditUser(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (usuario) => {
        setEditUser(usuario);
        setData({
            usuario: usuario.usuario,
            clave: '',
            nombre: usuario.nombre,
            rol: usuario.rol,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        reset();
        setEditUser(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('usuarios.update', editUser.id_usuario), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('usuarios.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const abrirConfirmacion = (usuario, tipo) => {
        const activoAhora = tipo === 'visibilidad'
            ? usuario.visibilidad_usuario == 1
            : usuario.acceso_usuario == 1;

        setConfirmAccion({
            open: true,
            usuario,
            tipo,
            accion: activoAhora ? 'suspender' : 'reactivar',
            procesando: false,
        });
    };

    const cerrarConfirmacion = () => {
        if (confirmAccion.procesando) return;
        setConfirmAccion({ open: false, usuario: null, tipo: null, accion: null, procesando: false });
    };

    const confirmarAccion = () => {
        if (!confirmAccion.usuario) return;
        setConfirmAccion((prev) => ({ ...prev, procesando: true }));

        const routeName = confirmAccion.tipo === 'visibilidad'
            ? 'usuarios.toggleVisibilidad'
            : 'usuarios.toggleAcceso';

        router.put(route(routeName, confirmAccion.usuario.id_usuario), {}, {
            preserveScroll: true,
            onFinish: () => {
                setConfirmAccion({ open: false, usuario: null, tipo: null, accion: null, procesando: false });
            },
        });
    };

    const abrirEliminar = (usuario) => {
        setDeleteModal({ open: true, usuario, procesando: false });
    };

    const cerrarEliminar = () => {
        if (deleteModal.procesando) return;
        setDeleteModal({ open: false, usuario: null, procesando: false });
    };

    const confirmarEliminar = () => {
        if (!deleteModal.usuario) return;
        setDeleteModal((prev) => ({ ...prev, procesando: true }));
        router.delete(route('usuarios.destroy', deleteModal.usuario.id_usuario), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModal({ open: false, usuario: null, procesando: false });
            },
        });
    };

    const textosModal = () => {
        const { tipo, accion, usuario } = confirmAccion;
        if (!usuario || !tipo) return {};

        const esAcceso = tipo === 'acceso';
        const esSuspender = accion === 'suspender';

        if (esAcceso) {
            return {
                titulo: esSuspender ? 'Suspender acceso' : 'Restaurar acceso',
                pregunta: esSuspender ? 'suspender el acceso a la plataforma' : 'restaurar el acceso a la plataforma',
                aviso: esSuspender
                    ? 'El usuario NO podrá iniciar sesión a partir del próximo intento. Si tiene una sesión activa, seguirá vigente hasta que expire.'
                    : 'El usuario podrá iniciar sesión en la plataforma con normalidad.',
                textoBoton: esSuspender ? 'Sí, suspender acceso' : 'Sí, restaurar acceso',
            };
        }
        return {
            titulo: esSuspender ? 'Suspender atención de citas' : 'Reactivar atención de citas',
            pregunta: esSuspender ? 'suspender la atención de citas' : 'reactivar la atención de citas',
            aviso: esSuspender
                ? 'El usuario seguirá pudiendo ingresar a la plataforma. Sin embargo, ya no aparecerá como opción al agendar nuevas citas.'
                : 'El usuario volverá a aparecer como opción al agendar nuevas citas.',
            textoBoton: esSuspender ? 'Sí, suspender citas' : 'Sí, reactivar citas',
        };
    };

    const t = textosModal();
    const esAcceso = confirmAccion.tipo === 'acceso';
    const esSuspender = confirmAccion.accion === 'suspender';

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de usuarios" />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de usuarios</h1>
                        <p className="text-gray-500 mt-1">
                            {usuarios.length} {usuarios.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
                        </p>
                        <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo usuario
                    </button>
                </div>

                {/* Mensaje flash */}
                {mensaje && (
                    <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                        mensaje.tipo === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {mensaje.tipo === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                        )}
                        <span className="flex-1">{mensaje.texto}</span>
                    </div>
                )}

                {/* Empty state */}
                {usuarios.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FF5900]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">No hay usuarios registrados</p>
                        <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                            Comienza agregando el primer usuario del sistema.
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] transition-all duration-200 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo usuario
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                        {/* ─── Móvil: cards ─── */}
                        {esMovil && (
                            <div className="divide-y divide-gray-100">
                                {usuarios.map(u => {
                                    const esPropio = u.id_usuario === user.id_usuario;
                                    const accesoOk = u.acceso_usuario == 1;
                                    const esFormador = u.rol === 'Formador';
                                    const visibilidadOk = u.visibilidad_usuario == 1;

                                    return (
                                        <div key={u.id_usuario} className="px-4 py-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                            #{u.id_usuario}
                                                        </span>
                                                        <p className="text-base font-semibold text-gray-800 leading-snug">
                                                            {u.nombre}
                                                        </p>
                                                        {esPropio && (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5900]/15 text-[#CC4700] uppercase tracking-wide">
                                                                Tú
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono mt-1">@{u.usuario}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <RolChip rol={u.rol} />
                                            </div>

                                            <div className="mb-3">
                                                <EstadoChips usuario={u} />
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Modificar
                                                </button>

                                                {u.usuario !== 'admin' && !esPropio && (
                                                    <>
                                                        <DropdownEstado
                                                            usuario={u}
                                                            onAccion={abrirConfirmacion}
                                                        />

                                                        <button
                                                            onClick={() => abrirEliminar(u)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition active:scale-95"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ─── Desktop: tabla ─── */}
                        {!esMovil && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-white">
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-16">ID</th>
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Usuario</th>
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Nombre</th>
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Rol</th>
                                            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Estado</th>
                                            <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {usuarios.map(u => {
                                            const esPropio = u.id_usuario === user.id_usuario;
                                            const puedeModificar = u.usuario !== 'admin' && !esPropio;

                                            return (
                                                <tr
                                                    key={u.id_usuario}
                                                    className="hover:bg-[#FF5900]/5 transition-colors"
                                                >
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-mono text-gray-500">#{u.id_usuario}</span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="text-base font-mono font-medium text-gray-800">{u.usuario}</span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base text-gray-800 font-medium">{u.nombre}</span>
                                                            {esPropio && (
                                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5900]/15 text-[#CC4700] uppercase tracking-wide">
                                                                    Tú
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <RolChip rol={u.rol} />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <EstadoChips usuario={u} />
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(u)}
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Modificar
                                                            </button>

                                                            {puedeModificar && (
                                                                <>
                                                                    <DropdownEstado
                                                                        usuario={u}
                                                                        onAccion={abrirConfirmacion}
                                                                    />

                                                                    <button
                                                                        onClick={() => abrirEliminar(u)}
                                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md active:scale-95"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Eliminar
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal crear / editar usuario */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                                    {editUser ? 'Editar usuario' : 'Nuevo usuario'}
                                </h2>
                                <div className="w-12 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                                aria-label="Cerrar"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                                <input
                                    type="text"
                                    value={data.usuario}
                                    onChange={e => setData('usuario', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    required
                                />
                                {errors.usuario && <p className="text-red-600 text-sm mt-1">{errors.usuario}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Clave</label>
                                <input
                                    type="password"
                                    value={data.clave}
                                    onChange={e => setData('clave', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    placeholder={editUser ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
                                />
                                {errors.clave && <p className="text-red-600 text-sm mt-1">{errors.clave}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all"
                                    required
                                />
                                {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                                <select
                                    value={data.rol}
                                    onChange={e => setData('rol', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF5900]/50 focus:border-[#FF5900] transition-all bg-white"
                                >
                                    <option value="Coordinador">Coordinador</option>
                                    <option value="Formador">Formador</option>
                                </select>
                                {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol}</p>}
                            </div>

                            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF5900] text-white font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
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
                                            {editUser ? 'Guardar cambios' : 'Crear usuario'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de suspender/reactivar */}
            {confirmAccion.open && confirmAccion.usuario && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                esSuspender
                                    ? (esAcceso ? 'bg-red-100' : 'bg-yellow-100')
                                    : 'bg-green-100'
                            }`}>
                                {esSuspender ? (
                                    esAcceso ? (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )
                                ) : (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{t.titulo}</h2>
                        </div>

                        <p className="text-gray-600 mb-3">
                            ¿Estás seguro de que deseas <strong>{t.pregunta}</strong> de <strong>{confirmAccion.usuario.nombre}</strong>?
                        </p>

                        <div className={`rounded-xl p-3.5 mb-4 text-sm ${
                            esSuspender
                                ? (esAcceso
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800')
                                : 'bg-green-50 border border-green-200 text-green-800'
                        }`}>
                            {t.aviso}
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                disabled={confirmAccion.procesando}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarAccion}
                                disabled={confirmAccion.procesando}
                                className={`inline-flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    esSuspender
                                        ? (esAcceso ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25' : 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/25')
                                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/25'
                                }`}
                            >
                                {confirmAccion.procesando ? (
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

            {/* Modal de eliminación */}
            {deleteModal.open && deleteModal.usuario && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Eliminar usuario</h2>
                        </div>

                        <p className="text-gray-600 mb-3">
                            ¿Estás seguro de que deseas <strong>eliminar permanentemente</strong> a{' '}
                            <strong>{deleteModal.usuario.nombre}</strong>?
                        </p>

                        <div className="rounded-xl p-3.5 mb-4 text-sm bg-red-50 border border-red-200 text-red-800">
                            Esta acción <strong>no se puede deshacer</strong>. El usuario y sus horarios se
                            eliminarán por completo. Sus citas pasadas conservarán el nombre con el que se
                            atendieron, pero ya no estarán vinculadas a ninguna cuenta.
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarEliminar}
                                disabled={deleteModal.procesando}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarEliminar}
                                disabled={deleteModal.procesando}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteModal.procesando ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí, eliminar permanentemente'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
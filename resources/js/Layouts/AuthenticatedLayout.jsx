// resources/js/Layouts/AuthenticatedLayout.jsx
import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import BotonVolverArriba from '@/Components/BotonVolverArriba';
import ConfirmModal from '@/Components/ConfirmModal';

export default function AuthenticatedLayout({ children }) {
    const { props } = usePage();
    const user = props.user;
    const alertaImportacion = props.alerta_importacion;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Bloquea el scroll del body cuando el sidebar movil esta abierto
    useEffect(() => {
        if (window.innerWidth >= 1024) return;
        const prev = document.body.style.overflow;
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = prev || '';
        }
        return () => { document.body.style.overflow = prev || ''; };
    }, [sidebarOpen]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Abre el modal de confirmacion
    const handleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    // Confirmar el cierre de sesion (solo si el usuario acepta)
    const confirmarLogout = () => {
        setLogoutModalOpen(false);
        router.post(route('logout'));
    };

    const isCoordinador = user?.rol === 'Coordinador';
    const isFormador = user?.rol === 'Formador';

    const nombreMostrado = user?.nombre || user?.usuario || 'Usuario';
    const rolMostrado = user?.rol || '';

    const atencionSuspendida = Number(user?.visibilidad_usuario) === 0;

    const rolBadgeClases = isCoordinador
        ? 'bg-purple-100 text-purple-800 border border-purple-200'
        : isFormador
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-gray-100 text-gray-700 border border-gray-200';

    const mostrarAlertaImportacion =
        isCoordinador && alertaImportacion?.mostrar_importacion === true;

    const irAImportar = () => {
        const scrollAlBloque = () => {
            const el = document.getElementById('bloque-importacion');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        if (window.location.pathname === '/estudiantes') {
            scrollAlBloque();
        } else {
            router.visit(route('estudiantes.index'), {
                onSuccess: () => setTimeout(scrollAlBloque, 150),
            });
        }

        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) toggleSidebar();
                    }}
                    onTouchStart={(e) => {
                        if (e.target === e.currentTarget) toggleSidebar();
                    }}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col lg:relative lg:translate-x-0 lg:shadow-md lg:w-72 lg:flex-shrink-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    height: '100dvh',
                    maxHeight: '100dvh',
                }}
            >
                <div className="p-5 border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-[#FF5900]">Diálogos</h1>

                    <div className="mt-3 flex items-start gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block mt-1.5 shrink-0 ${
                            atencionSuspendida ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {nombreMostrado}
                            </p>
                            {rolMostrado && (
                                <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${rolBadgeClases}`}>
                                    {rolMostrado}
                                </span>
                            )}
                            {atencionSuspendida && (
                                <span
                                    className="inline-flex items-center mt-1 ml-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    title="Puedes ingresar, pero ya no apareces al agendar nuevas citas"
                                >
                                    Atención suspendida
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <nav
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1"
                    style={{
                        touchAction: 'pan-y',
                        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)',
                    }}
                >
                    {mostrarAlertaImportacion && (
                        <div className="bg-cyan-600 rounded-xl p-3.5 mb-3 shadow-lg shadow-cyan-600/30">
                            <div className="flex items-start gap-2.5">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white leading-tight">
                                        Actualización pendiente
                                    </p>
                                    <p className="text-xs text-cyan-50 mt-1 leading-relaxed">
                                        Es momento de actualizar la lista de estudiantes.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={irAImportar}
                                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 px-3 py-1.5 rounded-lg transition-colors active:scale-95 shadow-sm"
                                    >
                                        Importar ahora
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCoordinador && (
                        <>
                            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Análisis
                            </p>
                            <Link href={route('indicadores.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Visualizar indicadores
                            </Link>
                            <Link href={route('reportes.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generar reportes
                            </Link>

                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Citas y estudiantes
                            </p>
                            <Link href={route('citas.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Visualizar citas
                            </Link>
                            <Link href={route('expediente.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Consultar expedientes
                            </Link>

                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Horarios
                            </p>
                            <Link href={route('horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Visualizar horarios
                            </Link>
                            <Link href={route('admin.horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                Modificar horarios
                            </Link>

                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Administración
                            </p>
                            <Link href={route('estudiantes.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Gestionar estudiantes
                            </Link>
                            <Link href={route('usuarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Gestionar usuarios
                            </Link>
                            <Link href={route('admin.backups.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar copias de seguridad
                            </Link>
                            <Link href={route('configuracion.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ajustes del sistema
                            </Link>
                        </>
                    )}

                    {isFormador && (
                        <>
                            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Citas
                            </p>
                            <Link href={route('citas.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Gestionar mis citas
                            </Link>
                            <Link href="/citas?todas=1" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Visualizar citas
                            </Link>

                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Horarios
                            </p>
                            <Link href={route('horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Visualizar horarios
                            </Link>
                            <Link href={route('mis-horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modificar mis horarios
                            </Link>

                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Estudiantes
                            </p>
                            <Link href={route('expediente.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Consultar expedientes
                            </Link>
                        </>
                    )}
                </nav>
            </aside>

            <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-600 p-2 hover:bg-gray-200 rounded-xl transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Cerrar sesión</span>
                            <span className="sm:hidden">Salir</span>
                        </button>
                    </div>
                </div>

                {atencionSuspendida && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-yellow-800 text-sm">
                                Atención de citas suspendida
                            </p>
                            <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                                Puedes seguir ingresando a la plataforma para consultar y gestionar tus citas
                                existentes, pero <strong>ya no aparecerás como opción</strong> al agendar nuevas
                                citas ni al asignar horarios.
                            </p>
                            <p className="text-xs text-yellow-600 mt-2">
                                Si crees que es un error, contacta al coordinador del programa.
                            </p>
                        </div>
                    </div>
                )}

                {children}

                <BotonVolverArriba />
            </main>

            {/* Modal de confirmacion de cerrar sesion */}
            <ConfirmModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={confirmarLogout}
                title="Cerrar sesión"
                message="¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a ingresar tu usuario y clave para acceder de nuevo al sistema."
                confirmText="Sí, cerrar sesión"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
}
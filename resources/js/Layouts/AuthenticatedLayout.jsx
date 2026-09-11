import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { props } = usePage();
    const user = props.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const isCoordinador = user?.rol === 'Coordinador';
    const isFormador = user?.rol === 'Formador';

    const nombreMostrado = user?.nombre || user?.usuario || 'Usuario';

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0 lg:shadow-md lg:min-h-screen lg:w-72 lg:flex-shrink-0`}
            >
                <div className="p-5 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-[#FF5900]">Diálogos</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                        {nombreMostrado}
                    </p>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 130px)' }}>
                    {isCoordinador && (
                        <>
                            {/* ─── GRUPO: ANÁLISIS ─── */}
                            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Análisis
                            </p>
                            <Link href={route('indicadores.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Ver Indicadores
                            </Link>
                            <Link href={route('reportes.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generar reportes
                            </Link>

                            {/* ─── GRUPO: CITAS Y ATENCIÓN ─── */}
                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Citas y atención
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

                            {/* ─── GRUPO: HORARIOS ─── */}
                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Horarios
                            </p>
                            <Link href={route('horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ver horarios
                            </Link>
                            <Link href={route('admin.horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                Editar horarios
                            </Link>

                            {/* ─── GRUPO: ADMINISTRACIÓN ─── */}
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
                        </>
                    )}

                    {isFormador && (
                        <>
                            {/* ─── GRUPO: HORARIOS ─── */}
                            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Horarios
                            </p>
                            <Link href={route('horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ver horarios
                            </Link>
                            <Link href={route('mis-horarios.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modificar mis horarios
                            </Link>

                            {/* ─── GRUPO:CITAS ─── */}
                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Citas
                            </p>
                            <Link href={route('citas.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ver mis citas
                            </Link>
                            <Link href="/citas?todas=1" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FF5900]/10 hover:text-[#FF5900] transition-all duration-200 text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Visualizar citas
                            </Link>

                            {/* ─── GRUPO: ATENCIÓN ─── */}
                            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Atención
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
                        <form method="POST" action={route('logout')}>
                            <input type="hidden" name="_token" value={csrfToken} />
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </form>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}
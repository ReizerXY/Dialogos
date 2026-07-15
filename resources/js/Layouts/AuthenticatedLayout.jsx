import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { props } = usePage();
    const user = props.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // En escritorio, sidebar abierto por defecto
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

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            {/* Overlay para móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0 lg:shadow-md lg:min-h-screen lg:w-64 lg:flex-shrink-0`}
            >
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-[#FF5900]">Diálogos</h1>
                    <p className="text-sm text-gray-600">{user?.usuario}</p>
                </div>
                <nav className="p-4 space-y-2">
                    {isCoordinador && (
                        <>
                            <Link href={route('metricas.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Métricas</Link>
                            <Link href={route('horarios.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Horarios</Link>
                            <Link href={route('citas.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Citas</Link>
                            <Link href={route('expediente.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Expediente</Link>
                            <Link href={route('admin.horarios.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Modificar Horarios</Link>
                            <Link href={route('usuarios.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Usuarios</Link>
                        </>
                    )}
                    {isFormador && (
                        <>
                            <Link href={route('horarios.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Horarios</Link>
                            <Link href={route('citas.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Mis citas</Link>
                            <Link href={route('expediente.index')} className="block px-4 py-2 hover:bg-gray-100 rounded">Expediente</Link>
                        </>
                    )}
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <form method="POST" action={route('logout')}>
                        <input type="hidden" name="_token" value={csrfToken} />
                        <button type="submit" className="text-red-600 hover:underline w-full text-left">
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
}
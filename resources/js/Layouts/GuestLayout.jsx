import { Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ title, children }) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
                <div className="mb-6">
                    <Link href="/">
                        <ApplicationLogo className="w-20 h-20 text-[#FF5900] drop-shadow-md" />
                    </Link>
                </div>
                <div className="w-full max-w-4xl">
                    {children}
                </div>
                <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-200 pt-6 w-full max-w-4xl">
                    <p>© {new Date().getFullYear()} Diálogos — Todos los derechos reservados</p>
                    <p className="text-xs mt-1 text-gray-300">Prepa Anáhuac Veracruz campus Córdoba-Orizaba</p>
                </div>
            </div>
        </>
    );
}
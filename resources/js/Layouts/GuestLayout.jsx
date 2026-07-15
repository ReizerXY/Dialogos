import { Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ title, children }) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
                <div className="mb-6">
                    <Link href="/">
                        <ApplicationLogo className="w-20 h-20" />
                    </Link>
                </div>
                <div className="w-full max-w-md">
                    {children}
                </div>
                <div className="mt-8 text-sm text-gray-500">
                    © {new Date().getFullYear()} Diálogos
                </div>
            </div>
        </>
    );
}
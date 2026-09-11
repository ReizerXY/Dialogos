import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import AdminCard from '@/Components/AdminCard';
import StudentCard from '@/Components/StudentCard';

export default function Welcome({ auth }) {
    if (auth?.user) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Ya estás autenticado</h1>
                        <Link href={route('dashboard')} className="mt-4 inline-block text-[#FF5900] underline">
                            Ir al Dashboard
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <GuestLayout title="Bienvenida">
            <Head title="Bienvenida" />
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 tracking-tight">
                    Diálogos
                </h1>
                <p className="text-gray-500 mt-3 text-lg md:text-xl font-light">
                    Selecciona tu perfil para continuar
                </p>
                <div className="w-24 h-1 bg-[#FF5900] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <AdminCard />
                <StudentCard />
            </div>
        </GuestLayout>
    );
}
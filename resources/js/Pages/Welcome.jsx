import { Link, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import AdminCard from '@/Components/PanelAdmin';
import StudentCard from '@/Components/FormEstudiante';

export default function Welcome({ auth }) {
    if (auth.user) {
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
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800">Diálogos</h1>
                <p className="text-gray-500 mt-2 text-lg">Selecciona tu perfil para continuar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <AdminCard />
                <StudentCard />
            </div>
        </GuestLayout>
    );
}
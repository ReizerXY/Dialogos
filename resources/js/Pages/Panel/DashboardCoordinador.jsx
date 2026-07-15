import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DashboardCoordinador({ user }) {
    return (
        <AuthenticatedLayout>
            <Head title="Panel Coordinador" />
            <div className="p-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold text-[#FF5900]">Bienvenido, {user.usuario}</h1>
                <p className="text-gray-600 mt-2">Panel de coordinador</p>
                <p className="text-gray-500 mt-4">Aquí podrás gestionar todos los horarios, citas y usuarios.</p>
            </div>
        </AuthenticatedLayout>
    );
}
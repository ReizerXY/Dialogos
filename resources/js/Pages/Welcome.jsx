// resources/js/Pages/Welcome.jsx
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import AdminCard from '@/Components/AdminCard';
import StudentCard from '@/Components/StudentCard';

export default function Welcome({ solicitudCitasActiva = true, mensajeCierreCitas = '' }) {
    return (
        <GuestLayout title="Inicio">
            <div className="text-center mb-12">
                <p className="text-sm font-semibold text-[#FF5900] uppercase tracking-widest mb-2">
                    Prepa Anahuac Veracruz
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
                    Sistema Dialogos
                </h1>
                <p className="text-gray-500 mt-3 text-base md:text-lg font-light max-w-2xl mx-auto">
                    Programa de acompanamiento integral para estudiantes de bachillerato.
                    Campus Cordoba-Orizaba.
                </p>
                <div className="w-24 h-1 bg-[#FF5900] mx-auto mt-4 rounded-full"></div>
                <p className="text-gray-400 mt-4 text-sm">
                    Selecciona tu perfil para continuar
                </p>
            </div>

            {/* Aviso: solicitudes de cita cerradas */}
            {!solicitudCitasActiva && (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-amber-900">
                                Aviso importante
                            </p>
                            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                                {mensajeCierreCitas || 'Por el momento no estamos agendando citas nuevas. Vuelve a intentarlo más tarde.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <AdminCard />
                <StudentCard />
            </div>
        </GuestLayout>
    );
}
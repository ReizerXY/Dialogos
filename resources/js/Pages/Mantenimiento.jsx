// resources/js/Pages/Mantenimiento.jsx
import { Head } from '@inertiajs/react';

export default function Mantenimiento() {
    return (
        <>
            <Head title="Sistema en mantenimiento" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
                <div className="max-w-lg w-full text-center">
                    {/* Ícono */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Encabezado institucional */}
                    <p className="text-sm font-semibold text-[#FF5900] uppercase tracking-widest mb-2">
                        Prepa Anáhuac Veracruz
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
                        Sistema en mantenimiento
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        Estamos realizando mejoras para brindarte un mejor servicio.
                        Volveremos a estar disponibles en unos minutos.
                    </p>

                    {/* Barra decorativa */}
                    <div className="w-24 h-1 bg-[#FF5900] mx-auto rounded-full mb-8"></div>

                    {/* Info adicional */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                    ¿Necesitas ayuda urgente?
                                </p>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    Si tu consulta es urgente, contacta directamente con el coordinador del programa Diálogos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-gray-400 mt-8">
                        Sistema Diálogos — Campus Córdoba-Orizaba
                    </p>
                </div>
            </div>
        </>
    );
}
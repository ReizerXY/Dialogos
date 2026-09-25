// resources/js/Pages/Panel/Backups.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Backups({ user }) {
    return (
        <AuthenticatedLayout>
            <Head title="Descargar copia de datos" />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Descargar copia de datos</h1>
                    <p className="text-gray-500 mt-1">Descarga respaldos de la base de datos en formato .sql</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* Advertencia */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Recomendaciones</p>
                        <ul className="text-sm text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                            <li>Guarda los archivos en un lugar seguro fuera del servidor.</li>
                            <li>El backup completo incluye las contraseñas hasheadas de los usuarios.</li>
                            <li>Prueba la restauración al menos una vez al mes.</li>
                        </ul>
                    </div>
                </div>

                {/* Botón: Backup de citas */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FF5900]/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">Copia de seguridad de citas</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Respaldo de la tabla <code className="bg-gray-100 px-1 rounded text-xs">citas</code>. Recomendado antes de hacer cambios masivos.
                                </p>
                            </div>
                        </div>
                        <a
                            href={route('admin.backup.citas')}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar copia de seguridad
                        </a>
                    </div>
                </div>

                {/* Botón: Backup completo */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">Copia de seguridad completa</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Respaldo de todas las tablas: <code className="bg-gray-100 px-1 rounded text-xs">citas</code>, <code className="bg-gray-100 px-1 rounded text-xs">estudiantes</code>, <code className="bg-gray-100 px-1 rounded text-xs">horarios</code> y <code className="bg-gray-100 px-1 rounded text-xs">usuarios</code>.
                                </p>
                            </div>
                        </div>
                        <a
                            href={route('admin.backup.completo')}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar backup completo
                        </a>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
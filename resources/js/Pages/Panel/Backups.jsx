// resources/js/Pages/Panel/Backups.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Backups({ user, estadoBackups, tablasExcluidas }) {
    // Modal de confirmacion
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        tipo: null,       // 'citas' | 'completo'
    });

    // Estado de descarga en curso
    const [descargando, setDescargando] = useState(null); // 'citas' | 'completo' | null

    const abrirConfirmacion = (tipo) => {
        setConfirmModal({ open: true, tipo });
    };

    const cerrarConfirmacion = () => {
        if (descargando) return;
        setConfirmModal({ open: false, tipo: null });
    };

    // Redirige al navegador a la URL de descarga.
    // El navegador empieza la descarga en background.
    const confirmarDescarga = () => {
        const tipo = confirmModal.tipo;
        const url = tipo === 'citas'
            ? route('admin.backup.citas')
            : route('admin.backup.completo');

        setDescargando(tipo);
        setConfirmModal({ open: false, tipo: null });

        // Disparar la descarga (el navegador la maneja en background)
        window.location.href = url;

        // Resetear el estado "descargando" a los 4 segundos
        setTimeout(() => setDescargando(null), 4000);
    };

    // Textos del modal según tipo
    const textos = {
        citas: {
            titulo: 'Descargar copia de citas',
            descripcion: 'Se generará un archivo .sql con la tabla de citas.',
            peso: 'aproximadamente 90 KB',
            aviso: 'Este archivo contiene información de 400 citas. Guárdalo en un lugar seguro.',
            color: 'orange',
        },
        completo: {
            titulo: 'Descargar copia completa',
            descripcion: 'Se generará un archivo .sql con estudiantes, citas, usuarios, horarios y configuración.',
            peso: 'aproximadamente 100 KB',
            aviso: 'Este archivo contiene información sensible (nombres, teléfonos y contraseñas hasheadas de 225 estudiantes y usuarios). Guárdalo en un lugar seguro y NO lo compartas por canales no seguros.',
            color: 'gray',
        },
    };

    const t = confirmModal.tipo ? textos[confirmModal.tipo] : {};

    return (
        <AuthenticatedLayout>
            <Head title="Descargar copia de datos" />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Descargar copia de datos</h1>
                    <p className="text-gray-500 mt-1">Descarga respaldos de la base de datos en formato .sql</p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* ============================================================= */}
                {/* ESTADO DEL BACKUP AUTOMATICO                                   */}
                {/* ============================================================= */}
                {estadoBackups?.accesible && (
                    <div className={`rounded-2xl p-4 mb-6 border ${
                        estadoBackups.desactualizado
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                estadoBackups.desactualizado ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                                <svg className={`w-5 h-5 ${estadoBackups.desactualizado ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${estadoBackups.desactualizado ? 'text-red-800' : 'text-blue-800'}`}>
                                    Backup automático {estadoBackups.desactualizado ? 'desactualizado' : 'al día'}
                                </p>
                                {estadoBackups.ultimo ? (
                                    <div className="text-xs mt-1 leading-relaxed space-y-0.5">
                                        <p className={estadoBackups.desactualizado ? 'text-red-700' : 'text-blue-700'}>
                                            Último backup generado por el servidor: <strong>{estadoBackups.ultimo.fecha}</strong>
                                            {' '}(hace {estadoBackups.ultimo.hace_horas} h) · {estadoBackups.ultimo.peso_formateado}
                                        </p>
                                        {estadoBackups.desactualizado && (
                                            <p className="text-red-700 font-medium mt-1">
                                                ⚠️ Han pasado más de 48 horas sin un backup automático. Revisa el cron en el VPS.
                                            </p>
                                        )}
                                        {estadoBackups.fallidos > 0 && (
                                            <p className="text-red-700 mt-1">
                                                ⚠️ {estadoBackups.fallidos} {estadoBackups.fallidos === 1 ? 'backup previo' : 'backups previos'} salieron vacíos (0 bytes). Revisa los logs del cron.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className={`text-xs mt-1 ${estadoBackups.desactualizado ? 'text-red-700' : 'text-blue-700'}`}>
                                        No se encontraron backups automáticos previos.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================= */}
                {/* RECOMENDACIONES                                                 */}
                {/* ============================================================= */}
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

                {/* ============================================================= */}
                {/* BOTON: BACKUP DE CITAS                                         */}
                {/* ============================================================= */}
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
                                <p className="text-xs text-gray-400 mt-1">
                                    Peso estimado: ~90 KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => abrirConfirmacion('citas')}
                            disabled={descargando !== null}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-medium rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {descargando === 'citas' ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar copia de seguridad
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ============================================================= */}
                {/* BOTON: BACKUP COMPLETO                                         */}
                {/* ============================================================= */}
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
                                    Respaldo de todas las tablas del sistema: <code className="bg-gray-100 px-1 rounded text-xs">citas</code>, <code className="bg-gray-100 px-1 rounded text-xs">estudiantes</code>, <code className="bg-gray-100 px-1 rounded text-xs">horarios</code>, <code className="bg-gray-100 px-1 rounded text-xs">usuarios</code> y <code className="bg-gray-100 px-1 rounded text-xs">configuracion</code>.
                                </p>
                                {tablasExcluidas && tablasExcluidas.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        No incluye tablas temporales: {tablasExcluidas.join(', ')}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Peso estimado: ~100 KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => abrirConfirmacion('completo')}
                            disabled={descargando !== null}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-all duration-200 active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {descargando === 'completo' ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar backup completo
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ============================================================= */}
            {/* MODAL DE CONFIRMACION                                          */}
            {/* ============================================================= */}
            {confirmModal.open && confirmModal.tipo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                confirmModal.tipo === 'completo' ? 'bg-amber-100' : 'bg-blue-100'
                            }`}>
                                <svg className={`w-6 h-6 ${
                                    confirmModal.tipo === 'completo' ? 'text-amber-600' : 'text-blue-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{t.titulo}</h2>
                        </div>

                        <p className="text-gray-600 mb-3">
                            {t.descripcion}
                        </p>

                        <div className={`rounded-xl p-3 mb-4 text-sm border ${
                            confirmModal.tipo === 'completo'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                        }`}>
                            <p className="font-medium mb-1">Peso aproximado: {t.peso}</p>
                            <p>{t.aviso}</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarDescarga}
                                className={`px-6 py-2 text-white rounded-xl transition active:scale-95 ${
                                    confirmModal.tipo === 'completo'
                                        ? 'bg-gray-800 hover:bg-gray-900'
                                        : 'bg-[#FF5900] hover:bg-[#CC4700]'
                                }`}
                            >
                                Sí, descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
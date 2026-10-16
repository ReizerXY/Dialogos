// resources/js/Pages/Panel/Backups.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Detecta movil
function esDispositivoMovil() {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const esMovil = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    return esMovil || window.innerWidth < 768;
}

export default function Backups({ user, estadoBackups, tablasExcluidas }) {
    // Modal de confirmacion
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        tipo: null,       // 'citas' | 'completo'
    });

    // Estado de descarga en curso
    const [descargando, setDescargando] = useState(null); // 'citas' | 'completo' | null

    // Toast abajo-centro
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Recomendaciones colapsables
    const [recomendacionesOpen, setRecomendacionesOpen] = useState(false);

    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        setEsMovil(esDispositivoMovil());
        const onResize = () => setEsMovil(esDispositivoMovil());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!toast.visible) return;
        const t = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
        return () => clearTimeout(t);
    }, [toast.visible]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };

    const abrirConfirmacion = (tipo) => {
        setConfirmModal({ open: true, tipo });
    };

    const cerrarConfirmacion = () => {
        if (descargando) return;
        setConfirmModal({ open: false, tipo: null });
    };

    // Redirige al navegador a la URL de descarga
    const confirmarDescarga = () => {
        const tipo = confirmModal.tipo;
        const url = tipo === 'citas'
            ? route('admin.backup.citas')
            : route('admin.backup.completo');

        setDescargando(tipo);
        setConfirmModal({ open: false, tipo: null });

        showToast(
            tipo === 'citas'
                ? 'Descarga de copia de citas iniciada. Revisa tu carpeta de descargas.'
                : 'Descarga de copia completa iniciada. Revisa tu carpeta de descargas.',
            'success'
        );

        // Dispara la descarga (el navegador la maneja en background)
        window.location.href = url;

        setTimeout(() => setDescargando(null), 4000);
    };

    // Textos del modal según tipo
    const textos = {
        citas: {
            titulo: 'Descargar copia de citas',
            descripcion: 'Se generará un archivo .sql con la tabla de citas.',
            peso: 'aprox. 90 KB',
            aviso: 'Este archivo contiene información de las citas registradas. Guárdalo en un lugar seguro.',
        },
        completo: {
            titulo: 'Descargar copia completa',
            descripcion: 'Se generará un archivo .sql con estudiantes, citas, usuarios, horarios y configuración.',
            peso: 'aprox. 100 KB',
            aviso: 'Este archivo contiene información sensible (nombres, teléfonos y contraseñas hasheadas). Guárdalo en un lugar seguro y NO lo compartas por canales no seguros.',
        },
    };

    const t = confirmModal.tipo ? textos[confirmModal.tipo] : {};

    return (
        <AuthenticatedLayout>
            <Head title="Descargar copia de datos" />

            {/* Toast */}
            {toast.visible && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border max-w-md ${
                        toast.type === 'error'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-green-50 text-green-800 border-green-200'
                    }`}>
                        {toast.type === 'error' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Descargar copia de datos</h1>
                    <p className="text-gray-500 mt-1">
                        Descarga respaldos de la base de datos en formato .sql
                    </p>
                    <div className="w-16 h-1 bg-[#FF5900] rounded-full mt-3"></div>
                </div>

                {/* ============================================================= */}
                {/* BANNER: ESTADO DEL BACKUP AUTOMÁTICO                           */}
                {/* ============================================================= */}
                {estadoBackups?.accesible && (
                    <div className={`rounded-2xl p-4 mb-6 border-2 ${
                        estadoBackups.desactualizado
                            ? 'bg-red-50 border-red-300'
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                estadoBackups.desactualizado ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                                <svg className={`w-5 h-5 ${estadoBackups.desactualizado ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {estadoBackups.desactualizado ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${estadoBackups.desactualizado ? 'text-red-900' : 'text-blue-900'}`}>
                                    Backup automático {estadoBackups.desactualizado ? 'desactualizado' : 'al día'}
                                </p>
                                {estadoBackups.ultimo ? (
                                    <div className="text-xs mt-1 leading-relaxed space-y-1">
                                        <p className={estadoBackups.desactualizado ? 'text-red-800' : 'text-blue-800'}>
                                            Último backup generado por el servidor:{' '}
                                            <strong>{estadoBackups.ultimo.fecha}</strong>{' '}
                                            (hace {estadoBackups.ultimo.hace_horas} h) · {estadoBackups.ultimo.peso_formateado}
                                        </p>
                                        {estadoBackups.desactualizado && (
                                            <p className="text-red-800 font-semibold flex items-start gap-1.5 mt-1">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                                </svg>
                                                Han pasado más de 48 horas sin un backup automático. Revisa el cron en el VPS.
                                            </p>
                                        )}
                                        {estadoBackups.fallidos > 0 && (
                                            <p className="text-red-800 flex items-start gap-1.5 mt-1">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                                                </svg>
                                                {estadoBackups.fallidos} {estadoBackups.fallidos === 1 ? 'backup previo salió' : 'backups previos salieron'} vacíos (0 bytes). Revisa los logs del cron.
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
                {/* CARD: BACKUP DE CITAS                                          */}
                {/* ============================================================= */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FF5900]/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-bold text-gray-800">Copia de seguridad de citas</h2>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    Respaldo solo de la tabla <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">citas</code>. Recomendado antes de hacer cambios masivos.
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Peso estimado: ~90 KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => abrirConfirmacion('citas')}
                            disabled={descargando !== null}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5900] text-white text-sm font-semibold rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
                                    Descargar copia
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ============================================================= */}
                {/* CARD: BACKUP COMPLETO                                          */}
                {/* ============================================================= */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-bold text-gray-800">Copia de seguridad completa</h2>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Datos sensibles
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    Respaldo de todas las tablas: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">citas</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">estudiantes</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">horarios</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">usuarios</code> y <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">configuracion</code>.
                                </p>
                                {tablasExcluidas && tablasExcluidas.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-2">
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
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-700/25 transition-all duration-200 active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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

                {/* ============================================================= */}
                {/* RECOMENDACIONES (colapsable)                                   */}
                {/* ============================================================= */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl overflow-hidden mb-6">
                    <button
                        type="button"
                        onClick={() => setRecomendacionesOpen(!recomendacionesOpen)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-100/50 transition text-left"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-amber-900">
                                    Recomendaciones para el manejo de backups
                                </p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Toca para ver las buenas prácticas
                                </p>
                            </div>
                        </div>
                        <svg className={`w-5 h-5 text-amber-600 transition-transform duration-300 flex-shrink-0 ${recomendacionesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {recomendacionesOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-amber-200">
                            <ul className="space-y-2 text-sm text-amber-800">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Guarda los archivos en un lugar seguro fuera del servidor (Google Drive, Backblaze, disco externo).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>El backup completo incluye las contraseñas hasheadas de los usuarios. No lo compartas por canales no seguros (WhatsApp, correo sin cifrar).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Prueba la restauración al menos una vez al mes para asegurarte de que los archivos se pueden recuperar.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Los backups automáticos se generan cada 24 horas en el servidor. Si el banner de arriba muestra "desactualizado", revisa el cron.</span>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================================= */}
            {/* MODAL DE CONFIRMACIÓN                                          */}
            {/* ============================================================= */}
            {confirmModal.open && confirmModal.tipo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                                    confirmModal.tipo === 'completo' ? 'bg-amber-100' : 'bg-[#FF5900]/10'
                                }`}>
                                    {confirmModal.tipo === 'completo' ? (
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-[#FF5900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h2 className="text-lg font-bold text-gray-800 leading-tight">{t.titulo}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-3">
                                {t.descripcion}
                            </p>

                            <div className={`rounded-xl p-3.5 mb-2 text-sm border ${
                                confirmModal.tipo === 'completo'
                                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                                    : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}>
                                <p className="font-semibold mb-1 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Peso aproximado: {t.peso}
                                </p>
                                <p>{t.aviso}</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={cerrarConfirmacion}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmarDescarga}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 ${
                                    confirmModal.tipo === 'completo'
                                        ? 'bg-slate-700 hover:bg-slate-800'
                                        : 'bg-[#FF5900] hover:bg-[#CC4700]'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Sí, descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
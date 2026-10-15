import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ title, children }) {
    return (
        <>
            <Head title={title ? `${title} - Sistema Dialogos` : 'Sistema Dialogos'} />
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                    <div className="mb-6">
                        <Link href="/">
                            <ApplicationLogo className="w-24 h-24 drop-shadow-md" />
                        </Link>
                    </div>
                    <div className="w-full max-w-4xl">
                        {children}
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 mt-12">
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Prepa Anahuac Veracruz</h3>
                                <p className="text-gray-600">Campus Cordoba-Orizaba</p>
                                <p className="text-gray-500 mt-1 text-xs">Sistema Dialogos</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Contacto</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Calle Universidad 100, Col. Rancho San Emigdio,<br />
                                    C.P. 94500, Cordoba, Veracruz, Mexico.
                                </p>
                                <p className="text-gray-600 mt-1">Telefono: 271 117 0280</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Enlaces</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <Link href="/" className="text-gray-600 hover:text-[#FF5900] transition-colors">
                                            Inicio
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/aviso-de-privacidad" className="text-gray-600 hover:text-[#FF5900] transition-colors">
                                            Aviso de Privacidad
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                            <p>Todos los derechos reservados &copy; {new Date().getFullYear()} Prepa Anahuac Veracruz</p>
                            <p className="mt-1">Sistema Dialogos v1.0.0</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
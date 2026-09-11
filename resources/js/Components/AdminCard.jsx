import { Link } from '@inertiajs/react';

export default function AdminCard() {
    return (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 p-8 text-center border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-5 bg-gradient-to-br from-[#FF5900] to-[#CC4700] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF5900]/20 group-hover:shadow-[#FF5900]/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Personal Administrativo</h2>
            <p className="text-gray-500 text-sm mb-6">Accede al panel de gestión</p>
            <Link
                href={route('login')}
                className="inline-block w-full px-6 py-3 bg-[#FF5900] text-white font-semibold rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 ease-in-out transform active:scale-95"
            >
                Ingresar
            </Link>
        </div>
    );
}
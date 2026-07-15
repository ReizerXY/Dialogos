import { Link } from '@inertiajs/react';

export default function AdminCard() {
    return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-[#FF5900]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Administrativo</h2>
            <Link
                href={route('login')}
                className="mt-4 inline-block px-8 py-3 bg-[#FF5900] text-white font-semibold rounded-lg hover:bg-[#CC4700] transition-colors duration-200"
            >
                Ingresar
            </Link>
        </div>
    );
}
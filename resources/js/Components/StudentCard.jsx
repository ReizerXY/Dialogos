import { Link } from '@inertiajs/react';

export default function StudentCard() {
    return (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 p-8 text-center border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-5 bg-gradient-to-br from-[#FF5900] to-[#CC4700] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF5900]/20 group-hover:shadow-[#FF5900]/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.25 5.25 0 007.5 15h9a5.25 5.25 0 002.5 4.993m-11.007 0A5.25 5.25 0 007.5 15.75h9a5.25 5.25 0 002.5 4.993m-11.007 0A5.25 5.25 0 007.5 15.75h9a5.25 5.25 0 002.5 4.993" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Estudiantes</h2>
            <p className="text-gray-500 text-sm mb-6">Solicita una cita con tu formador</p>
            <Link
                href={route('cita.solicitar')}
                className="inline-block w-full px-6 py-3 bg-[#FF5900] text-white font-semibold rounded-xl hover:bg-[#CC4700] hover:shadow-lg hover:shadow-[#FF5900]/25 transition-all duration-200 ease-in-out transform active:scale-95"
            >
                Solicitar cita
            </Link>
        </div>
    );
}
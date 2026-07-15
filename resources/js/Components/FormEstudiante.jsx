import { Link } from '@inertiajs/react';

export default function StudentCard() {
    return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-[#FF5900]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.25 5.25 0 007.5 15h9a5.25 5.25 0 002.5 4.993m-11.007 0A5.25 5.25 0 007.5 15.75h9a5.25 5.25 0 002.5 4.993m-11.007 0A5.25 5.25 0 007.5 15.75h9a5.25 5.25 0 002.5 4.993" />
                </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Estudiantes</h2>
            <Link
                href={route('cita.solicitar')}
                className="mt-4 inline-block px-8 py-3 bg-[#FF5900] text-white font-semibold rounded-lg hover:bg-[#CC4700] transition-colors duration-200"
            >
                Solicitar cita
            </Link>
        </div>
    );
}
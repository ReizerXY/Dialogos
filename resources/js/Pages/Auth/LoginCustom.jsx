import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function LoginCustom() {
    const { data, setData, post, processing, errors } = useForm({
        usuario: '',
        clave: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login.post'));
    };

    return (
        <GuestLayout title="Iniciar sesión">
            <Head title="Iniciar sesión" />
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-center text-[#FF5900] mb-6">Iniciar sesión</h2>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input
                            type="text"
                            value={data.usuario}
                            onChange={e => setData('usuario', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF5900] focus:border-[#FF5900]"
                            placeholder="Ingresa tu usuario"
                            autoFocus
                        />
                        {errors.usuario && <p className="text-red-600 text-sm mt-1">{errors.usuario}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Clave</label>
                        <input
                            type="password"
                            value={data.clave}
                            onChange={e => setData('clave', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF5900] focus:border-[#FF5900]"
                            placeholder="Ingresa tu clave"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#FF5900] text-white py-2 rounded-md hover:bg-[#CC4700] disabled:opacity-50 transition-colors"
                    >
                        Iniciar sesión
                    </button>
                </form>

                {/* ✅ Enlace "Volver a la página principal" ahora debajo del botón */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF5900] border border-gray-300 hover:border-[#FF5900] px-4 py-2 rounded-md transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a la página principal
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
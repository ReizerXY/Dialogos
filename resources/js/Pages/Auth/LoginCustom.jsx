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
        <GuestLayout title="Iniciar sesion">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 w-full max-w-md mx-auto">
                <div className="text-center mb-6">
                    <p className="text-xs font-semibold text-[#FF5900] uppercase tracking-wide mb-1">
                        Sistema Dialogos
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800">Iniciar sesion</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Acceso exclusivo para personal autorizado
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                            Usuario
                        </label>
                        <input
                            id="usuario"
                            type="text"
                            value={data.usuario}
                            onChange={e => setData('usuario', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                            placeholder="Ingresa tu usuario"
                            autoComplete="username"
                            maxLength={50}
                            required
                            autoFocus
                        />
                        {errors.usuario && (
                            <p className="text-red-600 text-sm mt-1">{errors.usuario}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="clave" className="block text-sm font-medium text-gray-700">
                            Clave
                        </label>
                        <input
                            id="clave"
                            type="password"
                            value={data.clave}
                            onChange={e => setData('clave', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-[#FF5900]/50 focus:border-[#FF5900]"
                            placeholder="Ingresa tu clave"
                            autoComplete="current-password"
                            maxLength={255}
                            required
                        />
                        {errors.clave && (
                            <p className="text-red-600 text-sm mt-1">{errors.clave}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#FF5900] text-white font-semibold py-3 rounded-xl hover:bg-[#CC4700] disabled:opacity-50 transition-all duration-200 active:scale-95"
                    >
                        {processing ? 'Iniciando...' : 'Iniciar sesion'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF5900] border border-gray-300 hover:border-[#FF5900] px-4 py-2 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
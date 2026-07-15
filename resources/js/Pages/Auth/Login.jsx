import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',      // Internamente Laravel espera 'email'
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout title="Iniciar sesión">
            <Head title="Iniciar sesión" />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Usuario" />

                    <TextInput
                        id="email"
                        type="text"           // Cambiado a text para que parezca usuario
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Ingresa tu usuario"
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Ingresa tu contraseña"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-6">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-[#FF5900] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#CC4700] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5900] disabled:opacity-25 transition ease-in-out duration-150"
                        disabled={processing}
                    >
                        {processing ? 'Cargando...' : 'Iniciar sesión'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
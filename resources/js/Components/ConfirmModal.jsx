import { useEffect } from 'react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message = '¿Estás seguro?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    loading = false,
}) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const variants = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            btn: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            btn: 'bg-yellow-500 hover:bg-yellow-600',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            btn: 'bg-[#FF5900] hover:bg-[#CC4700]',
        },
    };

    const v = variants[variant] || variants.info;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${v.iconBg}`}>
                        <svg className={`w-6 h-6 ${v.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    </div>
                </div>

                <div className="mb-6 text-sm text-gray-600 pl-16">
                    {message}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-xl shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 ${v.btn}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
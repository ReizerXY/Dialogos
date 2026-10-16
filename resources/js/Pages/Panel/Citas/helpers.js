// resources/js/Pages/Panel/Citas/helpers.js

export const CLASIFICACION_COLOR = {
    'académica':     'bg-blue-500',
    'familiar':      'bg-green-500',
    'emocional':     'bg-purple-500',
    'espiritual':    'bg-pink-500',
    'institucional': 'bg-amber-500',
};

export const CLASIFICACIONES = ['académica', 'familiar', 'emocional', 'espiritual', 'institucional'];

export const CLASIFICACION_LABELS = {
    'académica':     'Académica',
    'familiar':      'Familiar',
    'emocional':     'Emocional',
    'espiritual':    'Espiritual',
    'institucional': 'Institucional',
};

export const ESTADO_LABELS = {
    programada:         'Programada',
    cancelada:          'Cancelada',
    cancelada_liberada: 'Cancelada (liberada)',
    completada:         'Completada',
};

export const ASISTENCIA_LABELS = {
    'pendiente':  'Pendiente',
    'asistió':    'Asistió',
    'no asistió': 'No asistió',
};

// Convierte fecha YYYY-MM-DD a DD-MM-YYYY
export function formatFecha(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// Convierte fecha YYYY-MM-DD a "16 oct 2026"
export function formatFechaCorta(fecha) {
    if (!fecha) return '';
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const [y, m, d] = fecha.split('-');
    return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

// Determina si la fecha y hora de una cita ya pasaron
export function citaYaPaso(cita) {
    if (!cita?.fecha) return false;
    const hora = cita.hora ? cita.hora.substring(0, 8) : '00:00:00';
    const fechaHora = new Date(`${cita.fecha}T${hora}`);
    return !isNaN(fechaHora.getTime()) && fechaHora.getTime() < Date.now();
}

// Devuelve una etiqueta corta relativa ("Hoy", "Mañana", "Hace 2 días", "En 3 días")
// o null si la fecha esta muy lejos en el tiempo.
export function etiquetaFechaRelativa(fecha) {
    if (!fecha) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(fecha + 'T00:00:00');
    objetivo.setHours(0, 0, 0, 0);

    const diffDias = Math.round((objetivo - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return { texto: 'Hoy', tipo: 'hoy' };
    if (diffDias === 1) return { texto: 'Mañana', tipo: 'manana' };
    if (diffDias === -1) return { texto: 'Ayer', tipo: 'pasado' };
    if (diffDias > 1 && diffDias <= 7) return { texto: `En ${diffDias} días`, tipo: 'futuro' };
    if (diffDias < -1 && diffDias >= -7) return { texto: `Hace ${Math.abs(diffDias)} días`, tipo: 'pasado' };
    return null;
}
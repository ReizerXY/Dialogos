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

// Determina si la fecha y hora de una cita ya pasaron
export function citaYaPaso(cita) {
    if (!cita?.fecha) return false;
    const hora = cita.hora ? cita.hora.substring(0, 8) : '00:00:00';
    const fechaHora = new Date(`${cita.fecha}T${hora}`);
    return !isNaN(fechaHora.getTime()) && fechaHora.getTime() < Date.now();
}
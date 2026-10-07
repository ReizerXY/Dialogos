// resources/js/Pages/Panel/Indicadores/helpers.js

export const CLASIFICACION_COLOR_BLOCK = {
    'académica':     'bg-blue-500',
    'familiar':      'bg-green-500',
    'emocional':     'bg-purple-500',
    'espiritual':    'bg-pink-500',
    'institucional': 'bg-amber-500',
};

export const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

export const SECCIONES_INFO = [
    { key: 'kpis',         label: 'Resumen general',                        default: true },
    { key: 'distribucion', label: 'Distribución de citas',                  default: true },
    { key: 'tendencias',   label: 'Tendencias',                             default: true },
    { key: 'destacados',   label: 'Formadores y estudiantes con más citas', default: true },
    { key: 'comparativas', label: 'Comparativas',                           default: true },
    { key: 'formadores',   label: 'Datos por formador',                     default: true },
    { key: 'estudiantes',  label: 'Estudiantes por grado/grupo',            default: true },
    { key: 'citas',        label: 'Tabla de citas',                         default: true },
];

// Devuelve el título del mes a partir de YYYY-MM
export function mesTitulo(mesYMD) {
    if (!mesYMD) return '';
    const [year, month] = mesYMD.split('-');
    return `${MESES_ES[parseInt(month, 10) - 1]} ${year}`;
}

// Devuelve el título de la semana ISO
export function semanaTitulo(semanaISO) {
    if (!semanaISO) return '';
    const [year, weekPart] = semanaISO.split('-W');
    return `semana ${parseInt(weekPart, 10)} de ${year}`;
}

// Convierte hora 24h a formato 12h
export function formatHora12(hora24) {
    if (!hora24) return '';
    const [h, m] = hora24.split(':');
    let hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'pm' : 'am';
    if (hNum === 0) hNum = 12;
    else if (hNum > 12) hNum -= 12;
    return `${hNum}:${m} ${ampm}`;
}

// Capitaliza la primera letra
export function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Formatea fecha YYYY-MM-DD a DD-MM-YYYY
export function formatFecha(f) {
    if (!f) return '';
    const p = f.split('-');
    return `${p[2]}-${p[1]}-${p[0]}`;
}
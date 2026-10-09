// resources/js/Pages/Panel/Estudiantes/helpers.js

export const GRADOS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
export const OPCIONES_POR_PAGINA = [25, 50, 100, 200];

// Normaliza un string: minúsculas y sin acentos. Para búsquedas.
export function normalizarTexto(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Formatea fecha YYYY-MM-DD a DD-MM-YYYY
export function formatFecha(fecha) {
    if (!fecha) return '';
    const p = fecha.split('-');
    if (p.length !== 3) return fecha;
    return `${p[2]}-${p[1]}-${p[0]}`;
}

// Lee el token CSRF del meta tag (token plano, válido para X-CSRF-TOKEN).
// El cookie XSRF-TOKEN está encriptado, así que NO sirve para X-CSRF-TOKEN.
export function obtenerCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}
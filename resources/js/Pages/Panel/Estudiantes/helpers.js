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

// ✅ Lee el token CSRF del meta tag O del cookie XSRF-TOKEN (más fresco).
//    Laravel refresca el cookie en cada respuesta, así que siempre está actualizado.
//    Esto evita el error "CSRF token mismatch" (419).
export function obtenerCsrfToken() {
    // 1) Intenta leer el cookie (fuente principal, siempre fresco)
    const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match && match[2]) {
        return decodeURIComponent(match[2]);
    }

    // 2) Fallback: meta tag (por si el cookie no está disponible)
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}
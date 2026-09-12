export default function ApplicationLogo({ className = '' }) {
    return (
        <img
            src="/images/logo.jpg"
            alt="Diálogos - Prepa Anáhuac"
            className={`object-contain ${className}`}
        />
    );
}
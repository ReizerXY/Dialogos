export default function ApplicationLogo({ className }) {
    return (
        <svg
            viewBox="0 0 80 80"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="40" cy="40" r="35" fill="#FF5900" />
            <text
                x="40"
                y="48"
                textAnchor="middle"
                fill="white"
                fontSize="36"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
            >
                D
            </text>
        </svg>
    );
}
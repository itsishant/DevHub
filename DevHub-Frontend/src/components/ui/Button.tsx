interface ButtonProps {
    label: string;
    onClick : () => void;
    backgroundColor?: string;
    textColor?: string;
}

export const Button = ({label, onClick, backgroundColor, textColor}: ButtonProps) => {
    return (
        <button onClick={onClick} className={`px-6 py-3 ${textColor} font-poppin tracking-tight text-2xl rounded-lg transition-colors ${backgroundColor} `}>
            {label}
        </button>
    );
}

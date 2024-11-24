interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  icon?: string;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-orange-600 text-white",
  secondary: "bg-gray-200 text-gray-800",
};

export default function Button({
  onClick,
  label,
  icon,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center rounded-full gap-2 ${variantClasses[variant]}`}
    >
      <div>{label}</div>
      {icon && (
        <span className="material-symbols-sharp text-[22px]">{icon}</span>
      )}
    </button>
  );
}

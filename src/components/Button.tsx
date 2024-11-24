interface ButtonProps {
  label: string;
  onClick?: () => void;
  icon?: string;
}

export default function Button({ onClick, label, icon }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center bg-orange-600 rounded-full text-white gap-2"
    >
      <div>{label}</div>
      {icon && <span className="material-symbols-sharp">open_in_new</span>}
    </button>
  );
}

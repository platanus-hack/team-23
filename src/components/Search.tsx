import { useRef } from "react";
import { useAppContext } from "../contexts/AppContext";
import preventWidows from "../scripts/preventWidows";

export default function Search() {
  const { setQuery } = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-dvh flex flex-col justify-center">
      <div className="text-orange-600 text-[32px] leading-tight mb-6">
        {preventWidows("¿Qué quieres aprender hoy?") + " 🤓"}
      </div>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(inputRef.current?.value || "");
        }}
      >
        <input
          className="w-full bg-white border border-zinc-400/30 placeholder-zinc-400 rounded-lg h-[52px] shadow-xl shadow-zinc-600/5 px-4 focus:outline-black"
          placeholder="Haz una pregunta o ingresa un tema..."
          ref={inputRef}
          type="text"
          autoFocus
        />
      </form>
    </div>
  );
}

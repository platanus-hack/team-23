import { useState } from "react";
import suggestions from "../suggestions.json";
import { shuffleArray } from "./AppearingTextRandomizer";
import { useAppContext } from "../contexts/AppContext";

export default function Suggestions() {
  const { setQuery } = useAppContext();
  const [terms] = useState(shuffleArray(suggestions.terms).slice(0, 5));

  return (
    <div className="absolute bottom-10 flex flex-wrap gap-x-3 gap-y-2 sm:justify-center">
      {terms.map((term) => (
        <a
          key={term}
          href="#"
          onClick={() => setQuery(term.split(" ").slice(1).join(" "))}
          className="text-sm text-neutral-700 hover:opacity-80 rounded-full m-1 hover:no-underline"
        >
          {term}
        </a>
      ))}
    </div>
  );
}

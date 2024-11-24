import { useAppContext } from "../contexts/AppContext";
import preventWidows from "../scripts/preventWidows";
import { Finding } from "../interfaces";
import FormattedMarkdown from "./FormattedMarkdown";

export default function KeyFindings() {
  const { summary, toggleFinding, visibleFindings } = useAppContext();

  return (
    <div>
      <h2>Hallazgos clave</h2>
      {summary!.key_findings.map((finding: Finding) => (
        <div key={finding.title} className="bg-[#F5F3EE] mb-3 py-4 rounded-md">
          <div
            className="flex items-center gap-4 justify-between px-5 text-black cursor-pointer hover:opacity-70"
            onClick={() => toggleFinding(finding.title)}
          >
            <div className="font-medium">{preventWidows(finding.title)}</div>
            <span
              className={`material-symbols-sharp text-[16px] with-transition ${
                visibleFindings.includes(finding.title) && "rotate-90"
              }`}
            >
              arrow_forward_ios
            </span>
          </div>
          <FormattedMarkdown
            content={finding.summary}
            className={`with-transition overflow-hidden px-5 mt-2 ${
              !visibleFindings.includes(finding.title) && "hidden"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

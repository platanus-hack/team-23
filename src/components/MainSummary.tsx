import { useAppContext } from "../contexts/AppContext";
import preventWidows from "../scripts/preventWidows";
import FormattedMarkdown from "./FormattedMarkdown";

export default function MainSummary() {
  const { summary, totalPublicationsCount } = useAppContext();

  const summaryText = summary!.query_answer ?? summary!.introduction_summary;

  return (
    <div className="mb-10">
      {!!totalPublicationsCount && (
        <div className="text-[15px] text-neutral-400 mb-2">
          {new Intl.NumberFormat().format(totalPublicationsCount)} artículos
          encontrados
        </div>
      )}

      <h1 className="text-[22px] leading-7 font-semibold text-black">
        {preventWidows(
          summary!.query_answer ? summary!.clean_query : summary!.title
        )}
      </h1>

      <div className="w-[50px] h-[2px] bg-orange-500 mt-5 mb-7" />

      <FormattedMarkdown content={summaryText} />
    </div>
  );
}

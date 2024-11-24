import ReactMarkdown from "react-markdown";
import { useAppContext } from "../contexts/AppContext";

export default function FormattedMarkdown({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const { mappedAnchorComponent } = useAppContext();

  return (
    <ReactMarkdown
      className={`markdown-body ${className}`}
      components={{
        a: mappedAnchorComponent,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

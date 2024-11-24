import React, { useCallback, useEffect, useState } from "react";
import { Publication } from "../App";
import Button from "./Button";
import getPublicationAuthors from "../scripts/getPublicationAuthors";

interface PublicationDetailsModalProps {
  publication: Publication;
  onClose: () => void;
}

const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  if (words.length <= wordLimit) {
    return text;
  }
  return words.slice(0, wordLimit).join(" ") + "...";
};

const getApaCitation = (publication: Publication): string => {
  const authors = getPublicationAuthors(publication);
  const year = publication.pub_year;
  const title = publication.title;
  const source = publication.location_display_name;

  const parts = [`${authors} (${year})`, title, source, publication.doi].filter(
    (part) => !!part
  );

  return parts.join(". ") + ".";
};

const PublicationDetailsModal: React.FC<PublicationDetailsModalProps> = ({
  publication,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const closeModal = useCallback(() => {
    setMounted(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const byline = [
    getPublicationAuthors(publication),
    publication.pub_year,
  ].join(", ");

  const copyCitation = useCallback(() => {
    const citation = getApaCitation(publication);
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [publication]);

  return (
    <div className="fixed inset-0">
      <div
        className={`absolute with-transition flex flex-col justify-end inset-0 bg-neutral-900/60 ${
          mounted ? "bg-neutral-900/60" : "bg-transparent"
        }`}
      >
        <div className="absolute inset-0" onClick={closeModal} />
        <div
          className={`relative with-transition w-full max-w-2xl mx-auto p-6 bg-white rounded-t-xl shadow-lg ${
            mounted ? "top-0" : "top-full"
          }`}
        >
          <div className="mb-6">
            <div className="text-lg font-medium leading-snug mb-1">
              {publication.title}
            </div>
            <div className="text-sm">{byline}</div>
            <div className="text-sm text-neutral-500 mt-0.5">
              Citado {publication.cited_by_count} veces
            </div>
            <div className="mt-4 text-base">
              {truncateText(publication.abstract, 40)}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Button
              label="Visitar fuente"
              icon="open_in_new"
              onClick={() => window.open(publication.doi)}
            />
            <Button
              label={copied ? "¡Copiado!" : "Copiar cita"}
              icon={copied ? "check" : "content_copy"}
              onClick={copyCitation}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetailsModal;

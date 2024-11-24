import React, { useCallback, useEffect, useState } from "react";
import { Publication } from "../App";
import Button from "./Button";
import getPublicationAuthors from "../scripts/getPublicationAuthors";

interface PublicationDetailsModalProps {
  publication: Publication;
  onClose: () => void;
}

const PublicationDetailsModal: React.FC<PublicationDetailsModalProps> = ({
  publication,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const closeModal = useCallback(() => {
    setMounted(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const byline = [
    getPublicationAuthors(publication),
    publication.pub_year,
  ].join(", ");

  return (
    <div className="fixed inset-0">
      <div
        className={`absolute with-transition flex flex-col justify-end inset-0 bg-neutral-900/60 ${
          mounted ? "bg-neutral-900/60" : "bg-transparent"
        }`}
      >
        <div className="absolute inset-0" onClick={closeModal} />
        <div
          className={`relative with-transition w-full p-6 bg-white rounded-t-lg shadow-lg ${
            mounted ? "top-0" : "top-full"
          }`}
        >
          <div className="mb-6">
            <div className="text-lg font-medium leading-snug mb-2">
              {publication.title}
            </div>
            <div className="text-sm">{byline}</div>
            <div className="text-sm text-neutral-500 mt-0.5">
              Citado {publication.cited_by_count} veces
            </div>
          </div>
          <Button
            label="Visitar fuente"
            icon="open_in_new"
            onClick={() => window.open(publication.doi)}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicationDetailsModal;

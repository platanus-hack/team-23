import React, { useCallback } from "react";
import { ExtraProps } from "react-markdown";
import { Publication } from "../interfaces";

const CitationLink: React.FC<
  React.ClassAttributes<HTMLAnchorElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> &
    ExtraProps & {
      bibliography: Publication[];
      onCitationClick: (doi: string) => void;
    }
> = ({ href, onCitationClick, bibliography, ...rest }) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (href) {
        event.preventDefault();
        onCitationClick(href);
      }
    },
    [href, onCitationClick]
  );

  const index = bibliography.findIndex((pub) => pub.id === href) + 1;

  return (
    <a
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="relative text-sm font-semibold -top-1 -ml-0.5"
      {...rest}
    >
      {index}
    </a>
  );
};

export default CitationLink;

import React, { useCallback } from "react";
import { ExtraProps } from "react-markdown";

const CitationLink: React.FC<
  React.ClassAttributes<HTMLAnchorElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> &
    ExtraProps & { onCitationClick: (doi: string) => void }
> = ({ href, onCitationClick, ...rest }) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (href) {
        event.preventDefault();
        onCitationClick(href);
      }
    },
    [href, onCitationClick]
  );

  return (
    <a
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    />
  );
};

export default CitationLink;

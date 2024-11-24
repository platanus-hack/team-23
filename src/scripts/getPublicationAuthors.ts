import { Publication } from "../App";

export default function getPublicationAuthors(publication: Publication) {
  if (publication.authorships.length === 0) return "Anónimo";

  const mainAuthor =
    publication.authorships.find(
      (authorship) => authorship.author_position === "first"
    ) || publication.authorships[0];

  const otherAuthors = publication.authorships.filter(
    (authorship) => authorship.author.id !== mainAuthor.author.id
  );

  return publication.authorships.length >= 3
    ? mainAuthor.raw_author_name + " et al."
    : [mainAuthor, ...otherAuthors]
        .map((authorship) => authorship.raw_author_name)
        .join(", ");
}

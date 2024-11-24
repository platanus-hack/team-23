import { useAppContext } from "../contexts/AppContext";
import getPublicationAuthors from "../scripts/getPublicationAuthors";

const Bibliography: React.FC = () => {
  const { filteredBibliography } = useAppContext();

  return (
    <div>
      <h2>Bibliografía</h2>
      <div className="flex flex-col gap-2.5">
        {filteredBibliography.map((publication, index) => {
          const author = getPublicationAuthors(publication);
          return (
            <div key={publication.id} className="flex gap-2">
              <div>{index + 1}.</div>
              <div className="flex-1">
                <a href={"#"}>{publication.title}</a>
                <div>
                  {[author, "(" + publication.pub_year + ")"].join(", ")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bibliography;

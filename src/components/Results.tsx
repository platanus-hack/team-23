import { ScaleLoader } from "react-spinners";
import { useAppContext } from "../contexts/AppContext";
import AppearingTextRandomizer from "./AppearingTextRandomizer";
import MainSummary from "./MainSummary";
import KeyFindings from "./KeyFindings";
import PublicationDetailsModal from "./PublicationDetailsModal";
import Bibliography from "./Bibliography";

const Loader: React.FC = () => {
  const { facts, loadingFacts } = useAppContext();

  return (
    <div className="flex flex-col flex-1">
      <div className="relative flex flex-col flex-1 justify-center items-center">
        <div className="-mt-14">
          <ScaleLoader height={20} radius={10} />
        </div>
        {!loadingFacts && facts?.length && (
          <div className="text-center text-zinc-600 absolute top-[50%] mt-2 w-full">
            <AppearingTextRandomizer
              facts={facts}
              rotateInterval={2000}
              timeBetweenChars={60}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function Results() {
  const { loading, summary, openPublication, setOpenPublication } =
    useAppContext();

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        summary && (
          <div className="pt-4 flex flex-col gap-12 pb-16">
            <MainSummary />
            <KeyFindings />
            <Bibliography />
          </div>
        )
      )}
      {openPublication && (
        <PublicationDetailsModal
          publication={openPublication}
          onClose={() => setOpenPublication(null)}
        />
      )}
    </>
  );
}

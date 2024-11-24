import "./App.css";
import { AppContext, useAppContextValue } from "./contexts/AppContext";
import Results from "./components/Results";
import Search from "./components/Search";

function App() {
  const appContextValue = useAppContextValue();

  const { query, loading } = appContextValue;

  const showingResults = query && !loading;

  return (
    <AppContext.Provider value={appContextValue}>
      <div className={`header ${!showingResults && "sm-centered"}`}>
        <img src="/logo.svg" alt="logo" className="h-5" />
        {showingResults && (
          <button
            onClick={() => appContextValue.setQuery("")}
            className={`absolute right-6 flex items-center justify-center rounded-full gap-2 bg-orange-600 h-[36px] px-4 text-white text-sm font-medium`}
          >
            Nueva búsqueda
          </button>
        )}
      </div>
      {query ? <Results /> : <Search />}
    </AppContext.Provider>
  );
}

export default App;

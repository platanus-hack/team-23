import "./App.css";
import { AppContext, useAppContextValue } from "./contexts/AppContext";
import Results from "./components/Results";
import Search from "./components/Search";

function App() {
  const appContextValue = useAppContextValue();

  const { query } = appContextValue;

  return (
    <AppContext.Provider value={appContextValue}>
      <div className={`header ${!query && "absolute"}`}>
        <img src="/logo.svg" alt="logo" className="h-5" />
      </div>
      {query ? <Results /> : <Search />}
    </AppContext.Provider>
  );
}

export default App;

import "./App.css";
import { AppContext, useAppContextValue } from "./contexts/AppContext";
import Results from "./components/Results";

function App() {
  const appContextValue = useAppContextValue();

  return (
    <AppContext.Provider value={appContextValue}>
      <Results />
    </AppContext.Provider>
  );
}

export default App;

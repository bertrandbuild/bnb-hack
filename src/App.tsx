import { Outlet } from "react-router-dom";
import "./App.css";

// import global context
import { GlobalProvider  } from "./context/globalContext";

// import components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

function App() {
  return (
    <GlobalProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex justify-center items-start px-4 py-0">
          <Outlet />
        </main>
        <Footer />
      </div>
    </GlobalProvider>
  );
}

export default App;

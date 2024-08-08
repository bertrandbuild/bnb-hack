import { Outlet } from "react-router-dom";
import "./App.css";

// import components
import NavBar from "./components/ui/NavBar";
import Footer from "./components/ui/Footer";

function App() {
  return (
    <div className="bg-base-100 min-h-screen flex flex-col">
      <NavBar />
      <main className="container mx-auto px-4 py-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;

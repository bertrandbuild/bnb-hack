import { Outlet } from 'react-router-dom';
import './App.css'

// import components
// import NavBar from './components/NavBar';
// import Footer from './components/Footer';

function App() {

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* <NavBar /> */}
        <main className="flex-grow flex justify-center items-start px-4 py-0">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </>
  )
}

export default App;

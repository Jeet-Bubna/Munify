import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "../components/Navbar";
import MakeCom from "./pages/MakeCom";
import JoinCom from "./pages/JoinCom";
import About from "./pages/About";
import Start from "./pages/Start";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar/>
      <Routes>
        <Route path="/make" element={<MakeCom />} />
        <Route path="/join" element={<JoinCom />} />
        <Route path="/about" element={<About />} />
        <Route path="/start" element={<Start/>} />
        <Route path="/" element={<HomePage />} /> 
      </Routes>
    </div>
  );
}

export default App;
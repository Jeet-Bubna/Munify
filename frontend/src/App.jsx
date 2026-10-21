import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "../components/Navbar";
import About from "./pages/About";
import OnBoard from "./pages/OnBoard";
import JoinCom from "./pages/JoinCom";
import MakeMun from "./pages/MakeMun";
import ChairDashboard from "./pages/ChairDashboard";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar/>
      <Routes>
        <Route path="/make" element={<MakeMun />} />
        <Route path="/dashboard" element={<ChairDashboard />} />
        <Route path="/join" element={<JoinCom/>} />
        <Route path="/onboard" element={<OnBoard/>} />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<HomePage />} /> 
      </Routes>
    </div>
  );
}

export default App;
import React from "react";
import Navbar from "../../components/Navbar";
import { NavLink } from "react-router-dom";

function HomePage() {
  return (
    <div>
        <div className="text-center text-8xl text-white pt-[25vh]">JayBlur</div>
        <div className="text-center text-3xl text-white pt-[5vh]">
          An online MUN management app
        </div>
        <div className="text-center text-2xl text-white pt-[2vh]">
          Made with ❤️ for banglore
        </div>
        <NavLink to="/start">
        <div
          className="block mx-auto mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-2xl w-[15vw] text-center"
        >
          Get Started
        </div>
        </NavLink>
      </div>
  );
}

export default HomePage;

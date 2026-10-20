import { useState } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  const navItems = [
    { id: 1, text: "Login", link: "/onboard" },
    { id: 2, text: "Signup", link: "/onboard" },
    { id: 3, text: "About", link: "/about" },
  ];

  return (
    <nav className="bg-gray-800 text-white w-full">
      <div className="flex justify-between items-center h-24 max-w-310 mx-auto px-4">
        <NavLink to="/">
          <h1 className="text-3xl font-bold text-blue-400 duration-300 hover:text-white">JayBlur</h1>
        </NavLink>

        <ul className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <li key={item.id} className="rounded-xl duration-300">
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `p-4 block rounded-xl duration-300 ${
                    isActive
                      ? "text-blue-500 font-semibold"
                      : "hover:text-blue-400"
                  }`
                }
              >
                {item.text}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          onClick={handleNav}
          className="block md:hidden focus:outline-none p-2"
          aria-label="Toggle Navigation"
        >
          {nav ? (
            <svg
              className="w-6 h-6 fill-current text-white"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.293 5.293a1 1 0 011.414 1.414L13.414 12l6.293 6.293a1 1 0 01-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 01-1.414-1.414L10.586 12 4.293 5.707a1 1 0 011.414-1.414L12 10.586l6.293-5.293z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 fill-current text-white"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
              />
            </svg>
          )}
        </button>

        {nav && (
          <div
            onClick={handleNav}
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
          />
        )}

        {/* Mobile Navigation Drawer */}
        <div
          className={
            nav
              ? "fixed left-0 top-0 w-[60%] sm:w-[50%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500 z-20 md:hidden"
              : "fixed top-0 bottom-0 left-[-100%] w-[60%] ease-in-out duration-500 z-20 md:hidden"
          }
        >
          <h1 className="text-3xl font-bold text-[#00df9a] m-4 mt-7">REACT.</h1>

          <ul className="uppercase p-4">
            {navItems.map((item) => (
              <li key={item.id} className="border-b border-gray-600">
                <NavLink
                  to={item.link}
                  onClick={() => setNav(false)}
                  className={({ isActive }) =>
                    `p-4 block duration-300 ${
                      isActive
                        ? "text-[#00df9a] font-semibold bg-gray-900"
                        : "hover:bg-[#00df9a] hover:text-black"
                    }`
                  }
                >
                  {item.text}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

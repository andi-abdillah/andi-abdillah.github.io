import { useEffect, useState } from "react";
import Logo from "../assets/logo.png";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOnScroll = () => {
    const scrollTop = window.scrollY;
    setIsScrolled(scrollTop > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleOnScroll);
    return () => {
      window.removeEventListener("scroll", handleOnScroll);
    };
  }, []);

  const menuItems = [
    { label: "home" },
    { label: "services" },
    { label: "portfolio" },
    { label: "contact" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[9999] w-screen bg-primary transition-[padding-top,padding-bottom] duration-1000 ease-in-out ${
        isScrolled ? "py-4 drop-shadow" : "py-8"
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl justify-between px-8 text-white md:px-16 lg:px-32">
        <div className="flex items-center gap-2">
          <img className="h-4 w-4" src={Logo} alt="logo" />
          <span className="text-lg font-bold">andi.id</span>
        </div>

        <ul className="hidden gap-10 font-semibold md:flex">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.label}`}
                className="uppercase hover:text-secondary"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="text-3xl font-bold md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IoClose /> : <IoMenu />}
        </button>
      </div>
      {isOpen && (
        <ul className="space-y-6 py-6 text-center text-lg uppercase text-white md:hidden">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.label}`}
                className="font-semibold hover:text-secondary"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;

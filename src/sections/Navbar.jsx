import { useEffect, useState } from "react";
import Logo from "../assets/logo.png";

const MENU_ITEMS = [
  { label: "home" },
  { label: "services" },
  { label: "portfolio" },
  { label: "contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isVisible, setIsVisible]         = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isOpen, setIsOpen]               = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = MENU_ITEMS.map((item) => document.getElementById(item.label));
      let current = "";
      sections.forEach((section) => {
        if (section && window.pageYOffset >= section.offsetTop - 100)
          current = section.getAttribute("id");
      });
      setActiveSection(current);
      setIsScrolled(window.pageYOffset > 50);
      const homeHeight = document.getElementById("home")?.offsetHeight ?? window.innerHeight;
      setIsVisible(window.pageYOffset > homeHeight * 0.6);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[9999] w-screen bg-primary transition-[padding] duration-1000 ease-in-out ${
        isScrolled ? "py-4 drop-shadow" : "py-8"
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out, padding 1s ease",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-8 text-white md:px-16 lg:px-32">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img className="h-4 w-4" src={Logo} alt="logo" />
          <span className="text-lg font-bold">andi.id</span>
        </div>

        {/* Desktop menu */}
        <ul className="hidden gap-10 font-futura font-semibold md:flex">
          {MENU_ITEMS.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.label}`}
                className={`uppercase ${activeSection === item.label ? "text-secondary" : "hover:text-secondary"}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Burger — 2 strips → X */}
        <button
          className="relative flex h-8 w-8 flex-col items-center justify-center gap-0 md:hidden"
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span
            className="block h-[3.5px] w-6 rounded-full bg-white transition-all duration-300 ease-in-out"
            style={{
              transform: isOpen ? "translateY(4px) rotate(45deg)" : "translateY(-4px)",
            }}
          />
          <span
            className="block h-[3.5px] w-6 rounded-full bg-white transition-all duration-300 ease-in-out"
            style={{
              transform: isOpen ? "translateY(-4px) rotate(-45deg)" : "translateY(4px)",
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className="overflow-hidden md:hidden"
        style={{
          maxHeight: isOpen ? "300px" : "0px",
          opacity: isOpen ? 1 : 0,
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
        }}
      >
        <ul className="space-y-6 py-6 text-center font-futura text-lg uppercase text-white">
          {MENU_ITEMS.map((item, index) => (
            <li
              key={index}
              style={{
                transform: isOpen ? "translateY(0)" : "translateY(-10px)",
                opacity: isOpen ? 1 : 0,
                transition: `transform 0.3s ease ${index * 0.06}s, opacity 0.3s ease ${index * 0.06}s`,
              }}
            >
              <a
                href={`#${item.label}`}
                className={`font-semibold ${activeSection === item.label ? "text-secondary" : "hover:text-secondary"}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import Navbar from "./sections/Navbar";
import Services from "./sections/Services";
import Home from "./sections/Home";

import Portfolio from "./sections/Portfolio";
import Abilities from "./sections/Abilities";
import Contact from "./sections/Contact";
import Games from "./sections/games";
import Footer from "./sections/Footer";
import Certificate from "./sections/Certificate";

createRoot(document.getElementById("root")).render(
  <div className="font-inter">
    <Navbar />
    <main>
      <Home />
      <Services />
      <Portfolio />
      <Abilities />
      <Certificate />
      <hr />
      <Contact />
      <Games />
    </main>
    <Footer />
  </div>,
);

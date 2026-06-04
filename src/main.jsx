import { HashRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
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
  <HashRouter>
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
    </div>
  </HashRouter>,
);

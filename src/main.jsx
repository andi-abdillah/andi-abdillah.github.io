import { HashRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import Navbar from "./sections/Navbar";
import Home from "./sections/Home";
import Services from "./sections/Services";
import Portfolio from "./sections/Portfolio";
import Abilities from "./sections/Abilities";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import Certificate from "./sections/Certificate";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <div className="font-open">
      <Navbar />
      <Home />
      <Services />
      <hr />
      <Portfolio />
      <Abilities />
      <Certificate />
      <hr />
      <Contact />
      <Footer />
    </div>
  </HashRouter>,
);

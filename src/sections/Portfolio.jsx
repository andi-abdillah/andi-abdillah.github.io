import { useState } from "react";
import Data from "../data/portfolioData.json";
import Modal from "../components/Modal";

const images = import.meta.glob("../assets/portfolio/*", { eager: true });

const Portfolio = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLinkClick = (link) => {
    if (!link) {
      setIsModalOpen(true);
    } else {
      window.open(link, "_blank");
    }
  };

  return (
    <section id="portfolio" className="mx-auto max-w-screen-2xl px-8 py-24">
      <h1 className="mb-16 text-center text-2xl font-semibold text-gray-400">
        A Lovely Selection of Work
      </h1>
      <div className="flex flex-col space-y-24">
        {Data.map((item, index) => (
          <div
            className="mx-auto flex flex-col justify-evenly gap-5 lg:mx-0 lg:flex-row"
            key={index}
          >
            <div>
              <img
                className="m-auto h-44 md:h-64 lg:h-72"
                src={images[`../assets/portfolio/${item.image}`]?.default || ""}
                alt={item.name}
              />
            </div>
            <div className="my-auto max-w-md space-y-5 text-center lg:text-start">
              <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-start">
                <h3 className="text-xl font-bold md:text-2xl">{item.name}</h3>
                <span className="my-auto h-max w-max rounded-lg bg-primary px-2 text-sm text-white">
                  {item.year}
                </span>
              </div>
              <p className="font-medium opacity-40 md:text-lg">
                {item.description}
              </p>
              <div>
                <button
                  onClick={() => handleLinkClick(item.link)}
                  className="rounded-full border border-primary px-7 py-3 text-primary hover:bg-primary hover:text-white"
                >
                  View Site
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
      >
        <div className="p-4">
          <h2 className="text-center text-xl font-semibold text-red-600">
            This web app is still in development and running on a localhost.
          </h2>
          <p className="mt-4 text-center">
            The website you’re trying to view is currently under development and
            can only be accessed locally.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-full bg-primary px-7 py-3 font-semibold text-white hover:bg-primary/80"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Portfolio;

import { IoMdArrowForward } from "react-icons/io";
import Data from "../data/certificatesData.json";

const images = import.meta.glob("../assets/certificates/*", { eager: true });

const Certificate = () => {
  return (
    <section id="certificates" className="px-8 py-24">
      <h1 className="text-center text-2xl font-semibold text-gray-400">
        Licenses & Certifications
      </h1>
      <div className="mx-auto mt-20 grid max-w-lg gap-x-16 gap-y-10 lg:max-w-screen-lg lg:grid-cols-2 lg:px-32">
        {Data.map((item, index) => (
          <div className="flex gap-4" key={index}>
            <img
              className="h-10 w-10"
              src={images[`../assets/certificates/${item.logo}`]?.default || ""}
              alt={item.name}
            />
            <div>
              <h4 className="font-semibold text-gray-800">{item.name}</h4>
              <p className="font-light text-gray-600">{item.organization}</p>
              <div className="mt-4">
                <a href={item.url} target="_blank">
                  <button className="flex items-center gap-1 rounded-full border border-primary px-7 py-1.5 text-primary hover:bg-primary hover:text-white">
                    Show Credentials <IoMdArrowForward />
                  </button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certificate;

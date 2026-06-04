import { IoMdArrowForward } from "react-icons/io";
import Data from "../data/certificatesData.json";

const images = import.meta.glob("../assets/certificates/*", { eager: true });

const Certificate = () => {
  return (
    <section id="certificates" className="px-8 py-24">
      <h2 className="text-center font-futura text-5xl font-extrabold uppercase leading-tight [color:#363636]">
        Licenses & Certifications
      </h2>
      <div className="mx-auto mt-20 grid max-w-lg gap-x-16 gap-y-10 lg:max-w-screen-lg lg:grid-cols-2 lg:px-32">
        {Data.map((item) => (
          <div className="flex gap-4" key={item.name}>
            <img
              className="mt-1 h-10 w-10"
              src={images[`../assets/certificates/${item.logo}`]?.default || ""}
              alt={item.name}
            />
            <div className="flex flex-col">
              <div className="flex-1">
                <h4 className="font-futura font-bold uppercase text-gray-800">{item.name}</h4>
                <p className="font-light text-gray-600">{item.organization}</p>
              </div>
              <div className="mt-4">
                <a href={item.url} target="_blank" rel="noreferrer">
                  <button className="flex items-center gap-1 rounded-full border border-primary px-7 py-2 font-futura leading-none uppercase text-primary hover:bg-primary hover:text-white">
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

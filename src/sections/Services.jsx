import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { CgWebsite } from "react-icons/cg";
import { MdCameraFront } from "react-icons/md";
import { BsPersonBadge } from "react-icons/bs";
import { RiReactjsLine } from "react-icons/ri";
import { SiLaravel } from "react-icons/si";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 740 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 740, min: 0 },
    items: 1,
  },
};

const data = [
  {
    title: "design + development",
    icon: CgWebsite,
    description: "Clean website, modern designs - optimized for performance.",
  },
  {
    title: "mobile friendly",
    icon: MdCameraFront,
    description:
      "A responsive design makes your website accessible to all users, regardless of their device.",
  },
  {
    title: "build your personal website",
    icon: BsPersonBadge,
    description:
      "Personal website can helping you market your skills and talents and in building your career.",
  },
  {
    title: "React JS Development",
    icon: RiReactjsLine,
    description:
      "React JS is renowned for its extensibility, adjustability, and convenience.",
  },
  {
    title: "Laravel Development",
    icon: SiLaravel,
    description:
      "Laravel is a powerful PHP framework known for its elegant syntax, scalability, and performance.",
  },
];

const Services = () => {
  return (
    <section id="services" className="mx-auto max-w-screen-2xl py-24">
      <h1 className="text-center text-2xl font-semibold text-gray-400">
        Services
      </h1>
      <Carousel
        className="mt-24"
        responsive={responsive}
        swipeable
        infinite
        autoPlay
        autoPlaySpeed={5000}
        removeArrowOnDeviceType={["mobile"]}
      >
        {data.map((item, index) => (
          <div className="mx-5 space-y-4 px-8 text-center" key={index}>
            <item.icon className="mx-auto text-7xl text-primary" />
            <h3 className="font-semibold uppercase text-primary">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default Services;

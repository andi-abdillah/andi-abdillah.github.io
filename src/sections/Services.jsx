import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { CgWebsite } from "react-icons/cg";
import { MdCameraFront } from "react-icons/md";
import { BsPersonBadge } from "react-icons/bs";
import { RiNextjsFill } from "react-icons/ri";
import { IoLogoLaravel } from "react-icons/io5";

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
    title: "Design & Development",
    icon: CgWebsite,
    description:
      "I build modern, fast-loading websites with clean UI and clean code — optimized for SEO and performance.",
  },
  {
    title: "Mobile-First Design",
    icon: MdCameraFront,
    description:
      "Your website will look and function perfectly on all devices — responsive from the start.",
  },
  {
    title: "Personal Branding Website",
    icon: BsPersonBadge,
    description:
      "A custom personal website that elevates your brand, showcases your skills, and builds online credibility.",
  },
  {
    title: "Next.js Development",
    icon: RiNextjsFill,
    description:
      "Build fast, SEO-friendly, and scalable web applications using the power of Next.js and modern web standards.",
  },
  {
    title: "Laravel Back-End Solutions",
    icon: IoLogoLaravel,
    description:
      "Powerful, secure APIs and backend logic using Laravel — perfect for dashboards, auth systems, and data apps.",
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

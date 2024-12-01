import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { LuCopyright } from "react-icons/lu";

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/amin-abdillah-099225208/",
    icon: <FaLinkedinIn />,
  },
  {
    href: "mailto:aminabdillah.id@gmail.com?subject=Mail from our Website",
    icon: <HiOutlineMail />,
  },
  {
    href: "https://github.com/andi-abdillah",
    icon: <FaGithub />,
  },
];

const Footer = () => {
  return (
    <div className="bg-primary px-8 pb-2 pt-10">
      <div className="flex w-full justify-center gap-6 text-gray-600">
        {socialLinks.map((link, index) => (
          <a key={index} href={link.href} target="_blank" rel="noreferrer">
            <div className="cursor-pointer rounded-full p-3 text-lg text-white ring ring-2 ring-inset ring-white hover:bg-white hover:text-primary">
              {link.icon}
            </div>
          </a>
        ))}
      </div>
      <div className="my-6">
        <h3 className="flex items-center justify-center gap-1 whitespace-nowrap text-center text-sm font-medium text-white sm:text-lg">
          Handcrafted by me{" "}
          <span className="text-xl">
            <LuCopyright />
          </span>{" "}
          amin_abdillah
        </h3>
      </div>
    </div>
  );
};

export default Footer;

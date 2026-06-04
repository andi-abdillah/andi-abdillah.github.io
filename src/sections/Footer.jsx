import { LuCopyright } from "react-icons/lu";
import socialLinks from "../data/socialLinks";

const Footer = () => {
  return (
    <footer className="bg-[#0d0d0d] px-8 pb-2 pt-6">
      <div className="flex w-full justify-center gap-6 text-gray-600">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
            <div className="cursor-pointer rounded-full p-3 text-lg text-white ring ring-2 ring-inset ring-white hover:bg-white hover:text-primary">
              {link.icon}
            </div>
          </a>
        ))}
      </div>
      <div className="my-6">
        <p className="flex items-center justify-center gap-1 whitespace-nowrap text-center text-sm font-medium text-white sm:text-lg">
          Handcrafted by me{" "}
          <span className="text-xl">
            <LuCopyright />
          </span>{" "}
          amin_abdillah
        </p>
      </div>
    </footer>
  );
};

export default Footer;

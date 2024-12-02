import { TbBrandHtml5 } from "react-icons/tb";
import { TbBrandGithub } from "react-icons/tb";

const Abilities = () => {
  const skills = [
    "HTML",
    "CSS",
    "SASS / SCSS",
    "Bootstrap",
    "Tailwind CSS",
    "JavaScript",
    "React JS",
    "PHP",
    "Laravel",
    "Inertia JS",
    "MySQL",
    "Cloud Computing",
    "Scrum",
  ];

  const devTools = [
    "VSCode",
    "Git",
    "GitHub",
    "Atlassian / Jira",
    "Google Cloud Platform",
    "Terminal",
  ];

  return (
    <section id="abilities" className="bg-primary px-2 py-24">
      <h1 className="mb-16 text-center text-3xl font-semibold text-gray-300">
        Abilities
      </h1>
      <div className="mx-auto flex max-w-xl justify-evenly rounded-xl bg-white shadow-xl">
        <div className="w-1/2 p-10 text-center">
          <TbBrandHtml5 className="mx-auto text-7xl text-primary" />
          <h1 className="my-3 text-2xl font-semibold">Skills</h1>
          <ul className="space-y-2 text-gray-500">
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>

        <div className="w-px bg-black opacity-15" />

        <div className="w-1/2 p-10 text-center">
          <TbBrandGithub className="mx-auto text-7xl text-primary" />
          <h1 className="my-3 text-2xl font-semibold">Dev Tools</h1>
          <ul className="space-y-2 text-gray-500">
            {devTools.map((tool, index) => (
              <li key={index}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Abilities;

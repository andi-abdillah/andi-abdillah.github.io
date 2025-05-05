import { TbBrandHtml5, TbServer, TbBrandGithub, TbCloud } from "react-icons/tb";

const SkillCard = ({ title, items, icon }) => (
  <div className="group relative h-full w-full">
    <div className="absolute inset-0 rounded-3xl bg-black/20 shadow-xl transition duration-300 ease-in-out group-hover:rotate-[-5deg]" />

    <div className="relative h-full rounded-3xl bg-white p-6 text-center transition duration-300 ease-in-out group-hover:rotate-[5deg]">
      <div className="mb-4 flex justify-center text-6xl text-primary">
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <ul className="space-y-1 text-gray-500">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  </div>
);

const Abilities = () => {
  const frontendSkills = [
    "HTML",
    "CSS",
    "Sass / SCSS",
    "Bootstrap",
    "Tailwind CSS",
    "JavaScript",
    "TypeScript",
    "React.js",
    "Inertia.js",
    "Next.js",
  ];

  const backendSkills = [
    "PHP",
    "Laravel",
    "Express.js",
    "Hapi.js",
    "Sequelize",
    "Prisma",
    "MySQL",
  ];

  const devTools = [
    "VSCode",
    "Git",
    "GitHub",
    "Atlassian (Jira)",
    "Google Cloud Platform",
    "Terminal",
  ];

  const otherSkills = ["Cloud Computing", "Scrum"];

  return (
    <section id="abilities" className="bg-primary px-10 py-24">
      <h1 className="mb-16 text-center text-3xl font-semibold text-gray-300">
        Abilities
      </h1>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <SkillCard
          title="Frontend"
          items={frontendSkills}
          icon={<TbBrandHtml5 />}
        />
        <SkillCard title="Backend" items={backendSkills} icon={<TbServer />} />
        <SkillCard
          title="Dev Tools"
          items={devTools}
          icon={<TbBrandGithub />}
        />
        <SkillCard title="Other" items={otherSkills} icon={<TbCloud />} />
      </div>
    </section>
  );
};

export default Abilities;

export type Job = {
  id: number;
  title: string;
  company: string;
  loc: string;
  type: string;
  region: "United States" | "Canada" | "United Kingdom" | "Remote";
  spons: boolean;
  skills: string[];
  posted: string;
  applied: number;
  description?: string;
  initials?: string;
};

const companies = [
  "Acme Labs",
  "Northwind",
  "Lumen",
  "Vela",
  "Quanta AI",
  "Beacon",
  "Forge",
  "Halcyon",
  "Atlas",
  "Synthesis",
  "Nebula Systems",
  "Aperture",
  "Nimbus",
  "Vertex",
  "Pioneer Tech",
];

const roles = [
  "Software Engineer Intern",
  "Frontend Intern",
  "Backend Intern",
  "Mobile Intern",
  "Data Engineer Intern",
  "Data Scientist Intern",
  "ML Intern",
  "Embedded Systems Intern",
  "Network Engineering Intern",
  "DevOps Intern",
  "QA Intern",
  "Product Analyst New Grad",
  "Business Analyst Intern",
  "Technical Program Management Intern",
  "Site Reliability Intern",
];

const coopRoles = [
  "Software Engineer Co-op",
  "Frontend Co-op",
  "Backend Co-op",
  "Data Engineer Co-op",
  "ML Co-op",
];

const skillsPool = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "SQL",
  "NoSQL",
  "Git",
  "Docker",
  "Kubernetes",
  "TensorFlow",
  "PyTorch",
  "C",
  "C++",
  "Embedded C",
  "Networking",
  "Bash",
  "AWS",
  "GCP",
  "Linux",
  "Rust",
];

const regions: Job["region"][] = ["United States", "Canada", "United Kingdom", "Remote"];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const jobs: Job[] = Array.from({ length: 60 }, (_, i) => {
  const company = pick(companies);
  const title = i < coopRoles.length ? coopRoles[i] : pick(roles);
  const region = pick(regions);
  const type = title.includes("New Grad") ? "New Grad" : title.includes("Co-op") ? "Co-op" : title.includes("Intern") ? "Internship" : "Internship";
  const spons = Math.random() > 0.45;
  const skillCount = 3 + Math.floor(Math.random() * 4);
  const skills = Array.from({ length: skillCount }, () => pick(skillsPool)).filter((v, idx, arr) => arr.indexOf(v) === idx);
  const loc = region === "Remote" ? "Remote" : (region === "United States" ? pick(["San Francisco, US","New York, US","Seattle, US","Austin, US"]) : region === "Canada" ? pick(["Toronto, CA","Vancouver, CA","Waterloo, CA"]) : pick(["London, UK","Manchester, UK"]));
  return {
    id: i + 1,
    title,
    company,
    loc,
    type,
    region,
    spons,
    skills,
    posted: `${1 + Math.floor(Math.random() * 72)}h ago`,
    applied: Math.floor(Math.random() * 200),
    description: `This is a ${title} at ${company}. Skills: ${skills.join(", ")}`,
    initials: initials(company),
  };
});

export default jobs;

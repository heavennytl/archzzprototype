import type { InfoKey, InfoPageContent, Model, ModelType } from "./types";

export const models: Model[] = [
  { id: 1, title: "Lunaro Modular Sofa", type: "3ds Max", category: "Sofas", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2021", renderer: "Corona", size: "286 MB" },
  { id: 2, title: "Noma Lounge Chair", type: "SketchUp", category: "Chairs", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2020", size: "42 MB" },
  { id: 3, title: "Aster Pendant Light", type: "3ds Max", category: "Lighting", image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2022", renderer: "V-Ray", size: "68 MB" },
  { id: 4, title: "Olive Tree No. 08", type: "3ds Max", category: "Plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2020", renderer: "Corona", size: "214 MB" },
  { id: 5, title: "Courtyard House 27", type: "SketchUp", category: "Architecture", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2021", size: "119 MB" },
  { id: 6, title: "Solace Dining Collection", type: "3ds Max", category: "Dining", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, free: true, version: "2021", renderer: "Corona", size: "175 MB" },
  { id: 7, title: "Kanso Platform Bed", type: "SketchUp", category: "Beds", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, free: true, version: "2019", size: "34 MB" },
  { id: 8, title: "Milo Travertine Table", type: "3ds Max", category: "Tables", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2020", renderer: "V-Ray", size: "96 MB" },
  { id: 9, title: "Minimal Kitchen System", type: "SketchUp", category: "Kitchens", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, free: true, version: "2021", size: "71 MB" },
  { id: 10, title: "Atelier Workspace Set", type: "3ds Max", category: "Office", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2022", renderer: "Corona", size: "302 MB" },
  { id: 11, title: "Mediterranean Arch Set", type: "SketchUp", category: "Architecture", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, version: "2020", size: "88 MB" },
  { id: 12, title: "Botanical Planter Series", type: "3ds Max", category: "Plants", image: "https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&w=1200&q=88", available: true, qualityChecked: true, free: true, version: "2021", renderer: "Corona", size: "127 MB" },
];

export const collections = [
  { title: "Warm Minimalism", count: 184, image: models[0].image },
  { title: "Architectural Essentials", count: 96, image: models[4].image },
  { title: "Quiet Workspaces", count: 132, image: models[9].image },
  { title: "Natural Living", count: 208, image: models[3].image },
];

const qualityCheckedModels = models.filter((model) => model.available && model.qualityChecked);
export const todayFreeModels: Model[] = Array.from({ length: 40 }, (_, index) => {
  const type: ModelType = index < 20 ? "SketchUp" : "3ds Max";
  const matching = qualityCheckedModels.filter((model) => model.type === type);
  const source = matching[index % matching.length];
  return { ...source, id: 100 + index, free: true, title: `${source.title} ${String(index + 1).padStart(2, "0")}` };
});

export const catalog = [...models, ...todayFreeModels];

export const infoPages: Record<InfoKey, InfoPageContent> = {
  about: { eyebrow: "COMPANY INFO", title: "About ARCHZZ", body: ["ARCHZZ provides production-ready 3D assets for architecture, interiors and landscape design, with clear compatibility and file details."] },
  license: { eyebrow: "COPYRIGHT & LICENSING", title: "Asset License Agreement", body: ["Use purchased assets in personal and commercial projects, but do not redistribute or resell the source files."] },
  dmca: { eyebrow: "COPYRIGHT & LICENSING", title: "DMCA Policy", body: ["Rights holders can ask Customer Service to review an asset by providing the protected work, affected asset and contact details."] },
  service: { eyebrow: "HELP", title: "Customer Service", body: ["Get help with accounts, purchases, subscriptions and files; include the model name and software version when reporting an issue."] },
  terms: { eyebrow: "LEGAL", title: "Terms of Use", body: ["Use ARCHZZ and its assets in accordance with applicable law and the license attached to each model."] },
  privacy: { eyebrow: "LEGAL", title: "Privacy Policy", body: ["ARCHZZ uses account and service information to operate, support and protect the marketplace."] },
  cookies: { eyebrow: "LEGAL", title: "Cookies", body: ["Cookies maintain sign-in, remember essential preferences and help us understand service performance."] },
};

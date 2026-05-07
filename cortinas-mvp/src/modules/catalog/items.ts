export type CatalogItem = {
  id: string;
  name: string;
  kind: "tela" | "cortina";
  tags: string[];
  imageSrc: string;
  description: string;
};

export const catalogItems: CatalogItem[] = [
  {
    id: "fabric-01",
    name: "Lino Teal",
    kind: "tela",
    tags: ["lino", "textura", "living"],
    imageSrc: "/catalog/fabric-01.svg",
    description: "Textura tipo lino premium. Ideal para ambientes cálidos y modernos.",
  },
  {
    id: "fabric-02",
    name: "Arena Dorada",
    kind: "tela",
    tags: ["blackout", "arena", "dormitorio"],
    imageSrc: "/catalog/fabric-02.svg",
    description: "Tono arena con presencia. Buen balance entre calidez y luminosidad.",
  },
  {
    id: "fabric-03",
    name: "Azul Niebla",
    kind: "tela",
    tags: ["screen", "azul", "oficina"],
    imageSrc: "/catalog/fabric-03.svg",
    description: "Look fresco y contemporáneo. Perfecta para rollers screen.",
  },
  {
    id: "fabric-04",
    name: "Grafito",
    kind: "tela",
    tags: ["minimal", "oscuro", "cine"],
    imageSrc: "/catalog/fabric-04.svg",
    description: "Oscura y elegante. Recomendada para blackout o espacios de proyección.",
  },
  {
    id: "fabric-05",
    name: "Berlín Magenta",
    kind: "tela",
    tags: ["color", "diseño", "acento"],
    imageSrc: "/catalog/fabric-05.svg",
    description: "Acento vibrante para proyectos con identidad y contraste.",
  },
  {
    id: "fabric-06",
    name: "Verde Salvia",
    kind: "tela",
    tags: ["natural", "verde", "cocina"],
    imageSrc: "/catalog/fabric-06.svg",
    description: "Tono natural muy en tendencia. Va perfecto con madera y blancos.",
  },
  {
    id: "curtain-01",
    name: "Roller Gris Humo",
    kind: "cortina",
    tags: ["roller", "minimal", "living"],
    imageSrc: "/catalog/curtain-01.svg",
    description: "Roller moderno con caída prolija. Estética premium y atemporal.",
  },
  {
    id: "curtain-02",
    name: "Tradicional Crema",
    kind: "cortina",
    tags: ["tradicional", "ondas", "dormitorio"],
    imageSrc: "/catalog/curtain-02.svg",
    description: "Cortina tradicional con ondas suaves. Calidez y elegancia.",
  },
  {
    id: "curtain-03",
    name: "Roller Azul Profundo",
    kind: "cortina",
    tags: ["roller", "screen", "oficina"],
    imageSrc: "/catalog/curtain-03.svg",
    description: "Roller con textura y líneas sutiles. Moderno y profesional.",
  },
  {
    id: "curtain-04",
    name: "Visillo Premium",
    kind: "cortina",
    tags: ["visillo", "luz", "living"],
    imageSrc: "/catalog/curtain-04.svg",
    description: "Translucidez controlada para iluminar sin perder privacidad.",
  },
  {
    id: "curtain-05",
    name: "Blackout Grafito",
    kind: "cortina",
    tags: ["blackout", "roller", "cine"],
    imageSrc: "/catalog/curtain-05.svg",
    description: "Blackout para máxima oscuridad. Ideal para dormir o sala de TV.",
  },
  {
    id: "curtain-06",
    name: "Tradicional Verde",
    kind: "cortina",
    tags: ["tradicional", "natural", "diseño"],
    imageSrc: "/catalog/curtain-06.svg",
    description: "Cortina tradicional con personalidad. Aporta color con suavidad.",
  },
];


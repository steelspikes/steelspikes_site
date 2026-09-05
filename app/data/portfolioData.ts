// PORTFOLIO DATA — Edit this file to update all content on the landing page.

export interface Skill {
  id: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  impact: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string | null;
}

export interface Album {
  id: string;
  title: string;
  year: string;
  genres: string[];
  gradientFrom: string;
  gradientTo: string;
  platformUrl: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  facebook: string;
  instagram: string;
  youtube: string;
  bandcamp: string;
  spotify: string;
  email: string;
}

export interface PersonalInfo {
  name: string;
  role: string;
  heroSubtitle: string;
  cvUrl: string;
  musicIntro: string;
}

export const skillsData: Skill[] = [
  {
    id: 'backend',
    icon: 'Server',
    title: 'Backend Development',
    description: 'Diseño y construyo APIs robustas, escalables y de alto rendimiento.',
    tags: ['Node.js', 'Go', 'Python', 'PostgreSQL', 'Redis', 'REST', 'gRPC'],
  },
  {
    id: 'blockchain',
    icon: 'Link2',
    title: 'Blockchain / Web3',
    description: 'Smart contracts, protocolos DeFi y arquitecturas descentralizadas.',
    tags: ['Solidity', 'Ethereum', 'Hardhat', 'ethers.js', 'IPFS', 'EVM'],
  },
  {
    id: 'architecture',
    icon: 'Layers',
    title: 'Arquitectura de Sistemas',
    description: 'Diseño de sistemas distribuidos, event-driven y microservicios.',
    tags: ['Microservices', 'Kafka', 'RabbitMQ', 'DDD', 'CQRS', 'Event Sourcing'],
  },
  {
    id: 'devops',
    icon: 'Terminal',
    title: 'Herramientas / DevOps',
    description: 'Infraestructura como código, CI/CD y orquestación de contenedores.',
    tags: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'AWS', 'Linux'],
  },
];

export const experienceData: Experience[] = [
  {
    id: 'exp1',
    company: 'Blockchain Startup — Nombre de Empresa',
    role: 'Senior Backend Engineer',
    period: 'Ene 2024 – Presente',
    impact: 'Rediseñé la capa de indexación on-chain reduciendo la latencia de consultas en un 60%.',
  },
  {
    id: 'exp2',
    company: 'Fintech Corp — Nombre de Empresa',
    role: 'Backend Engineer',
    period: 'Mar 2022 – Dic 2023',
    impact: 'Migré un monolito a microservicios procesando 2M+ transacciones/día sin downtime.',
  },
  {
    id: 'exp3',
    company: 'Agencia Digital — Nombre de Empresa',
    role: 'Fullstack Developer',
    period: 'Jun 2020 – Feb 2022',
    impact: 'Desarrollé integraciones de pago y dashboards para clientes con 50k+ usuarios activos.',
  },
];

export const projectsData: Project[] = [
  {
    id: 'proj1',
    title: 'ChainVault Protocol',
    description: 'Protocolo DeFi de custodia multi-firma con timelock configurable y auditoría on-chain completa.',
    tags: ['Solidity', 'Hardhat', 'ethers.js', 'React'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
  },
  {
    id: 'proj2',
    title: 'StreamSync API',
    description: 'Gateway de eventos en tiempo real para pipelines de datos IoT con soporte para 10k conexiones concurrentes.',
    tags: ['Go', 'Kafka', 'WebSocket', 'Docker', 'k8s'],
    githubUrl: 'https://github.com',
    liveUrl: null,
  },
  {
    id: 'proj3',
    title: 'NodeGraph ORM',
    description: 'ORM ligero para bases de datos de grafos con sintaxis fluida en TypeScript y soporte para Neo4j.',
    tags: ['TypeScript', 'Neo4j', 'Node.js'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
  },
  {
    id: 'proj4',
    title: 'TxTracer CLI',
    description: 'Herramienta de línea de comandos para trazar y visualizar transacciones EVM con análisis de gas.',
    tags: ['Go', 'Ethereum', 'JSON-RPC', 'CLI'],
    githubUrl: 'https://github.com',
    liveUrl: null,
  },
];

export const albumsData: Album[] = [
  {
    id: 'alb1',
    title: 'Latency',
    year: '2024',
    genres: ['Synthwave', 'Ambient'],
    gradientFrom: '#1e3a5f',
    gradientTo: '#0e7490',
    platformUrl: 'https://open.spotify.com',
  },
  {
    id: 'alb2',
    title: 'Zero Confirmation',
    year: '2023',
    genres: ['Techno', 'Industrial'],
    gradientFrom: '#5c3a1e',
    gradientTo: '#a66a38',
    platformUrl: 'https://open.spotify.com',
  },
  {
    id: 'alb3',
    title: 'Mainnet Drift',
    year: '2023',
    genres: ['Lo-Fi', 'Chillwave'],
    gradientFrom: '#064e3b',
    gradientTo: '#0f766e',
    platformUrl: 'https://open.spotify.com',
  },
  {
    id: 'alb4',
    title: 'Genesis Block',
    year: '2022',
    genres: ['Progressive', 'Ambient'],
    gradientFrom: '#1e1b4b',
    gradientTo: '#3730a3',
    platformUrl: 'https://open.spotify.com',
  },
];

export const socialLinks: SocialLinks = {
  linkedin: 'https://linkedin.com',
  github: 'https://github.com',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  bandcamp: 'https://bandcamp.com',
  spotify: 'https://open.spotify.com',
  email: 'tu@correo.com',
};

export const personalInfo: PersonalInfo = {
  name: 'Tu Nombre',
  role: 'Software Engineer & Sound Explorer',
  heroSubtitle:
    'Construyo sistemas backend robustos y protocolos blockchain que escalan. Fuera del código, produzco música electrónica como forma de pensar en sistemas desde otra frecuencia.',
  cvUrl: '/cv.pdf',
  musicIntro:
    'La música es el otro lenguaje con el que pienso en sistemas. Cada álbum es un experimento de arquitectura sonora — patrones, ritmo, tensión y resolución.',
};

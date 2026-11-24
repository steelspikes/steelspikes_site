// PORTFOLIO DATA — Edit this file to update all content on the landing page.

export interface Album {
  id: string;
  title: string;
  year: string;
  genres: string[];
  gradientFrom: string;
  gradientTo: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
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

export const albumsData: Album[] = [
  {
    id: 'alb1',
    title: 'Latency',
    year: '2024',
    genres: ['Synthwave', 'Ambient'],
    gradientFrom: '#1e3a5f',
    gradientTo: '#0e7490',
    spotifyUrl: 'https://open.spotify.com',
  },
  {
    id: 'alb2',
    title: 'Zero Confirmation',
    year: '2023',
    genres: ['Techno', 'Industrial'],
    gradientFrom: '#5c3a1e',
    gradientTo: '#a66a38',
    spotifyUrl: 'https://open.spotify.com',
  },
  {
    id: 'alb3',
    title: 'Mainnet Drift',
    year: '2023',
    genres: ['Lo-Fi', 'Chillwave'],
    gradientFrom: '#064e3b',
    gradientTo: '#0f766e',
    spotifyUrl: 'https://open.spotify.com',
  },
  {
    id: 'alb4',
    title: 'Genesis Block',
    year: '2022',
    genres: ['Progressive', 'Ambient'],
    gradientFrom: '#1e1b4b',
    gradientTo: '#3730a3',
    spotifyUrl: 'https://open.spotify.com',
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
  email: 'you@email.com',
};

export const personalInfo: PersonalInfo = {
  name: 'Your Name',
  role: 'Software Engineer & Sound Explorer',
  heroSubtitle:
    'I build robust backend systems and blockchain protocols that scale. Outside of code, I produce electronic music as a way of thinking about systems from another frequency.',
  cvUrl: '/cv.pdf',
  musicIntro:
    'Music is the other language I use to think about systems. Every album is an experiment in sonic architecture — patterns, rhythm, tension and resolution.',
};

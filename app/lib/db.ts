import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface DBAlbum {
  id: number;
  title: string;
  imageUrl: string;
  genres: string; // stored as JSON string array e.g. ["Synthwave", "Ambient"]
  releaseDate: string;
  platformUrl: string;
  createdAt: string;
}

export interface DBProfile {
  id: number;
  name: string;
  role: string;
  heroSubtitle: string;
  avatarUrl: string;
  cvUrl: string;
  musicIntro: string;
  socialLinks: string; // JSON string
}

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'disks.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    genres TEXT NOT NULL,
    releaseDate TEXT NOT NULL,
    platformUrl TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    heroSubtitle TEXT NOT NULL,
    avatarUrl TEXT DEFAULT '',
    cvUrl TEXT DEFAULT '',
    musicIntro TEXT DEFAULT '',
    socialLinks TEXT NOT NULL
  );
`);

// Seed default albums if empty
const countResult = db.prepare('SELECT COUNT(*) as count FROM albums').get() as { count: number };
if (countResult.count === 0) {
  const seedStmt = db.prepare(`
    INSERT INTO albums (title, imageUrl, genres, releaseDate, platformUrl)
    VALUES (?, ?, ?, ?, ?)
  `);

  seedStmt.run(
    'Latency',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Synthwave', 'Ambient']),
    '2024',
    'https://open.spotify.com'
  );
  seedStmt.run(
    'Zero Confirmation',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Techno', 'Industrial']),
    '2023',
    'https://open.spotify.com'
  );
  seedStmt.run(
    'Mainnet Drift',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Lo-Fi', 'Chillwave']),
    '2023',
    'https://open.spotify.com'
  );
  seedStmt.run(
    'Genesis Block',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Progressive', 'Ambient']),
    '2022',
    'https://open.spotify.com'
  );
}

// Seed default profile if empty
const profileCount = db.prepare('SELECT COUNT(*) as count FROM profile').get() as { count: number };
if (profileCount.count === 0) {
  const seedProfile = db.prepare(`
    INSERT INTO profile (id, name, role, heroSubtitle, avatarUrl, cvUrl, musicIntro, socialLinks)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `);
  seedProfile.run(
    'Tu Nombre',
    'Software Engineer & Sound Explorer',
    'Construyo sistemas backend robustos y protocolos blockchain que escalan. Fuera del código, produzco música electrónica como forma de pensar en sistemas desde otra frecuencia.',
    '',
    '/cv.pdf',
    'La música es el otro lenguaje con el que pienso en sistemas. Cada álbum es un experimento de arquitectura sonora — patrones, ritmo, tensión y resolución.',
    JSON.stringify({
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      bandcamp: 'https://bandcamp.com',
      spotify: 'https://open.spotify.com',
      email: 'tu@correo.com',
    })
  );
}

export function getAllAlbums(): DBAlbum[] {
  const stmt = db.prepare('SELECT * FROM albums ORDER BY id DESC');
  return stmt.all() as DBAlbum[];
}

export function insertAlbum(data: {
  title: string;
  imageUrl: string;
  genres: string[];
  releaseDate: string;
  platformUrl?: string;
}): DBAlbum {
  const stmt = db.prepare(`
    INSERT INTO albums (title, imageUrl, genres, releaseDate, platformUrl)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.imageUrl,
    JSON.stringify(data.genres),
    data.releaseDate,
    data.platformUrl || ''
  );

  const newId = Number(result.lastInsertRowid);
  const getStmt = db.prepare('SELECT * FROM albums WHERE id = ?');
  return getStmt.get(newId) as DBAlbum;
}

export function deleteAlbum(id: number): void {
  const stmt = db.prepare('DELETE FROM albums WHERE id = ?');
  stmt.run(id);
}

export function updateAlbum(
  id: number,
  data: {
    title: string;
    imageUrl: string;
    genres: string[];
    releaseDate: string;
    platformUrl?: string;
  }
): DBAlbum {
  const stmt = db.prepare(`
    UPDATE albums
    SET title = ?, imageUrl = ?, genres = ?, releaseDate = ?, platformUrl = ?
    WHERE id = ?
  `);
  stmt.run(
    data.title,
    data.imageUrl,
    JSON.stringify(data.genres),
    data.releaseDate,
    data.platformUrl || '',
    id
  );

  const getStmt = db.prepare('SELECT * FROM albums WHERE id = ?');
  return getStmt.get(id) as DBAlbum;
}

export function getProfile(): DBProfile {
  const stmt = db.prepare('SELECT * FROM profile WHERE id = 1');
  return stmt.get() as DBProfile;
}

export function updateProfile(data: {
  name: string;
  role: string;
  heroSubtitle: string;
  avatarUrl?: string;
  cvUrl?: string;
  musicIntro?: string;
  socialLinks: Record<string, string>;
}): DBProfile {
  const stmt = db.prepare(`
    UPDATE profile
    SET name = ?, role = ?, heroSubtitle = ?, avatarUrl = ?, cvUrl = ?, musicIntro = ?, socialLinks = ?
    WHERE id = 1
  `);
  stmt.run(
    data.name,
    data.role,
    data.heroSubtitle,
    data.avatarUrl || '',
    data.cvUrl || '',
    data.musicIntro || '',
    JSON.stringify(data.socialLinks)
  );
  return getProfile();
}

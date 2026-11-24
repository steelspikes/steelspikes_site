import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { SECTION_DEFAULTS } from '@/app/lib/sectionTexts';

export interface DBAlbum {
  id: number;
  title: string;
  imageUrl: string;
  genres: string; // stored as JSON string array e.g. ["Synthwave", "Ambient"]
  releaseDate: string;
  spotifyUrl: string;
  bandcampUrl: string;
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

// Was the skill_groups table already there? (seed defaults only on first creation)
const skillGroupsExisted = !!db
  .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'skill_groups'")
  .get();

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

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL DEFAULT '',
    current INTEGER NOT NULL DEFAULT 0,
    modality TEXT NOT NULL DEFAULT 'On-site',
    description TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL DEFAULT '',
    current INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issueDate TEXT NOT NULL,
    expirationDate TEXT NOT NULL DEFAULT '',
    credentialUrl TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS skill_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL DEFAULT 'Server',
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '[]',
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    githubUrl TEXT NOT NULL DEFAULT '',
    liveUrl TEXT NOT NULL DEFAULT '',
    imageUrl TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS section_texts (
    key TEXT PRIMARY KEY,
    subtitle TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    passwordHash TEXT NOT NULL,
    tokenSecret TEXT NOT NULL,
    tokenVersion INTEGER NOT NULL DEFAULT 1
  );
`);

// Seed default admin (password "admin") if empty. Change it from the admin dashboard.
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get() as { count: number };
if (adminCount.count === 0) {
  db.prepare('INSERT INTO admin (id, passwordHash, tokenSecret) VALUES (1, ?, ?)').run(
    bcrypt.hashSync('admin', 10),
    crypto.randomBytes(32).toString('hex')
  );
}

// Migration: one link per platform (replaces the single legacy `platformUrl`)
const albumCols = (db.prepare('PRAGMA table_info(albums)').all() as { name: string }[]).map((c) => c.name);
if (!albumCols.includes('spotifyUrl')) {
  db.exec("ALTER TABLE albums ADD COLUMN spotifyUrl TEXT DEFAULT ''");
  db.exec("ALTER TABLE albums ADD COLUMN bandcampUrl TEXT DEFAULT ''");
  db.exec("UPDATE albums SET spotifyUrl = platformUrl WHERE platformUrl LIKE '%spotify.com%'");
  db.exec("UPDATE albums SET bandcampUrl = platformUrl WHERE platformUrl LIKE '%bandcamp.com%'");
}

// Seed default albums if empty
const countResult = db.prepare('SELECT COUNT(*) as count FROM albums').get() as { count: number };
if (countResult.count === 0) {
  const seedStmt = db.prepare(`
    INSERT INTO albums (title, imageUrl, genres, releaseDate, spotifyUrl)
    VALUES (?, ?, ?, ?, ?)
  `);

  seedStmt.run(
    'Latency',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Synthwave', 'Ambient']),
    '2024-01-01',
    'https://open.spotify.com'
  );
  seedStmt.run(
    'Zero Confirmation',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Techno', 'Industrial']),
    '2023-01-01',
    'https://open.spotify.com'
  );
  seedStmt.run(
    'Mainnet Drift',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Lo-Fi', 'Chillwave']),
    '2023-01-01',
    'https://open.spotify.com'
  );
  seedStmt.run(
    'Genesis Block',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    JSON.stringify(['Progressive', 'Ambient']),
    '2022-01-01',
    'https://open.spotify.com'
  );
}

// Migration: releaseDate is stored as ISO YYYY-MM-DD (sortable). Convert legacy free-text values.
{
  const rows = db.prepare('SELECT id, releaseDate FROM albums').all() as { id: number; releaseDate: string }[];
  const upd = db.prepare('UPDATE albums SET releaseDate = ? WHERE id = ?');
  const pad = (n: number) => String(n).padStart(2, '0');
  for (const { id, releaseDate } of rows) {
    const v = (releaseDate || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) continue;
    let iso: string | null = null;
    if (/^\d{4}$/.test(v)) iso = `${v}-01-01`;
    else {
      const d = new Date(v);
      if (!isNaN(d.getTime())) iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    if (iso) upd.run(iso, id);
  }
}

// Seed default profile if empty
const profileCount = db.prepare('SELECT COUNT(*) as count FROM profile').get() as { count: number };
if (profileCount.count === 0) {
  const seedProfile = db.prepare(`
    INSERT INTO profile (id, name, role, heroSubtitle, avatarUrl, cvUrl, musicIntro, socialLinks)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `);
  seedProfile.run(
    'Your Name',
    'Software Engineer & Sound Explorer',
    'I build robust backend systems and blockchain protocols that scale. Outside of code, I produce electronic music as a way of thinking about systems from another frequency.',
    '',
    '/cv.pdf',
    'Music is the other language I use to think about systems. Every album is an experiment in sonic architecture — patterns, rhythm, tension and resolution.',
    JSON.stringify({
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      bandcamp: 'https://bandcamp.com',
      spotify: 'https://open.spotify.com',
      email: 'you@email.com',
    })
  );
}

export function getAllAlbums(): DBAlbum[] {
  const stmt = db.prepare('SELECT * FROM albums ORDER BY releaseDate DESC, id DESC');
  return stmt.all() as DBAlbum[];
}

export function insertAlbum(data: {
  title: string;
  imageUrl: string;
  genres: string[];
  releaseDate: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
}): DBAlbum {
  const stmt = db.prepare(`
    INSERT INTO albums (title, imageUrl, genres, releaseDate, spotifyUrl, bandcampUrl)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.imageUrl,
    JSON.stringify(data.genres),
    data.releaseDate,
    data.spotifyUrl || '',
    data.bandcampUrl || ''
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
    spotifyUrl?: string;
    bandcampUrl?: string;
  }
): DBAlbum {
  const stmt = db.prepare(`
    UPDATE albums
    SET title = ?, imageUrl = ?, genres = ?, releaseDate = ?, spotifyUrl = ?, bandcampUrl = ?
    WHERE id = ?
  `);
  stmt.run(
    data.title,
    data.imageUrl,
    JSON.stringify(data.genres),
    data.releaseDate,
    data.spotifyUrl || '',
    data.bandcampUrl || '',
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

export interface DBAdmin {
  passwordHash: string;
  tokenSecret: string;
  tokenVersion: number;
}

export function getAdmin(): DBAdmin {
  return db.prepare('SELECT passwordHash, tokenSecret, tokenVersion FROM admin WHERE id = 1').get() as DBAdmin;
}

/** Stores a new password hash, rotates the token secret and bumps the version (invalidates every existing session). */
export function setAdminPassword(newPassword: string): void {
  db.prepare(
    'UPDATE admin SET passwordHash = ?, tokenSecret = ?, tokenVersion = tokenVersion + 1 WHERE id = 1'
  ).run(bcrypt.hashSync(newPassword, 10), crypto.randomBytes(32).toString('hex'));
}

export interface DBExperience {
  id: number;
  role: string;
  company: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM, '' when current
  current: number; // 0 | 1
  modality: string;
  description: string;
}

export type ExperienceInput = Omit<DBExperience, 'id'>;

export function getAllExperience(): DBExperience[] {
  return db.prepare('SELECT * FROM experience ORDER BY startDate DESC, id DESC').all() as DBExperience[];
}

export function insertExperience(d: ExperienceInput): DBExperience {
  const result = db
    .prepare(
      'INSERT INTO experience (role, company, startDate, endDate, current, modality, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(d.role, d.company, d.startDate, d.endDate, d.current, d.modality, d.description);
  return db.prepare('SELECT * FROM experience WHERE id = ?').get(Number(result.lastInsertRowid)) as DBExperience;
}

export function updateExperience(id: number, d: ExperienceInput): DBExperience {
  db.prepare(
    'UPDATE experience SET role = ?, company = ?, startDate = ?, endDate = ?, current = ?, modality = ?, description = ? WHERE id = ?'
  ).run(d.role, d.company, d.startDate, d.endDate, d.current, d.modality, d.description, id);
  return db.prepare('SELECT * FROM experience WHERE id = ?').get(id) as DBExperience;
}

export function deleteExperience(id: number): void {
  db.prepare('DELETE FROM experience WHERE id = ?').run(id);
}

// ── Education ────────────────────────────────────────────────────────
export interface DBEducation {
  id: number;
  degree: string;
  institution: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM, '' when in progress
  current: number; // 0 | 1
  description: string;
}
export type EducationInput = Omit<DBEducation, 'id'>;

export function getAllEducation(): DBEducation[] {
  return db.prepare('SELECT * FROM education ORDER BY startDate DESC, id DESC').all() as DBEducation[];
}

export function insertEducation(d: EducationInput): DBEducation {
  const r = db
    .prepare('INSERT INTO education (degree, institution, startDate, endDate, current, description) VALUES (?, ?, ?, ?, ?, ?)')
    .run(d.degree, d.institution, d.startDate, d.endDate, d.current, d.description);
  return db.prepare('SELECT * FROM education WHERE id = ?').get(Number(r.lastInsertRowid)) as DBEducation;
}

export function updateEducation(id: number, d: EducationInput): DBEducation {
  db.prepare(
    'UPDATE education SET degree = ?, institution = ?, startDate = ?, endDate = ?, current = ?, description = ? WHERE id = ?'
  ).run(d.degree, d.institution, d.startDate, d.endDate, d.current, d.description, id);
  return db.prepare('SELECT * FROM education WHERE id = ?').get(id) as DBEducation;
}

export function deleteEducation(id: number): void {
  db.prepare('DELETE FROM education WHERE id = ?').run(id);
}

// ── Certifications ───────────────────────────────────────────────────
export interface DBCertification {
  id: number;
  name: string;
  issuer: string;
  issueDate: string; // YYYY-MM
  expirationDate: string; // YYYY-MM, '' when it does not expire
  credentialUrl: string;
}
export type CertificationInput = Omit<DBCertification, 'id'>;

export function getAllCertifications(): DBCertification[] {
  return db.prepare('SELECT * FROM certifications ORDER BY issueDate DESC, id DESC').all() as DBCertification[];
}

export function insertCertification(d: CertificationInput): DBCertification {
  const r = db
    .prepare('INSERT INTO certifications (name, issuer, issueDate, expirationDate, credentialUrl) VALUES (?, ?, ?, ?, ?)')
    .run(d.name, d.issuer, d.issueDate, d.expirationDate, d.credentialUrl);
  return db.prepare('SELECT * FROM certifications WHERE id = ?').get(Number(r.lastInsertRowid)) as DBCertification;
}

export function updateCertification(id: number, d: CertificationInput): DBCertification {
  db.prepare(
    'UPDATE certifications SET name = ?, issuer = ?, issueDate = ?, expirationDate = ?, credentialUrl = ? WHERE id = ?'
  ).run(d.name, d.issuer, d.issueDate, d.expirationDate, d.credentialUrl, id);
  return db.prepare('SELECT * FROM certifications WHERE id = ?').get(id) as DBCertification;
}

export function deleteCertification(id: number): void {
  db.prepare('DELETE FROM certifications WHERE id = ?').run(id);
}

// ── Skill groups ─────────────────────────────────────────────────────
export interface DBSkillGroup {
  id: number;
  icon: string;
  title: string;
  description: string;
  skills: string; // JSON string array
  position: number;
}
export interface SkillGroupInput {
  icon: string;
  title: string;
  description: string;
  skills: string[];
}

if (!skillGroupsExisted) {
  const seed = db.prepare('INSERT INTO skill_groups (icon, title, description, skills, position) VALUES (?, ?, ?, ?, ?)');
  const defaults: [string, string, string, string[]][] = [
    ['Server', 'Backend Development', 'I design and build robust, scalable, high-performance APIs.', ['Node.js', 'Go', 'Python', 'PostgreSQL', 'Redis', 'REST', 'gRPC']],
    ['Link2', 'Blockchain / Web3', 'Smart contracts, DeFi protocols and decentralized architectures.', ['Solidity', 'Ethereum', 'Hardhat', 'ethers.js', 'IPFS', 'EVM']],
    ['Layers', 'Systems Architecture', 'Design of distributed, event-driven systems and microservices.', ['Microservices', 'Kafka', 'RabbitMQ', 'DDD', 'CQRS', 'Event Sourcing']],
    ['Terminal', 'Tools / DevOps', 'Infrastructure as code, CI/CD and container orchestration.', ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'AWS', 'Linux']],
  ];
  defaults.forEach(([icon, title, description, skills], i) =>
    seed.run(icon, title, description, JSON.stringify(skills), i)
  );
}

export function getAllSkillGroups(): DBSkillGroup[] {
  return db.prepare('SELECT * FROM skill_groups ORDER BY position ASC, id ASC').all() as DBSkillGroup[];
}

export function insertSkillGroup(d: SkillGroupInput): DBSkillGroup {
  const next = (db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS n FROM skill_groups').get() as { n: number }).n;
  const r = db
    .prepare('INSERT INTO skill_groups (icon, title, description, skills, position) VALUES (?, ?, ?, ?, ?)')
    .run(d.icon, d.title, d.description, JSON.stringify(d.skills), next);
  return db.prepare('SELECT * FROM skill_groups WHERE id = ?').get(Number(r.lastInsertRowid)) as DBSkillGroup;
}

export function updateSkillGroup(id: number, d: SkillGroupInput): DBSkillGroup {
  db.prepare('UPDATE skill_groups SET icon = ?, title = ?, description = ?, skills = ? WHERE id = ?').run(
    d.icon,
    d.title,
    d.description,
    JSON.stringify(d.skills),
    id
  );
  return db.prepare('SELECT * FROM skill_groups WHERE id = ?').get(id) as DBSkillGroup;
}

export function deleteSkillGroup(id: number): void {
  db.prepare('DELETE FROM skill_groups WHERE id = ?').run(id);
}

/** Sets position = index of the id in the given array. */
export function reorderSkillGroups(ids: number[]): void {
  const upd = db.prepare('UPDATE skill_groups SET position = ? WHERE id = ?');
  db.transaction(() => ids.forEach((id, i) => upd.run(i, id)))();
}

// ── Projects ─────────────────────────────────────────────────────────
export interface DBProject {
  id: number;
  title: string;
  description: string;
  tags: string; // JSON string array
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  position: number;
}
export interface ProjectInput {
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
}

export function getAllProjects(): DBProject[] {
  return db.prepare('SELECT * FROM projects ORDER BY position ASC, id ASC').all() as DBProject[];
}

export function insertProject(d: ProjectInput): DBProject {
  const next = (db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS n FROM projects').get() as { n: number }).n;
  const r = db
    .prepare(
      'INSERT INTO projects (title, description, tags, githubUrl, liveUrl, imageUrl, position) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(d.title, d.description, JSON.stringify(d.tags), d.githubUrl, d.liveUrl, d.imageUrl, next);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(r.lastInsertRowid)) as DBProject;
}

export function updateProject(id: number, d: ProjectInput): DBProject {
  db.prepare(
    'UPDATE projects SET title = ?, description = ?, tags = ?, githubUrl = ?, liveUrl = ?, imageUrl = ? WHERE id = ?'
  ).run(d.title, d.description, JSON.stringify(d.tags), d.githubUrl, d.liveUrl, d.imageUrl, id);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as DBProject;
}

export function deleteProject(id: number): void {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

export function reorderProjects(ids: number[]): void {
  const upd = db.prepare('UPDATE projects SET position = ? WHERE id = ?');
  db.transaction(() => ids.forEach((id, i) => upd.run(i, id)))();
}

// ── Section subtexts ─────────────────────────────────────────────────
/** Stored overrides on top of the built-in defaults (an empty stored value = intentionally hidden). */
export function getSectionTexts(): Record<string, string> {
  const rows = db.prepare('SELECT key, subtitle FROM section_texts').all() as { key: string; subtitle: string }[];
  const texts: Record<string, string> = { ...SECTION_DEFAULTS };
  for (const r of rows) texts[r.key] = r.subtitle;
  return texts;
}

export function saveSectionTexts(texts: Record<string, string>): void {
  const upsert = db.prepare(
    'INSERT INTO section_texts (key, subtitle) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET subtitle = excluded.subtitle'
  );
  db.transaction(() => {
    for (const [key, subtitle] of Object.entries(texts)) upsert.run(key, subtitle);
  })();
}

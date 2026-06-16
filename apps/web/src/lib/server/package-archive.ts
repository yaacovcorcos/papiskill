import { normalizePackagePath } from "@papiskill/skill-core";

export interface PackageArchiveFile {
  path: string;
  content: string;
}

interface ZipEntry {
  path: string;
  nameBytes: Buffer;
  data: Buffer;
  crc: number;
  offset: number;
}

const utf8Flag = 0x0800;
const storedMethod = 0;
const versionNeeded = 20;

export function packageDownloadFilename(slug: string, extension = "zip") {
  return `${safePackageName(slug)}.${extension}`;
}

export function buildSkillPackageZip(input: {
  slug: string;
  files: PackageArchiveFile[];
}): Buffer {
  const root = safePackageName(input.slug);
  const entries = normalizeArchiveFiles(input.files).map((file) => ({
    path: `${root}/${file.path}`,
    nameBytes: Buffer.from(`${root}/${file.path}`, "utf8"),
    data: Buffer.from(file.content, "utf8"),
    crc: crc32(Buffer.from(file.content, "utf8")),
    offset: 0,
  }));

  const localParts: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    entry.offset = offset;
    const localHeader = createLocalHeader(entry);
    localParts.push(localHeader, entry.data);
    offset += localHeader.length + entry.data.length;
  }

  const centralParts = entries.map(createCentralDirectoryHeader);
  const centralDirectory = Buffer.concat(centralParts);
  const end = createEndOfCentralDirectory(entries.length, centralDirectory.length, offset);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

export function normalizeArchiveFiles(files: PackageArchiveFile[]): PackageArchiveFile[] {
  const byPath = new Map<string, PackageArchiveFile>();
  for (const file of files) {
    const normalized = normalizePackagePath(file.path);
    byPath.set(normalized, {
      path: normalized,
      content: file.content,
    });
  }
  return Array.from(byPath.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function createLocalHeader(entry: ZipEntry) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(versionNeeded, 4);
  header.writeUInt16LE(utf8Flag, 6);
  header.writeUInt16LE(storedMethod, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.data.length, 18);
  header.writeUInt32LE(entry.data.length, 22);
  header.writeUInt16LE(entry.nameBytes.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, entry.nameBytes]);
}

function createCentralDirectoryHeader(entry: ZipEntry) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(versionNeeded, 4);
  header.writeUInt16LE(versionNeeded, 6);
  header.writeUInt16LE(utf8Flag, 8);
  header.writeUInt16LE(storedMethod, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.data.length, 20);
  header.writeUInt32LE(entry.data.length, 24);
  header.writeUInt16LE(entry.nameBytes.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([header, entry.nameBytes]);
}

function createEndOfCentralDirectory(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entryCount, 8);
  end.writeUInt16LE(entryCount, 10);
  end.writeUInt32LE(centralDirectorySize, 12);
  end.writeUInt32LE(centralDirectoryOffset, 16);
  end.writeUInt16LE(0, 20);
  return end;
}

function safePackageName(slug: string) {
  return slug.replace(/[^a-z0-9_.-]/gi, "-") || "skill";
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff]!;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

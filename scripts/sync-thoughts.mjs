import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const obsidianThoughtsDir = "/Users/ben/Documents/Obsidian Vault/Thoughts";
const outputDir = path.join(process.cwd(), "app/content/thoughts");

const files = (await readdir(obsidianThoughtsDir))
  .filter((file) => file.endsWith(".md"))
  .sort();

await mkdir(outputDir, { recursive: true });

const existingFiles = await readdir(outputDir);
await Promise.all(
  existingFiles
    .filter((file) => file.endsWith(".js"))
    .map((file) => rm(path.join(outputDir, file))),
);

const thoughts = await Promise.all(
  files.map(async (file) => {
    const sourcePath = path.join(obsidianThoughtsDir, file);
    const sourceStats = await stat(sourcePath);
    const title = path.basename(file, ".md");
    const id = slugify(title);
    const createdAt = sourceStats.birthtime.toISOString();
    const meta = formatMonthYear(sourceStats.birthtime);
    const content = await readFile(sourcePath, "utf8");
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return { createdAt, fileName: `${id}.js`, id, meta, paragraphs, title };
  }),
);

thoughts.sort((a, b) => {
  const dateOrder = new Date(b.createdAt) - new Date(a.createdAt);

  if (dateOrder !== 0) {
    return dateOrder;
  }

  return a.title.localeCompare(b.title);
});

for (const thought of thoughts) {
  await writeFile(
    path.join(outputDir, thought.fileName),
    `const thought = ${JSON.stringify(
      {
        id: thought.id,
        href: `#${thought.id}`,
        title: thought.title,
        meta: thought.meta,
        createdAt: thought.createdAt,
        paragraphs: thought.paragraphs,
      },
      null,
      2,
    )};

export default thought;
`,
  );
}

const imports = thoughts
  .map(
    (thought, index) =>
      `import thought${index} from "./${path.basename(thought.fileName, ".js")}";`,
  )
  .join("\n");
const thoughtNames = thoughts.map((_, index) => `thought${index}`).join(", ");

await writeFile(
  path.join(outputDir, "index.js"),
  `${imports}

const thoughts = [${thoughtNames}];

export default thoughts;
`,
);

console.log(`Synced ${thoughts.length} thoughts from Obsidian.`);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatMonthYear(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}.${year}`;
}

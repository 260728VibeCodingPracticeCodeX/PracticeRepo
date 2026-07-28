import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(projectRoot, "dist");
const html = await readFile(resolve(projectRoot, "index.html"), "utf8");

await rm(distRoot, { recursive: true, force: true });
await mkdir(resolve(distRoot, "server"), { recursive: true });
await mkdir(resolve(distRoot, ".openai"), { recursive: true });

const worker = `
const html = ${JSON.stringify(html)};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "public, max-age=300"
      }
    });
  }
};
`;

await writeFile(resolve(distRoot, "server", "index.js"), worker.trimStart(), "utf8");
await writeFile(resolve(distRoot, "index.html"), html, "utf8");
await writeFile(
  resolve(distRoot, ".openai", "hosting.json"),
  JSON.stringify({ project_id: "appgprj_6a68579f807c8191a8f3a67987995970" }, null, 2),
  "utf8"
);

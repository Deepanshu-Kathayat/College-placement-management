const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "placement_data.json");
const MIME_TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".txt": "text/plain", ".png": "image/png" };

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{\"applications\":[]}\n");

function send(response, status, body, type = "application/json") {
  response.writeHead(status, { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-store" });
  response.end(type === "application/json" ? JSON.stringify(body) : body);
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch { return { applications: [] }; }
}

function saveApplication(request, response) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 256 * 1024) request.destroy();
  });
  request.on("end", () => {
    try {
      const payload = JSON.parse(body || "{}");
      if (!payload.company || !payload.role) return send(response, 400, { saved: false, error: "Company and role are required" });
      const data = readData();
      const record = { id: Date.now().toString(36), company: String(payload.company), role: String(payload.role), status: "Under review", createdAt: new Date().toISOString() };
      data.applications = [record, ...(data.applications || [])].slice(0, 50);
      fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
      send(response, 201, { saved: true, record });
    } catch (error) { send(response, 400, { saved: false, error: "Invalid application payload" }); }
  });
}

function serveStatic(request, response, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) return send(response, 403, { error: "Forbidden" });
  fs.readFile(filePath, (error, content) => {
    if (error) return send(response, 404, { error: "File not found" });
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    send(response, 200, content, type);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === "/api/health" && request.method === "GET") return send(response, 200, { ok: true, service: "campushire" });
  if (url.pathname === "/api/applications" && request.method === "GET") return send(response, 200, readData().applications || []);
  if (url.pathname === "/api/applications" && request.method === "POST") return saveApplication(request, response);
  if (request.method !== "GET") return send(response, 405, { error: "Method not allowed" });
  return serveStatic(request, response, url.pathname);
});

server.listen(PORT, () => console.log(`CampusHire running at http://localhost:${PORT}`));

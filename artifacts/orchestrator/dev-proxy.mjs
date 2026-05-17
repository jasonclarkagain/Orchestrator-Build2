import http from "http";
import net from "net";
import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const PORT = parseInt(process.env.PORT || "3000", 10);
const VITE_PORT = PORT + 1;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Start Vite on an adjacent port
const vite = spawn("./node_modules/.bin/vite", ["dev"], {
  env: { ...process.env, PORT: String(VITE_PORT) },
  stdio: "inherit",
  cwd: __dirname,
});
vite.on("exit", (code) => {
  console.log(`[orch-proxy] Vite exited: ${code}`);
  process.exit(code ?? 0);
});

let viteReady = false;
// Give Vite a moment to start, then mark ready
setTimeout(() => {
  viteReady = true;
}, 2000);

// HTTP proxy
const server = http.createServer((req, res) => {
  const proxy = http.request(
    {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${VITE_PORT}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    },
  );
  proxy.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(
        `<!doctype html><html><head><meta http-equiv="refresh" content="1"><title>Starting…</title></head><body style="background:#0a0a0a;color:#39ff14;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><pre>ORCH_2026 starting…</pre></body></html>`,
      );
    }
  });
  req.pipe(proxy, { end: true });
});

// WebSocket proxy — required for Vite HMR
server.on("upgrade", (req, socket, head) => {
  const upstream = net.connect(VITE_PORT, "127.0.0.1", () => {
    const headers = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\r\n");
    upstream.write(
      `${req.method} ${req.url} HTTP/1.1\r\nHost: 127.0.0.1:${VITE_PORT}\r\n${headers}\r\n\r\n`,
    );
    if (head && head.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(PORT, "::", () => {
  console.log(
    `[orch-proxy] Listening on port ${PORT}, proxying Vite on ${VITE_PORT}`,
  );
});

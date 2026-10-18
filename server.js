const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd) {
  const r = await fetch(`${REDIS_URL}/${cmd.join("/")}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  return r.json();
}

app.post("/api/capture", async (req, res) => {
  const entry = JSON.stringify({
    time: new Date().toISOString(),
    ip: req.headers["x-forwarded-for"] || "",
    ua: req.headers["user-agent"],
    data: req.body
  });
  await redis(["lpush", "captures", encodeURIComponent(entry)]);
  res.json({ ok: true });
});

app.get("/captures", async (req, res) => {
  const r = await redis(["lrange", "captures", "0", "100"]);
  const rows = (r.result || []).map(x => JSON.parse(decodeURIComponent(x)));
  res.json(rows);
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

module.exports = app;
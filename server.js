const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const LOG = path.join(__dirname, "captured.txt");

app.post("/api/capture", (req, res) => {
  const entry = {
    time: new Date().toISOString(),
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    ua: req.headers["user-agent"],
    data: req.body
  };
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(LOG, line);
  console.log(line.trim());
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("running on http://localhost:" + PORT));
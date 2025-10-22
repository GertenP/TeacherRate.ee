import express from "express";
import cors from "cors";
import fs from "fs-extra";

const app = express();
const PORT = 3000;
const DATA_FILE = "./data.json";

app.use(cors());
app.use(express.json());


// Saa kõik klassid kätte.
app.get("/api/classes", async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    res.json(data.classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Andmete lugemine ebaõnnestus" });
  }
});

app.post("/api/classes", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Puudub klassi nimi" });

  try {
    const data = await fs.readJson(DATA_FILE);

    // Check if class already exists
    if (data.classes.find(c => c.name === name)) {
      return res.status(400).json({ error: "Klass juba olemas" });
    }

    const newClass = { name, rating: 0, comments: [] };
    data.classes.push(newClass);

    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Salvestamine ebaõnnestus" });
  }
});

app.delete("/api/classes/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const data = await fs.readJson(DATA_FILE);
    const index = data.classes.findIndex(c => c.name === name);

    if (index === -1) return res.status(404).json({ error: "Klassi ei leitud" });

    const deleted = data.classes.splice(index, 1)[0];
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });

    res.json(deleted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kustutamine ebaõnnestus" });
  }
});

// Post päring ratingu salvestamisek
app.post("/api/classes/:name/rating", async (req, res) => {
  const { name } = req.params;
  const { text, stars } = req.body;

  if (!text || !stars) {
    return res.status(400).json({ error: "Puudub kommentaar või hinne" });
  }

  try {
    const data = await fs.readJson(DATA_FILE);
    const cls = data.classes.find((c) => c.name === name);

    if (!cls) {
      return res.status(404).json({ error: "Õppeainet ei leitud" });
    }

    cls.comments.push({ text, stars: Number(stars) });
    cls.rating =
      cls.comments.reduce((sum, c) => sum + c.stars, 0) / cls.comments.length;

    await fs.writeJson(DATA_FILE, data, { spaces: 2 });

    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "salvestamine JSONI failiebaõnnestus" });
  }
});

app.delete("/api/classes/:name/rating/:index", async (req, res) => {
  const { name, index } = req.params;

  try {
    const data = await fs.readJson(DATA_FILE);
    const cls = data.classes.find(c => c.name === name);

    if (!cls) return res.status(404).json({ error: "Õppeainet ei leitud" });

    const idx = Number(index);
    if (isNaN(idx) || idx < 0 || idx >= cls.comments.length)
      return res.status(400).json({ error: "Vigane kommentaari indeks" });

    cls.comments.splice(idx, 1);

    // Recalculate rating
    cls.rating =
      cls.comments.reduce((sum, c) => sum + c.stars, 0) /
      (cls.comments.length || 1);

    await fs.writeJson(DATA_FILE, data, { spaces: 2 });

    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kommentaari kustutamine ebaõnnestus" });
  }
});


app.listen(PORT, () =>
  console.log(`Server: http://localhost:${PORT}`)
);

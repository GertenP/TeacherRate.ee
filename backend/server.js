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

app.listen(PORT, () =>
  console.log(`Server: http://localhost:${PORT}`)
);

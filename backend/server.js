import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      rating REAL DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER,
      text TEXT NOT NULL,
      stars INTEGER NOT NULL,
      FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
    );
  `);
})();

// ROUTES
app.get("/api/classes", async (req, res) => {
  const classes = await db.all(`
    SELECT c.*, 
      COALESCE(
        json_group_array(json_object('text', cm.text, 'stars', cm.stars)),
        '[]'
      ) AS comments
    FROM classes c
    LEFT JOIN comments cm ON c.id = cm.class_id
    GROUP BY c.id
  `);

  classes.forEach(c => {
    // Ensure it's always an array
    c.comments = JSON.parse(c.comments);
  });

  res.json(classes);
});
// GET all ratings for a specific class
app.get("/api/classes/:name/ratings", async (req, res) => {
  const { name } = req.params;

  try {
    // Find class ID
    const cls = await db.get(`SELECT id FROM classes WHERE name = ?`, [name]);
    if (!cls) return res.status(404).json({ error: "Class not found" });

    // Get all comments/ratings for that class
    const comments = await db.all(
      `SELECT text, stars FROM comments WHERE class_id = ?`,
      [cls.id]
    );

    res.json(comments); // returns an array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

app.post("/api/classes", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing class name" });

  try {
    await db.run(`INSERT INTO classes (name) VALUES (?)`, [name]);
    res.status(201).json({ name, rating: 0, comments: [] });
  } catch {
    res.status(400).json({ error: "Class already exists" });
  }
});

app.delete("/api/classes/:name", async (req, res) => {
  const { name } = req.params;
  const result = await db.run(`DELETE FROM classes WHERE name = ?`, [name]);
  if (result.changes === 0)
    return res.status(404).json({ error: "Class not found" });
  res.json({ message: "Deleted" });
});

app.post("/api/classes/:name/rating", async (req, res) => {
  const { name } = req.params;
  const { text, stars } = req.body;
  if (!text || !stars)
    return res.status(400).json({ error: "Missing text or stars" });

  const cls = await db.get(`SELECT id FROM classes WHERE name = ?`, [name]);
  if (!cls)
    return res.status(404).json({ error: "Class not found" });

  await db.run(
    `INSERT INTO comments (class_id, text, stars) VALUES (?, ?, ?)`,
    [cls.id, text, stars]
  );

  const avg = await db.get(
    `SELECT AVG(stars) AS avg FROM comments WHERE class_id = ?`,
    [cls.id]
  );

  await db.run(`UPDATE classes SET rating = ? WHERE id = ?`, [
    avg.avg || 0,
    cls.id,
  ]);

  const updated = await db.get(
    `SELECT * FROM classes WHERE id = ?`,
    [cls.id]
  );
  updated.comments = await db.all(
    `SELECT text, stars FROM comments WHERE class_id = ?`,
    [cls.id]
  );

  res.json(updated);
});

app.delete("/api/classes/:name/rating/:index", async (req, res) => {
  const { name, index } = req.params;
  const idx = Number(index);

  const cls = await db.get(`SELECT id FROM classes WHERE name = ?`, [name]);
  if (!cls) return res.status(404).json({ error: "Class not found" });

  const comments = await db.all(
    `SELECT id FROM comments WHERE class_id = ? ORDER BY id`,
    [cls.id]
  );

  if (idx < 0 || idx >= comments.length)
    return res.status(404).json({ error: "Comment not found" });

  await db.run(`DELETE FROM comments WHERE id = ?`, [comments[idx].id]);

  // Update average rating
  const avg = await db.get(`SELECT AVG(stars) AS avg FROM comments WHERE class_id = ?`, [cls.id]);
  await db.run(`UPDATE classes SET rating = ? WHERE id = ?`, [avg.avg || 0, cls.id]);

  // Return updated class
  const updated = await db.get(`SELECT * FROM classes WHERE id = ?`, [cls.id]);
  updated.comments = await db.all(
    `SELECT text, stars FROM comments WHERE class_id = ?`,
    [cls.id]
  );

  res.json(updated);
});


app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

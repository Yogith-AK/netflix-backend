const cors = require("cors");

const mysql = require("mysql2");

const express = require("express");

const app = express();

app.use(cors());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Akyoro$030407",
  database: "netflix_app"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});


app.use(express.json());


// Basic route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

const bcrypt = require("bcrypt");

app.post("/register", async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, password, phone)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [username, email, hashedPassword, phone], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        message: "User registered successfully"
      });
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    const bcrypt = require("bcrypt");
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful"
    });
  });
});



// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

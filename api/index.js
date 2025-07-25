const { validateEnvVariables } = require("./environment.js");

// verify that all required env variables exist
validateEnvVariables();

const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { dataToTable } = require("./dataToHtml.js");
const app = express();

// cors configuration
const validOrigins = process.env.VALID_ORIGINS.split(";");
const corsOptions = {
  origin: validOrigins,
  methods: ["GET", "POST"],
};

app.use(express.json());
app.use(cors(corsOptions));

const config = {
  connectionString: process.env.DATABASE_URI,
};

const pool = new Pool(config);

app.get("/v1/status", (_, res) => {
  res.send("Contact-la-backend [v1.0.0]");
});

app.post("/v1/contact", async (req, res) => {
  const { body } = req;

  const { firstName, lastName, email, message } = body;

  if (!firstName) return res.status(400).json({ message: "Missing firstname" });
  if (!lastName) return res.status(400).json({ message: "Missing lastname" });
  if (!email) return res.status(400).json({ message: "Missing email" });
  if (!message) return res.status(400).json({ message: "Missing message" });

  const entry = { firstName, lastName, email, message };

  try {
    const query = {
      text: "INSERT INTO contact_messages(first_name, last_name, email, message) VALUES ($1, $2, $3, $4) RETURNING *",
      values: [entry.firstName, entry.lastName, entry.email, entry.message],
    };
    const result = await pool.query(query);
    return res.status(200).json({ message: "Ok", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

app.post("/v1/test-contact", async (req, res) => {
  const { body } = req;
  console.log("origin domain:", req.get("origin"));
  // console.log(body);
  res.status(200).json({ body });
});

app.get("/v1/entries", async (_, res) => {
  try {
    const query = "SELECT * FROM contact_messages;";

    const result = await pool.query(query);
    res.status(200).json({ message: "Ok", data: result.rows });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/list", async (_, res) => {
  try {
    const query = `SELECT
      first_name, last_name,
      email, message,
      COALESCE(to_char(timezone('America/Buenos_Aires', created_at), 'DD Mon YYYY HH24:MI:SS'), '') as created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 5;`;
    const result = await pool.query(query);

    const encabezado = {
      created_at: "Fecha/hora",
      first_name: "Nombre",
      last_name: "Apellido",
      email: "Email",
      message: "Mensaje",
    };
    const table = dataToTable(encabezado, result.rows);
    const htmlStr = `<html><head></head><body><h1>Lista de mensajes</h1>${table}</body></html>`;
    res.status(200).send(htmlStr);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server "contact-la-backend" running on port ${PORT}`);
});

module.exports = app;

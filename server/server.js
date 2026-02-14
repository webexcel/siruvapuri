const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const matchRoutes = require("./routes/match");
const adminRoutes = require("./routes/admin");
const { getThemeSettings, getModuleSettings } = require("./controllers/settingsController");
const { getActiveMembershipPlans } = require("./controllers/membershipController");

const app = express();
const PORT = process.env.PORT || 7000;

/* ============================================================
   SIMPLE & SAFE CORS (ALLOW ALL ORIGINS)
============================================================ */

// MUST come BEFORE routes
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Explicit OPTIONS support
app.options("*", cors());

/* ============================================================
   BODY PARSER
============================================================ */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ============================================================
   STATIC FILES (serve uploaded photos when using local storage)
============================================================ */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ============================================================
   ROUTES
============================================================ */

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/settings/theme", getThemeSettings);
app.get("/api/settings/modules", getModuleSettings);
app.get("/api/membership-plans/active", getActiveMembershipPlans);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

/* ============================================================
   ERROR HANDLER
============================================================ */

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ error: err.message });
});

/* ============================================================
   START SERVER
============================================================ */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

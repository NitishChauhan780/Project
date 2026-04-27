const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

const app = express();

const getAllowedOrigins = () => {
  const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    return envOrigins;
  }

  return [...envOrigins, "http://localhost:5173", "http://localhost:3000"];
};

// Set security HTTP headers
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// CORS configuration
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" })); // Limit body size to prevent DoS

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const { protect, authorize } = require("./middleware/auth");

app.use("/api/users", require("./routes/users"));
app.use("/api/mood", protect, require("./routes/mood"));
app.use("/api/quiz", protect, require("./routes/quiz"));
app.use("/api/journal", protect, require("./routes/journal"));
app.use("/api/appointments", require("./routes/appointments")); // Internal protection inside route
app.use("/api/forum", protect, require("./routes/forum"));
app.use("/api/resources", protect, require("./routes/resources"));
app.use("/api/ai", protect, require("./routes/ai"));

// Admin Routes - Strict Protection
app.use("/api/admin", protect, authorize("admin"), require("./routes/admin"));
app.use(
  "/api/admin/users",
  protect,
  authorize("admin"),
  require("./routes/adminUsers"),
);
app.use(
  "/api/admin/resources",
  protect,
  authorize("admin"),
  require("./routes/adminResources"),
);
app.use(
  "/api/admin/moderation",
  protect,
  authorize("admin"),
  require("./routes/adminModeration"),
);
app.use(
  "/api/admin/alerts",
  protect,
  authorize("admin"),
  require("./routes/adminAlerts"),
);
app.use(
  "/api/admin/counsellors",
  protect,
  authorize("admin"),
  require("./routes/adminCounsellors"),
);

app.use("/api/announcements", protect, require("./routes/announcements"));
app.use("/api/notifications", protect, require("./routes/notifications"));
app.use("/api/sleep", protect, require("./routes/sleep"));
app.use("/api/availability", protect, require("./routes/availability"));
app.use("/api/messages", protect, require("./routes/messages"));
app.use("/api/chat-history", protect, require("./routes/chatHistory"));
app.use("/api/badges", protect, require("./routes/badges"));
app.use("/api/insights", protect, require("./routes/insights"));

app.get("/", (req, res) => {
  res.json({ message: "MindBridge API Running", status: "healthy" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `🚀 MindBridge Server running on port ${process.env.PORT || 5000}`,
  );
});

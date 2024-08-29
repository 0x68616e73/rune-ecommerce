const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require('express-rate-limit');
const productRoutes = require("./routes/products");
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
  'https://runeshop.netlify.app',
  'https://runeshop.netlify.app/',
  'https://rune-ecommerce.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.static("public"));

app.options('*', cors());


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: function (req, res) {
    return req.method === 'OPTIONS'; // Skip rate limiting for OPTIONS requests
  }
});

app.use(limiter);

// API routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// Serve the frontend
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
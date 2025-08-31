// --- REQUIRED PACKAGES ---
const FormData = require("form-data");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

// --- YOUR IMAGGA API KEYS ---
const IMAGGA_API_KEY = "acc_400516d55f25d2e";
const IMAGGA_API_SECRET = "6d8733f3a9150cd3be4ee33d8a279484";

// --- INITIALIZE THE SERVER ---
const app = express();

// --- MIDDLEWARE SETUP ---
app.use(cors()); // Enables frontend to connect
app.use(express.json()); // Allows server to understand JSON

// Set up Multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- LOAD THE PRODUCT DATABASE ---
// CRITICAL: This loads the data file with the AI-generated tags.
let productsDB = [];
try {
  productsDB = JSON.parse(fs.readFileSync("products_with_tags.json", "utf-8"));
} catch (err) {
  console.error("\n--- ERROR: DATA FILE MISSING ---");
  console.error("Could not load 'products_with_tags.json'.");
  console.error("Please run `node generateTags.js` first to create this file.");
  console.error("--------------------------------\n");
  process.exit(1);
}

// --- MAIN API ENDPOINT ---
app.post("/api/find-similar", upload.single("image"), async (req, res) => {
  console.log("Received a request to find similar products...");

  let uploadedImageTags = [];
  try {
    if (req.file) {
      // Logic for an UPLOADED FILE
      const imageBuffer = req.file.buffer;
      const formData = new FormData();
      formData.append("image", imageBuffer, { filename: "image.jpg" });

      const response = await axios.post(
        "https://api.imagga.com/v2/tags",
        formData,
        {
          headers: formData.getHeaders(),
          auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
        }
      );
      uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);

    } else if (req.body.imageUrl) {
      // Logic for an IMAGE URL
      const imageUrlToProcess = req.body.imageUrl;
      const response = await axios.get(
        `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrlToProcess)}`,
        {
          auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
        }
      );
      uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);

    } else {
      return res.status(400).json({ error: "Please provide an image file or an image URL." });
    }

    console.log("Tags for uploaded image:", uploadedImageTags);

  } catch (error) {
    console.error("Error getting tags from Imagga:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: "Could not process the image with the AI service." });
  }

  // --- COMPARE WITH DATABASE AND CALCULATE SCORES ---
  const similarProducts = productsDB.map((product) => {
    const commonTags = (product.tags || []).filter((tag) =>
      uploadedImageTags.includes(tag)
    );

    const maxScore = uploadedImageTags.length > 0 ? uploadedImageTags.length : 1;
    const normalizedScore = commonTags.length / maxScore;

    return {
      ...product,
      similarityScore: normalizedScore,
    };
  });

  // --- SORT AND SEND RESULTS ---
  similarProducts.sort((a, b) => b.similarityScore - a.similarityScore);

  console.log("Found and sorted similar products. Sending response.");
  res.json(similarProducts.slice(0, 10));
});

// --- START THE SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
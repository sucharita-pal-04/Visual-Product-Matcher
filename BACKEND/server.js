// const FormData = require("form-data");
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const axios = require("axios");
// const fs = require("fs");

// // --- IMPORTANT ---
// // Make sure your API keys are correct.
// const IMAGGA_API_KEY = "acc_400516d55f25d2e";
// const IMAGGA_API_SECRET = "6d8733f3a9150cd3be4ee33d8a279484";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ storage: multer.memoryStorage() });

// // --- CRITICAL FIX ---
// // You MUST use the file that has the AI-generated tags.
// // Ensure "products_with_tags.json" exists in this folder.
// const productsDB = JSON.parse(fs.readFileSync("products_with_tags.json", "utf-8"));

// app.post("/api/find-similar", upload.single("image"), async (req, res) => {
//   console.log("Received a request to find similar products...");

//   let uploadedImageTags = [];
//   try {
//     if (req.file) {
//       // --- FIX for 400 Bad Request Error ---
//       // This correctly sends the uploaded image file to Imagga.
//       const imageBuffer = req.file.buffer;
//       const formData = new FormData();
//       formData.append("image", imageBuffer, { filename: "image.jpg" });

//       const response = await axios.post(
//         "https://api.imagga.com/v2/tags",
//         formData,
//         {
//           headers: {
//             ...formData.getHeaders(),
//           },
//           auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
//         }
//       );
//       uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);

//     } else if (req.body.imageUrl) {
//       // This part for URLs is correct.
//       const imageUrlToProcess = req.body.imageUrl;
//       const response = await axios.get(
//         `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(
//           imageUrlToProcess
//         )}`,
//         {
//           auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
//         }
//       );
//       uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);
//     } else {
//       return res
//         .status(400)
//         .json({ error: "Please provide an image file or an image URL." });
//     }

//     console.log("Tags for uploaded image:", uploadedImageTags);
//   } catch (error) {
//     // This will now provide more detailed error messages from Imagga.
//     console.error("Error getting tags from Imagga:", error.response ? error.response.data : error.message);
//     return res.status(500).json({ error: "Could not process the image." });
//   }

//   const similarProducts = productsDB.map((product) => {
//     // --- FIX for Server Crash ---
//     // (product.tags || []) prevents a crash if a product has no tags.
//     const commonTags = (product.tags || []).filter((tag) =>
//       uploadedImageTags.includes(tag)
//     );

//     const maxScore =
//       uploadedImageTags.length > 0 ? uploadedImageTags.length : 1;
//     const normalizedScore = commonTags.length / maxScore;

//     return {
//       ...product,
//       similarityScore: normalizedScore,
//     };
//   });

//   similarProducts.sort((a, b) => b.similarityScore - a.similarityScore);

//   console.log("Found and sorted similar products. Sending response.");
//   res.json(similarProducts.slice(0, 10));
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// // const FormData = require("form-data");
// // const express = require("express");
// // const cors = require("cors");
// // const multer = require("multer");
// // const axios = require("axios");
// // const fs = require("fs");

// // const IMAGGA_API_KEY = "acc_400516d55f25d2e";
// // const IMAGGA_API_SECRET = "6d8733f3a9150cd3be4ee33d8a279484";

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // const upload = multer({ storage: multer.memoryStorage() });

// // const productsDB = JSON.parse(fs.readFileSync("product.json", "utf-8"));

// // app.post("/api/find-similar", upload.single("image"), async (req, res) => {
// //   console.log("Received a request to find similar products...");

// //   let uploadedImageTags = [];
// //   try {
// //     let imageUrlToProcess;

// //     if (req.file) {
// //       const imageBuffer = req.file.buffer.toString("base64");

// //       const response = await axios.post(
// //         "https://api.imagga.com/v2/tags",
// //         `image_base64=${imageBuffer}`,
// //         {
// //           auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
// //         }
// //       );
// //       uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);
// //     } else if (req.body.imageUrl) {
// //       imageUrlToProcess = req.body.imageUrl;

// //       const response = await axios.get(
// //         `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(
// //           imageUrlToProcess
// //         )}`,
// //         {
// //           auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
// //         }
// //       );
// //       uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);
// //     } else {
// //       return res
// //         .status(400)
// //         .json({ error: "Please provide an image file or an image URL." });
// //     }

// //     console.log("Tags for uploaded image:", uploadedImageTags);
// //   } catch (error) {
// //     console.error("Error getting tags from Imagga:", error.message);
// //     return res.status(500).json({ error: "Could not process the image." });
// //   }

// //   const similarProducts = productsDB.map((product) => {
// //     const commonTags = product.tags.filter((tag) =>
// //       uploadedImageTags.includes(tag)
// //     );

// //     const maxScore =
// //       uploadedImageTags.length > 0 ? uploadedImageTags.length : 1;
// //     const normalizedScore = commonTags.length / maxScore;

// //     return {
// //       ...product,

// //       similarityScore: normalizedScore,
// //     };
// //   });

// //   similarProducts.sort((a, b) => b.similarityScore - a.similarityScore);

// //   console.log("Found and sorted similar products. Sending response.");
// //   res.json(similarProducts.slice(0, 10));
// // });

// // const PORT = 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server is running on http://localhost:${PORT}`);
// // });

// --- REQUIRED PACKAGES ---
const FormData = require("form-data");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

// --- IMPORTANT: ENTER YOUR IMAGGA API KEYS ---
// Replace placeholders with your actual keys from the Imagga dashboard.
const IMAGGA_API_KEY = "acc_400516d55f25d2e";
const IMAGGA_API_SECRET = "6d8733f3a9150cd3be4ee33d8a279484";

// --- INITIALIZE THE SERVER ---
const app = express();

// --- MIDDLEWARE SETUP ---
// Enable CORS to allow your frontend to connect to this backend.
app.use(cors());
// Allow the server to understand JSON data.
app.use(express.json());

// Set up Multer to handle image uploads in memory.
const upload = multer({ storage: multer.memoryStorage() });

// --- LOAD THE PRODUCT DATABASE ---
// CRITICAL: This loads the data file that contains the AI-generated tags.
// Make sure "products_with_tags.json" exists in this folder.
let productsDB = [];
try {
  productsDB = JSON.parse(fs.readFileSync("products.json", "utf-8"));
} catch (err) {
  console.error("\n--- ERROR ---");
  console.error("Could not load 'products.json'.");
  console.error(
    "Please run the `node generateTags.js` script first to create this file."
  );
  console.error("-------------\n");
  process.exit(1); // Exit the process if the data file is missing.
}

// --- MAIN API ENDPOINT ---
app.post("/api/find-similar", upload.single("image"), async (req, res) => {
  console.log("Received a request to find similar products...");

  let uploadedImageTags = [];
  try {
    // --- 1. GET TAGS FOR THE USER'S IMAGE ---
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
        `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(
          imageUrlToProcess
        )}`,
        {
          auth: { username: IMAGGA_API_KEY, password: IMAGGA_API_SECRET },
        }
      );
      uploadedImageTags = response.data.result.tags.map((t) => t.tag.en);
    } else {
      return res
        .status(400)
        .json({ error: "Please provide an image file or an image URL." });
    }

    console.log("Tags for uploaded image:", uploadedImageTags);
  } catch (error) {
    console.error(
      "Error getting tags from Imagga:",
      error.response ? error.response.data : error.message
    );
    return res
      .status(500)
      .json({ error: "Could not process the image with the AI service." });
  }

  // --- 2. COMPARE WITH DATABASE AND CALCULATE SCORES ---
  const similarProducts = productsDB.map((product) => {
    // Safety check: (product.tags || []) prevents a crash if a product has no tags.
    const commonTags = (product.tags || []).filter((tag) =>
      uploadedImageTags.includes(tag)
    );

    // Calculate a normalized score from 0 to 1
    const maxScore =
      uploadedImageTags.length > 0 ? uploadedImageTags.length : 1;
    const normalizedScore = commonTags.length / maxScore;

    return {
      ...product,
      similarityScore: normalizedScore,
    };
  });

  // --- 3. SORT AND SEND RESULTS ---
  similarProducts.sort((a, b) => b.similarityScore - a.similarityScore);

  console.log("Found and sorted similar products. Sending response.");
  res.json(similarProducts.slice(0, 10)); // Send the top 10 matches
});

// --- START THE SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

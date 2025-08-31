// File: generateTags.js

const fs = require("fs");
const axios = require("axios");

// --- PASTE YOUR IMAGGA API KEYS HERE ---
const IMAGGA_API_KEY = "PASTE_YOUR_API_KEY_HERE";
const IMAGGA_API_SECRET = "PASTE_YOUR_API_SECRET_HERE";
// ------------------------------------

const inputFile = "products.json"; // The file you already have
const outputFile = "products.json"; // The new file we will create

async function generateTagsForProducts() {
  console.log(`Reading products from ${inputFile}...`);
  const productsData = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  const productsWithTags = [];

  console.log(
    `Found ${productsData.length} products. Starting tag generation...`
  );

  for (let i = 0; i < productsData.length; i++) {
    const product = productsData[i];
    try {
      console.log(
        `(${i + 1}/${productsData.length}) Fetching tags for: ${product.name}`
      );

      const response = await axios.get(
        `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(
          product.imageUrl
        )}`,
        {
          auth: {
            username: IMAGGA_API_KEY,
            password: IMAGGA_API_SECRET,
          },
        }
      );

      // Get the top 7 tags for each image
      const tags = response.data.result.tags
        .slice(0, 7)
        .map((tagInfo) => tagInfo.tag.en);

      productsWithTags.push({
        ...product,
        tags: tags, // Add the new tags array to the product
      });
    } catch (error) {
      console.error(
        `Error processing product ID ${product.id}: ${product.name}. Skipping.`
      );
      productsWithTags.push({
        ...product,
        tags: [], // Add empty tags if there's an error
      });
    }

    // Wait for 1 second between API calls to not exceed the free limit
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fs.writeFileSync(outputFile, JSON.stringify(productsWithTags, null, 2));
  console.log(`\n✅ Success! Your new file "${outputFile}" has been created.`);
}

generateTagsForProducts();

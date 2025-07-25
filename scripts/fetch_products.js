// scripts/fetch_products.js
import fetch from 'node-fetch';
import fs from 'fs';

const brands = [
  "cerave", "the-ordinary", "nivea", "garnier", "neutrogena", "simple", "vaseline", "cetaphil",
  "dove", "loreal", "bio-oil", "makari", "nice-and-lovely"
];

const products = [];

async function fetchProductsForBrand(brand) {
  const url = `https://world.openbeautyfacts.org/api/v2/search?brands_tags=${brand}&page_size=30&json=true`;
  const res = await fetch(url);
  const data = await res.json();
  data.products.forEach(p => {
    if (p.product_name && p.code) {
      products.push({
        name: p.product_name,
        brand: p.brands,
        barcode: p.code,
        ingredients: p.ingredients_text,
        categories: p.categories,
        image: p.image_url,
      });
    }
  });
}

for (const brand of brands) {
  await fetchProductsForBrand(brand);
}
fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
console.log(`Extracted ${products.length} products.`);

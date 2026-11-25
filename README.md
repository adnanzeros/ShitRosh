# শীতরস — Khejurer Gur (Single Page)
1. `npm install`
2. `cp .env.example .env.local` and fill `MONGODB_URI` (MongoDB Atlas; allow your IP in Network Access)
3. `npm run dev` → http://localhost:3000
Prices/products: `src/data/products.js`. Page text: `src/data/content.js`.
Order totals are always recalculated on the server (`src/lib/validations.js`) and saved with status `pending`; bKash/Nagad are never marked verified automatically.
Add your own product/process photos into `public/images/` and set the `image` field in the data files.

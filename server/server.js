import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: './.env'
});

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const tempDir = path.join(__dirname, 'public', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Created public/temp directory');
}

connectDB().then(() => {
    const port = process.env.PORT || 5000;

    app.on('error', (error) => {
        console.error(`Error starting server: ${error.message}`);
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.error(`Failed to connect to the database: ${error.message}`);
});
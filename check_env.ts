import * as dotenv from 'dotenv';
const result = dotenv.config();

console.log("Dotenv parsed:", result.error ? "Error" : "Success");
if (result.parsed) {
    console.log("Keys found:", Object.keys(result.parsed));
}

console.log("API_KEY:", process.env.API_KEY ? "Present (length " + process.env.API_KEY.length + ")" : "Missing");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
console.log("VITE_GEMINI_API_KEY:", process.env.VITE_GEMINI_API_KEY ? "Present" : "Missing");

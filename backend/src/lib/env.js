import 'dotenv/config';

// 1. Structural security validation: Prevents the engine from blind starting if keys are missing
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'ARCJET_KEY', 'FASTAPI_URL'];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`CRITICAL CONFIGURATION ERROR: ${varName} is missing in your .env file!`);
  }
}

// Helper utility to safely remove trailing slashes from communication endpoints
//const cleanTrailingSlash = (url) => (url && url.endsWith('/') ? url.slice(0, -1) : url);

const rawConfig = {
  NODE_ENV: process.env.NODE_ENV,
  
  // Ensures the listening PORT parameter parses into an exploitable number
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
  
  MONGO_URI: process.env.MONGO_URI,
  
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Cleaned frontend consumer location URL to prevent strict CORS evaluation crashes
  CLIENT_URL: process.env.CLIENT_URL,
  
  ARCJET_KEY: process.env.ARCJET_KEY,
  
  ARCJET_ENV: process.env.ARCJET_ENV,
  
  // Cleaned FastAPI endpoint string path ensuring robust downstream requests structure
  FASTAPI_URL: process.env.FASTAPI_URL || 'http://fastapi:8000',
};

// 2. Immutability protection: Freeze the configuration object to enforce safety across the app runtime
export const ENV = Object.freeze(rawConfig);

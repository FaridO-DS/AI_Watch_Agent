import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js";

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  // Enforcing the environment environment configuration directly to the client instance
  environment: ENV.ARCJET_ENV,
  
  // Definition of global API security layers
  rules: [
    // 1. Shield WAF: Core protection layer blocking common exploits (SQLi, XSS, Path Traversal)
    shield({ mode: "LIVE" }),
    
    // 2. Bot Detection: Blocks unauthorized automated scraping frameworks and malicious spiders
    detectBot({
      mode: "LIVE", 
      // Restricts access to standard verified search engine crawlers only (SEO friendly)
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
      ],
    }),
    
    // 3. Rate Limiting (Sliding Window): Mitigation layer preventing brute-force and DDoS patterns
    slidingWindow({
      mode: "LIVE", 
      max: 100,     // Allow a maximum threshold of 100 hits
      interval: 60, // Within a rolling window time frame of 60 seconds
      // Explicitly isolating access counters by client remote IP addresses
      //characteristics: ["ip"], 
    }),
  ],
});

export default aj;

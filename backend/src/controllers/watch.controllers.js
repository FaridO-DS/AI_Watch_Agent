import axios from 'axios';
import { ENV } from '../lib/env.js';
import TechReport from '../models/TechReport.js'; 
import User from '../models/User.js';

export const watch = async (req, res) => {
    const { topic, urls } = req.body;
    const userId = req.user._id;
    
    // 1. Inputs validation
    if (!topic || !urls?.length) {
        return res.status(400).json({ error: "No topic or URLs provided" });
    }
    
    try {
        // Fetch up-to-date user profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        
        // 2. Safeguard limit check (Permanent Counter)
        if (user.generationsCount >= 1) {
            return res.status(403).json({ 
                error: "Only 1 generation is allowed. Please contact me for more quotas." 
            });
        }
        
        // 3. Requesting FastAPI microservice with extended timeout
        console.log(`[Watch Agent] Dispatching task for user ${userId} to FastAPI...`);
        
        const aiResponse = await axios.post(`${ENV.FASTAPI_URL}/watch`, { 
            topic,
            urls
        }, {
            // Set 10 minutes timeout to give Crawl4AI enough time to scrape multiple targets
            timeout: 600000 
        });
        
        const aiData = aiResponse.data;

        // 4. Save to MongoDB - Linked explicitly to the requesting user
        const newReport = new TechReport({
            userId,
            topic: aiData.topic || topic,
            summary: aiData.summary,
            key_trends: aiData.key_trends,
            impact_score: aiData.impact_score,
            scraped_urls: urls 
        });
        
        const savedReport = await newReport.save();

        // 5. Increment usage quota upon successful completion
        user.generationsCount += 1;
        await user.save();
        
        return res.status(201).json(savedReport);

    } catch (error) {
        // Axios/FastAPI error tracking
        if (error.response) {
            console.error(`[FastAPI Error] Status ${error.response.status}:`, error.response.data);
            return res.status(error.response.status).json({ 
                error: "The AI processing server returned an error.", 
                details: error.response.data 
            });
        }
        
        // Handle explicit timeout errors gracefully
        if (error.code === 'ECONNABORTED') {
            console.error('[Watch Agent Timeout]: FastAPI took too long to respond.');
            return res.status(504).json({ error: 'The AI scraping task timed out. Please try with fewer URLs.' });
        }
        
        console.error('[Watch Agent Exception]:', error.message);
        return res.status(500).json({ error: 'Internal server error when processing the watch.' });
    }
};

// Fetching exclusively the logged-in user's scan history
export const getWatchHistory = async (req, res) => {
  const userId = req.user._id;

  try {
    const reports = await TechReport.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(reports);
  } catch (error) {
    console.error('[History Fetch Error]:', error.message);
    return res.status(500).json({ error: 'Could not fetch the history.' });
  }
};

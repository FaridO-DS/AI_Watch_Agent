import mongoose from 'mongoose';

const TechReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: { 
    type: String, 
    required: true,
    trim: true // Automatically strips accidental leading/trailing spaces
  },
  summary: { 
    type: String, 
    required: true 
  },
  key_trends: [{ 
    type: String,
    trim: true
  }],
  impact_score: { 
    type: Number, 
    min: 1, 
    max: 100, 
    required: true 
  },
  scraped_urls: [{ 
    type: String,
    trim: true
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Automatically manages internal optimizations for queries
  timestamps: false 
});

// CRITICAL PERFORMANCE INDEX
// Speeds up the dashboard history query: TechReport.find({ userId }).sort({ createdAt: -1 })
TechReportSchema.index({ userId: 1, createdAt: -1 });

// Backup export mapping
export default mongoose.model('TechReport', TechReportSchema);

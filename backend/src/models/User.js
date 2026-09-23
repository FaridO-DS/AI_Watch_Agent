import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true // Automatically removes accidental leading/trailing spaces
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true // Enforces lowercase storage for absolute consistency
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        generationsCount: {
            type: Number,
            default: 0,
            min: 0 // Safety fallback preventing database manipulation under 0
        }
    },
    {
        timestamps: true // Automatically manages createdAt and updatedAt fields
    }
);


const User = mongoose.model('User', userSchema);

export default User;

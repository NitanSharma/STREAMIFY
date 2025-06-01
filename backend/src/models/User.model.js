const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,// Remove leading and trailing spaces
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        bio: {
            type: String,
            default: '',
        },
        profilePic: {
            type: String,
            default: '',
        },
        nativeLanguage: {
            type: String,
            trim: true,
        },
        learningLanguage: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            default: '',
            trim: true,
        },
        isOnboarded: {
            type: Boolean,
            default: false,
        },
        friends :[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ]
    },
    {
        timestamps: true,
    }
);

//pre hook handler for password hashing
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);
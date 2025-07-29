const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        trim: true
    },
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    avatarUrl: String,
    address: {
        line1: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    about: String
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);

const mongoose = require('mongoose')

const { Schema } = mongoose;

const AdminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['teacher', 'admin'], // Role can be 'user' or 'admin'
        default: 'teacher' // Default role is 'user'
    },

});

module.exports = mongoose.model('Admin', AdminSchema)
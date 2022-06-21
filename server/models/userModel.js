//ODM library for MongoDB
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'basic',
        enum: ['basic', 'supervisor', 'admin']
    },
    //contains JWT info used to identify users
    accessToken: {
        type: String
    }
});

const User = mongoose.model('User', userSchema);
 
module.exports = User;
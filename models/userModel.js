const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordHistory: [{ type: String }], // Array to store the last few passwords
    passwordChangedAt: { type: Date, default: Date.now }, // Track when the password was last changed
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    twoFactorCode: { type: String },
    twoFactorExpires: { type: Date },
    role: { type: String, default: 'user' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
});

// Middleware to hash password before saving and manage password history
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Add current hashed password to history before updating
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);

        if (this.passwordHistory.length >= 3) {
            this.passwordHistory.shift(); // Remove the oldest password if we already have 3
        }
        this.passwordHistory.push(hashedPassword); // Store the hashed password
    }

    // Hash the new password and update
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now();
    next();
});

// Method to compare input password with stored hashed password
userSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

// Method to check if the new password has been used before
userSchema.methods.isPasswordInHistory = async function (newPassword) {
    for (let oldPassword of this.passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, oldPassword);
        if (isMatch) {
            return true;
        }
    }
    return false;
};

// Method to check if the account is currently locked
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);


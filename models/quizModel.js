const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    optionText: { type: String, required: true },  // This should match the request field name
    isCorrect: { type: Boolean, required: true },
});

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [optionSchema],
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;

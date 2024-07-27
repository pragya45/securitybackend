const express = require('express');
const {
    createQuiz,
    addQuestionToQuiz,
    updateQuiz,
    updateQuestionInQuiz,
    getQuizzes,
    deleteQuiz,
    getQuizById,
    submitQuiz
} = require('../controllers/quizController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Only admins can create, update, or delete quizzes
router.route('/')
    .post(protect, admin, createQuiz)
    .get(protect, getQuizzes);

router.route('/:quizId')
    .get(protect, getQuizById)
    .put(protect, admin, updateQuiz)
    .delete(protect, admin, deleteQuiz);

router.route('/:quizId/questions')
    .post(protect, admin, addQuestionToQuiz);

router.route('/:quizId/questions/:questionId')
    .put(protect, admin, updateQuestionInQuiz);

router.post('/:quizId/submit', submitQuiz);

module.exports = router;

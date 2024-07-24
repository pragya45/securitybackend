// const Quiz = require('../models/quizModel');

// // Create a new quiz
// const createQuiz = async (req, res) => {
//     try {
//         const { title } = req.body;
//         const quiz = new Quiz({
//             title,
//             createdBy: req.user._id,
//         });
//         await quiz.save();
//         res.status(201).json(quiz);
//     } catch (error) {
//         res.status(400).json({ message: 'Failed to create quiz' });
//     }
// };

// // Add a question to an existing quiz
// const addQuestionToQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params;
//         const { questionText, options } = req.body;

//         // Check if quizId and questionText are provided
//         if (!quizId || !questionText || !options) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: 'Quiz not found' });
//         }

//         // Validate that options are an array and have at least two options
//         if (!Array.isArray(options) || options.length < 2) {
//             return res.status(400).json({ message: 'Options should be an array with at least two choices' });
//         }

//         // Validate that each option has optionText and isCorrect properties
//         const invalidOption = options.some(
//             (option) => typeof option.optionText !== 'string' || typeof option.isCorrect !== 'boolean'
//         );
//         if (invalidOption) {
//             return res.status(400).json({ message: 'Each option should have a optionText and isCorrect property' });
//         }

//         quiz.questions.push({ questionText, options });
//         await quiz.save();
//         res.status(201).json(quiz);
//     } catch (error) {
//         console.error('Error adding question:', error);
//         res.status(400).json({ message: 'Failed to add question' });
//     }
// };


// // Update quiz title
// const updateQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params;
//         const { title } = req.body;

//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: 'Quiz not found' });
//         }

//         quiz.title = title;
//         await quiz.save();
//         res.status(200).json(quiz);
//     } catch (error) {
//         res.status(400).json({ message: 'Failed to update quiz' });
//     }
// };

// // Update a specific question in the quiz
// const updateQuestionInQuiz = async (req, res) => {
//     try {
//         const { quizId, questionId } = req.params;
//         const { questionText, options } = req.body;

//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: 'Quiz not found' });
//         }

//         const question = quiz.questions.id(questionId);
//         if (!question) {
//             return res.status(404).json({ message: 'Question not found' });
//         }

//         question.questionText = questionText;
//         question.options = options;
//         await quiz.save();

//         res.status(200).json(quiz);
//     } catch (error) {
//         res.status(400).json({ message: 'Failed to update question' });
//     }
// };

// // Get all quizzes
// const getQuizzes = async (req, res) => {
//     try {
//         const quizzes = await Quiz.find();
//         res.status(200).json(quizzes);
//     } catch (error) {
//         res.status(400).json({ message: 'Failed to fetch quizzes' });
//     }
// };

// // Delete a quiz
// const deleteQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params;
//         await Quiz.findByIdAndDelete(quizId);
//         res.status(200).json({ message: 'Quiz deleted successfully' });
//     } catch (error) {
//         res.status(400).json({ message: 'Failed to delete quiz' });
//     }
// };

// // Get a quiz by ID
// const getQuizById = async (req, res) => {
//     try {
//         const quiz = await Quiz.findById(req.params.quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: 'Quiz not found' });
//         }
//         res.status(200).json(quiz);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch quiz' });
//     }
// };

// // This function should be part of your quiz controller
// const submitQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params;
//         const { answers } = req.body;

//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: "Quiz not found" });
//         }

//         let score = 0;
//         const results = quiz.questions.map((question, index) => {
//             // Find the correct option index in the database
//             const correctOptionIndex = question.options.findIndex(option => option.isCorrect);
//             // The user's answer index
//             const userAnswerIndex = answers[index]?.answer;

//             console.log("Correct Option Index: ", correctOptionIndex);
//             console.log("User Answer Index: ", userAnswerIndex);

//             // Check if the user's answer matches the correct option
//             const isCorrect = correctOptionIndex === userAnswerIndex;
//             if (isCorrect) {
//                 score += 1;
//             }

//             return {
//                 questionId: question._id,
//                 questionText: question.questionText,
//                 isCorrect,
//                 correctOptionIndex,
//                 userAnswerIndex
//             };
//         });

//         res.status(200).json({
//             score,
//             totalQuestions: quiz.questions.length,
//             results
//         });
//     } catch (error) {
//         console.error("Error submitting quiz:", error);
//         res.status(500).json({ message: "Failed to submit quiz" });
//     }
// };



// module.exports = {
//     createQuiz,
//     addQuestionToQuiz,
//     updateQuiz,
//     updateQuestionInQuiz,
//     getQuizzes,
//     deleteQuiz,
//     getQuizById,
//     submitQuiz
// };
const Quiz = require('../models/quizModel');
const logActivity = require('../middleware/logActivity'); // Importing the logActivity middleware

// Create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title } = req.body;
        const quiz = new Quiz({
            title,
            createdBy: req.user._id,
        });
        await quiz.save();

        // Log the quiz creation activity
        await logActivity('Quiz Created', `Quiz titled "${title}" was created by Admin`, req.user._id)(req, res, () => { });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create quiz' });
    }
};

// Add a question to an existing quiz
const addQuestionToQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questionText, options } = req.body;

        if (!quizId || !questionText || !options) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'Options should be an array with at least two choices' });
        }

        const invalidOption = options.some(
            (option) => typeof option.optionText !== 'string' || typeof option.isCorrect !== 'boolean'
        );
        if (invalidOption) {
            return res.status(400).json({ message: 'Each option should have an optionText and isCorrect property' });
        }

        quiz.questions.push({ questionText, options });
        await quiz.save();

        // Log the question addition activity
        await logActivity('Question Added', `Question titled "${questionText}" was added to quiz "${quiz.title}"`, req.user._id)(req, res, () => { });

        res.status(201).json(quiz);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(400).json({ message: 'Failed to add question' });
    }
};

// Update quiz title
const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        quiz.title = title;
        await quiz.save();

        // Log the quiz update activity
        await logActivity('Quiz Updated', `Quiz titled "${title}" was updated by Admin`, req.user._id)(req, res, () => { });

        res.status(200).json(quiz);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update quiz' });
    }
};

// Update a specific question in the quiz
const updateQuestionInQuiz = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const { questionText, options } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const question = quiz.questions.id(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.questionText = questionText;
        question.options = options;
        await quiz.save();

        // Log the question update activity
        await logActivity('Question Updated', `Question in quiz titled "${quiz.title}" was updated`, req.user._id)(req, res, () => { });

        res.status(200).json(quiz);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update question' });
    }
};

// Get all quizzes
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(400).json({ message: 'Failed to fetch quizzes' });
    }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findByIdAndDelete(quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Log the quiz deletion activity
        await logActivity('Quiz Deleted', `Quiz titled "${quiz.title}" was deleted by Admin`, req.user._id)(req, res, () => { });

        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to delete quiz' });
    }
};

// Get a quiz by ID
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quiz' });
    }
};

// Submit a quiz
const submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        let score = 0;
        const results = quiz.questions.map((question, index) => {
            const correctOptionIndex = question.options.findIndex(option => option.isCorrect);
            const userAnswerIndex = answers[index]?.answer;

            const isCorrect = correctOptionIndex === userAnswerIndex;
            if (isCorrect) {
                score += 1;
            }

            return {
                questionId: question._id,
                questionText: question.questionText,
                isCorrect,
                correctOptionIndex,
                userAnswerIndex
            };
        });

        // Log the quiz submission activity
        await logActivity('Quiz Submitted', `User ${req.user.username} submitted quiz "${quiz.title}" with score ${score}/${quiz.questions.length}`, req.user._id)(req, res, () => { });

        res.status(200).json({
            score,
            totalQuestions: quiz.questions.length,
            results
        });
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: "Failed to submit quiz" });
    }
};

module.exports = {
    createQuiz,
    addQuestionToQuiz,
    updateQuiz,
    updateQuestionInQuiz,
    getQuizzes,
    deleteQuiz,
    getQuizById,
    submitQuiz
};

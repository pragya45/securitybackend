const express = require('express');
const {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    likeArticle,
    saveArticle,
    getLikedArticles,
    getSavedArticles
} = require('../controllers/articleController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public route: Fetch all articles
router.route('/')
    .post(protect, admin, createArticle)
    .get(getArticles);  // Make this available to all users (no protection)

// Public route: Fetch a single article by ID
router.route('/:id')
    .get(getArticleById)  // No protection here either
    .put(protect, admin, updateArticle)
    .delete(protect, admin, deleteArticle);

// Protected routes for liking and saving articles
router.route('/:id/like').post(protect, likeArticle);
router.route('/:id/save').post(protect, saveArticle);

// Protected routes for fetching liked and saved articles
router.route('/liked').get(protect, getLikedArticles);
router.route('/saved').get(protect, getSavedArticles);

module.exports = router;

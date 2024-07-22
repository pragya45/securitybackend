// const mongoose = require('mongoose');
// const Article = require('../models/articleModel');
// // Create a new article
// const createArticle = async (req, res) => {
//     const { title, content } = req.body;
//     try {
//         const article = new Article({
//             title,
//             content,
//             author: req.user._id
//         });
//         await article.save();
//         res.status(201).json(article);
//     } catch (error) {
//         res.status(400).json({ message: 'Error creating article' });
//     }
// };

// // Get all articles
// const getArticles = async (req, res) => {
//     try {
//         const articles = await Article.find().populate('author', 'username');
//         res.status(200).json(articles);
//     } catch (error) {
//         res.status(400).json({ message: 'Error fetching articles' });
//     }
// };

// // Get single article
// const getArticleById = async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id);
//         if (!article) {
//             return res.status(404).json({ message: 'Article not found' });
//         }
//         res.status(200).json(article);
//     } catch (error) {
//         res.status(400).json({ message: 'Error fetching article' });
//     }
// };

// // Update article
// const updateArticle = async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id);
//         if (!article) {
//             return res.status(404).json({ message: 'Article not found' });
//         }
//         article.title = req.body.title || article.title;
//         article.content = req.body.content || article.content;
//         const updatedArticle = await article.save();
//         res.status(200).json(updatedArticle);
//     } catch (error) {
//         res.status(400).json({ message: 'Error updating article' });
//     }
// };

// // Delete article
// const deleteArticle = async (req, res) => {
//     try {
//         const article = await Article.findByIdAndDelete(req.params.id);
//         if (!article) {
//             return res.status(404).json({ message: 'Article not found' });
//         }
//         res.status(200).json({ message: 'Article removed successfully' });
//     } catch (error) {
//         console.error('Error deleting article:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Like or Unlike an article
// const likeArticle = async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id);
//         if (!article) {
//             return res.status(404).json({ message: 'Article not found' });
//         }

//         // No need to convert req.user._id to ObjectId manually
//         const userId = req.user._id;

//         if (article.likes.includes(userId)) {
//             // If the user has already liked the article, unlike it
//             article.likes = article.likes.filter(id => !id.equals(userId));
//         } else {
//             // If the user hasn't liked it yet, like the article
//             article.likes.push(userId);
//         }

//         await article.save();
//         res.status(200).json(article);
//     } catch (error) {
//         console.error('Error liking article:', error);
//         res.status(500).json({ message: 'Server error while liking article' });
//     }
// };

// // Save or Unsave an article
// const saveArticle = async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id);
//         if (!article) {
//             return res.status(404).json({ message: 'Article not found' });
//         }

//         const userId = req.user._id;

//         if (article.saves.includes(userId)) {
//             // If the user has already saved the article, unsave it
//             article.saves = article.saves.filter(id => !id.equals(userId));
//         } else {
//             // If the user hasn't saved it yet, save the article
//             article.saves.push(userId);
//         }

//         await article.save();
//         res.status(200).json(article);
//     } catch (error) {
//         console.error('Error saving article:', error);
//         res.status(500).json({ message: 'Server error while saving article' });
//     }
// };

// // Get all liked articles by the user
// const getLikedArticles = async (req, res) => {
//     try {
//         const userId = req.user._id; // Ensure the user ID is correctly retrieved
//         console.log('Fetching liked articles for User ID:', userId);

//         // Query to find articles liked by the user
//         const articles = await Article.find({ likes: userId });
//         console.log('Found liked articles:', articles);

//         if (articles.length === 0) {
//             console.log('No liked articles found for User ID:', userId);
//             return res.status(404).json({ message: 'No liked articles found' });
//         }

//         res.status(200).json(articles);
//     } catch (error) {
//         console.error('Error fetching liked articles:', error);
//         res.status(500).json({ message: 'Server error while fetching liked articles' });
//     }
// };

// // Get all saved articles by the user
// const getSavedArticles = async (req, res) => {
//     try {
//         const userId = req.user._id; // Ensure the user ID is correctly retrieved
//         console.log('Fetching saved articles for User ID:', userId);

//         // Query to find articles saved by the user
//         const articles = await Article.find({ saves: userId });
//         console.log('Found saved articles:', articles);

//         if (articles.length === 0) {
//             console.log('No saved articles found for User ID:', userId);
//             return res.status(404).json({ message: 'No saved articles found' });
//         }

//         res.status(200).json(articles);
//     } catch (error) {
//         console.error('Error fetching saved articles:', error);
//         res.status(500).json({ message: 'Server error while fetching saved articles' });
//     }
// };

// module.exports = {
//     createArticle,
//     getArticles,
//     getArticleById,
//     updateArticle,
//     deleteArticle,
//     likeArticle,
//     saveArticle,
//     getLikedArticles,
//     getSavedArticles
// };
const mongoose = require('mongoose');
const Article = require('../models/articleModel');
const logActivity = require('../middleware/logActivity'); // Import the logActivity middleware

// Create a new article
const createArticle = async (req, res) => {
    const { title, content } = req.body;
    try {
        const article = new Article({
            title,
            content,
            author: req.user._id
        });
        await article.save();

        // Log the article creation activity
        await logActivity('Article Created', `Article titled "${title}" was created by Admin`, req.user._id)(req, res, () => {});

        res.status(201).json(article);
    } catch (error) {
        res.status(400).json({ message: 'Error creating article' });
    }
};

// Get all articles
const getArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate('author', 'username');
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching articles' });
    }
};

// Get single article
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching article' });
    }
};

// Update article
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        article.title = req.body.title || article.title;
        article.content = req.body.content || article.content;
        const updatedArticle = await article.save();

        // Log the article update activity
        await logActivity('Article Updated', `Article titled "${updatedArticle.title}" was updated by Admin`, req.user._id)(req, res, () => {});

        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: 'Error updating article' });
    }
};

// Delete article
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Log the article deletion activity
        await logActivity('Article Deleted', `Article titled "${article.title}" was deleted by Admin`, req.user._id)(req, res, () => {});

        res.status(200).json({ message: 'Article removed successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like or Unlike an article
const likeArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const userId = req.user._id;
        let action = '';

        if (article.likes.includes(userId)) {
            // If the user has already liked the article, unlike it
            article.likes = article.likes.filter(id => !id.equals(userId));
            action = 'unliked';
        } else {
            // If the user hasn't liked it yet, like the article
            article.likes.push(userId);
            action = 'liked';
        }

        await article.save();

        // Log the article like/unlike activity
        await logActivity(`Article ${action}`, `User ${req.user.username} ${action} the article titled "${article.title}"`, req.user._id)(req, res, () => {});

        res.status(200).json(article);
    } catch (error) {
        console.error('Error liking article:', error);
        res.status(500).json({ message: 'Server error while liking article' });
    }
};

// Save or Unsave an article
const saveArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const userId = req.user._id;
        let action = '';

        if (article.saves.includes(userId)) {
            // If the user has already saved the article, unsave it
            article.saves = article.saves.filter(id => !id.equals(userId));
            action = 'unsaved';
        } else {
            // If the user hasn't saved it yet, save the article
            article.saves.push(userId);
            action = 'saved';
        }

        await article.save();

        // Log the article save/unsave activity
        await logActivity(`Article ${action}`, `User ${req.user.username} ${action} the article titled "${article.title}"`, req.user._id)(req, res, () => {});

        res.status(200).json(article);
    } catch (error) {
        console.error('Error saving article:', error);
        res.status(500).json({ message: 'Server error while saving article' });
    }
};

// Get all liked articles by the user
const getLikedArticles = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Fetching liked articles for User ID:', userId);

        const articles = await Article.find({ likes: userId });
        console.log('Found liked articles:', articles);

        if (articles.length === 0) {
            console.log('No liked articles found for User ID:', userId);
            return res.status(404).json({ message: 'No liked articles found' });
        }

        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching liked articles:', error);
        res.status(500).json({ message: 'Server error while fetching liked articles' });
    }
};

// Get all saved articles by the user
const getSavedArticles = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Fetching saved articles for User ID:', userId);

        const articles = await Article.find({ saves: userId });
        console.log('Found saved articles:', articles);

        if (articles.length === 0) {
            console.log('No saved articles found for User ID:', userId);
            return res.status(404).json({ message: 'No saved articles found' });
        }

        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching saved articles:', error);
        res.status(500).json({ message: 'Server error while fetching saved articles' });
    }
};

module.exports = {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    likeArticle,
    saveArticle,
    getLikedArticles,
    getSavedArticles
};

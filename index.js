// // const express = require('express');
// // const dotenv = require('dotenv')
// // const connectDB = require('./config/db');
// // const userRoutes = require('./routes/userRoutes');
// // const articleRoutes = require('./routes/articleRoutes');
// // const quizRoutes = require('./routes/quizRoutes');
// // const reportRoutes = require('./routes/reportRoutes');
// // const helmet = require('helmet');
// // const cors = require('cors');
// // const rateLimit = require('express-rate-limit');
// // const path = require('path');
// // const { protect, admin } = require('./middleware/auth');
// // const auditRoutes = require('./routes/auditRoutes');

// // dotenv.config();

// // // Connect to Database
// // connectDB();

// // const app = express();

// // // Set EJS as the view engine
// // app.set('view engine', 'ejs');
// // app.set('views', path.join(__dirname, 'views'));

// // // Middleware
// // app.use(helmet());
// // app.use(cors({
// //     origin: 'http://localhost:3000', // Replace with your frontend domain in production
// //     credentials: true,
// // }));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // require('events').EventEmitter.prototype._maxListeners = 20;

// // const limiter = rateLimit({
// //     windowMs: 15 * 60 * 1000, // 15 minutes
// //     max: 100, // Max requests per IP
// //     message: "Too many requests from this IP, please try again after 15 minutes"
// // });
// // app.use(limiter);

// // // Public Routes (accessible to everyone, including guests)
// // app.use('/api/users', userRoutes);

// // // Protected Routes (requires authentication)
// // app.use('/api/me', protect, (req, res) => res.json({ message: 'Protected route accessed' }));
// // app.use('/api/articles', articleRoutes);

// // // Quiz Routes (protected, but not necessarily admin)
// // app.use('/api/quizzes', protect, quizRoutes);

// // // Report Routes (protected, can be accessed by authenticated users)
// // app.use('/api/reports', protect, reportRoutes);


// // app.use('/api/admin', protect, auditRoutes);

// // // Admin Routes (requires admin role)
// // app.use('/api/admin', protect, admin, (req, res) => res.json({ message: 'Admin route accessed' }));

// // // Catch all route for undefined routes
// // app.use('*', (req, res) => {
// //     res.status(404).json({ message: 'Endpoint not found' });
// // });

// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const userRoutes = require('./routes/userRoutes');
// const articleRoutes = require('./routes/articleRoutes');
// const quizRoutes = require('./routes/quizRoutes');
// const reportRoutes = require('./routes/reportRoutes');
// const helmet = require('helmet');
// const cors = require('cors');
// const rateLimit = require('express-rate-limit');
// const path = require('path');
// const { protect, admin } = require('./middleware/auth');
// const auditRoutes = require('./routes/auditRoutes');

// dotenv.config();

// // Connect to Database
// connectDB();

// const app = express();

// // Set EJS as the view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Middleware
// app.use(helmet());
// app.use(cors({
//     origin: 'http://localhost:3000', // Replace with your frontend domain in production
//     credentials: true,
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// require('events').EventEmitter.prototype._maxListeners = 20;

// // Configure session management
// app.use(session({
//     secret: process.env.SESSION_SECRET, // Add SESSION_SECRET to your .env file
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGO_URI,
//         ttl: 14 * 24 * 60 * 60 // 14 days
//     }),
//     cookie: {
//         secure: process.env.NODE_ENV === 'production', // Set to true in production
//         httpOnly: true,
//         sameSite: 'strict', // CSRF protection
//         maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
//     }
// }));

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Max requests per IP
//     message: "Too many requests from this IP, please try again after 15 minutes"
// });
// app.use(limiter);

// // Public Routes (accessible to everyone, including guests)
// app.use('/api/users', userRoutes);

// // Protected Routes (requires authentication)
// app.use('/api/me', protect, (req, res) => res.json({ message: 'Protected route accessed' }));
// app.use('/api/articles', articleRoutes);

// // Quiz Routes (protected, but not necessarily admin)
// app.use('/api/quizzes', protect, quizRoutes);

// // Report Routes (protected, can be accessed by authenticated users)
// app.use('/api/reports', protect, reportRoutes);

// app.use('/api/admin', protect, auditRoutes);

// // Admin Routes (requires admin role)
// app.use('/api/admin', protect, admin, (req, res) => res.json({ message: 'Admin route accessed' }));

// // Catch all route for undefined routes
// app.use('*', (req, res) => {
//     res.status(404).json({ message: 'Endpoint not found' });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Your existing imports
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const quizRoutes = require('./routes/quizRoutes');
const reportRoutes = require('./routes/reportRoutes');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { protect, admin } = require('./middleware/auth');
const auditRoutes = require('./routes/auditRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend domain in production
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('events').EventEmitter.prototype._maxListeners = 20;

// Configure session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
}));

// **ADD SESSION MANAGEMENT TEST ROUTES HERE**
app.get('/create-session', (req, res) => {
    req.session.userId = 'testUserId';
    res.send('Session created with userId: ' + req.session.userId);
});

app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.send('Session is active for userId: ' + req.session.userId);
    } else {
        res.send('No active session');
    }
});

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);


// Public Routes (accessible to everyone, including guests)
app.use('/api/users', userRoutes);

// Protected Routes (requires authentication)
app.use('/api/me', protect, (req, res) => res.json({ message: 'Protected route accessed' }));
app.use('/api/articles', articleRoutes);

// Quiz Routes (protected, but not necessarily admin)
app.use('/api/quizzes', protect, quizRoutes);

// Report Routes (protected, can be accessed by authenticated users)
app.use('/api/reports', protect, reportRoutes);

app.use('/api/admin', protect, auditRoutes);

// Admin Routes (requires admin role)
app.use('/api/admin', protect, admin, (req, res) => res.json({ message: 'Admin route accessed' }));

// Catch all route for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

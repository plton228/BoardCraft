const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const authMiddleware = require('./authMiddleware');
const {
    registerValidator,
    loginValidator,
    boardValidator,
    elementValidator
} = require('./validators');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'boardcraft_secret_key_13_college';

// ==========================================
// AUTH ROUTER
// ==========================================

router.post('/auth/register', registerValidator, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existing = await db.findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, error: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await db.createUser(username, email, passwordHash);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Server registration error' });
    }
});

router.post('/auth/login', loginValidator, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server authentication error' });
    }
});

// Get currently authenticated user info
router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await db.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server query error' });
    }
});

// ==========================================
// BOARDS ROUTER
// ==========================================

router.get('/boards', authMiddleware, async (req, res) => {
    try {
        const boards = await db.listBoards(req.user.id);
        res.json({ success: true, data: boards });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server query error' });
    }
});

router.post('/boards', authMiddleware, boardValidator, async (req, res) => {
    try {
        const { title, isPublic } = req.body;
        const newBoard = await db.createBoard(title, req.user.id, isPublic || false);
        res.status(201).json({ success: true, data: newBoard });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server creation error' });
    }
});

router.get('/boards/:id', authMiddleware, async (req, res) => {
    try {
        const board = await db.getBoard(req.params.id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }

        // Access check: must be owner or public board
        if (board.ownerId !== req.user.id && !board.isPublic) {
            return res.status(403).json({ success: false, error: 'Forbidden access to private board' });
        }

        res.json({ success: true, data: board });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server retrieval error' });
    }
});

router.put('/boards/:id', authMiddleware, boardValidator, async (req, res) => {
    try {
        const board = await db.getBoard(req.params.id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }

        if (board.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Only owners can update board metadata' });
        }

        const { title, isPublic } = req.body;
        const updated = await db.updateBoard(req.params.id, { title, isPublic });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server update error' });
    }
});

router.delete('/boards/:id', authMiddleware, async (req, res) => {
    try {
        const board = await db.getBoard(req.params.id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }

        if (board.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Only owners can delete boards' });
        }

        await db.deleteBoard(req.params.id);
        res.json({ success: true, message: 'Board successfully deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server deletion error' });
    }
});

// ==========================================
// ELEMENTS ROUTER
// ==========================================

router.get('/boards/:id/elements', authMiddleware, async (req, res) => {
    try {
        const board = await db.getBoard(req.params.id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }

        if (board.ownerId !== req.user.id && !board.isPublic) {
            return res.status(403).json({ success: false, error: 'Access denied to this board elements' });
        }

        const elements = await db.listElements(req.params.id);
        res.json({ success: true, data: elements });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server query error' });
    }
});

// Bulk update / replace elements on board
router.post('/boards/:id/elements', authMiddleware, elementValidator, async (req, res) => {
    try {
        const board = await db.getBoard(req.params.id);
        if (!board) {
            return res.status(404).json({ success: false, error: 'Board not found' });
        }

        // Only owner can update elements, or members if we implement collaboration
        if (board.ownerId !== req.user.id && !board.isPublic) {
            return res.status(403).json({ success: false, error: 'Only owners can modify board elements' });
        }

        const { elements } = req.body;
        const saved = await db.saveElements(req.params.id, elements, req.user.id);
        res.json({ success: true, data: saved });
    } catch (err) {
        console.error('Save elements error:', err);
        res.status(500).json({ success: false, error: 'Server element saving error' });
    }
});

module.exports = router;

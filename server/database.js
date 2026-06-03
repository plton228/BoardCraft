const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOARDS_FILE = path.join(DATA_DIR, 'boards.json');
const ELEMENTS_FILE = path.join(DATA_DIR, 'elements.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function initFile(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
    }
}

initFile(USERS_FILE);
initFile(BOARDS_FILE);
initFile(ELEMENTS_FILE);

// Helpers to read/write JSON files helper
function readJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return [];
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(`Error writing file ${filePath}:`, err);
    }
}

// Generate unique IDs
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const db = {
    // ==========================================
    // USER METHODS
    // ==========================================
    async findUserByEmail(email) {
        const users = readJSON(USERS_FILE);
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    async findUserById(id) {
        const users = readJSON(USERS_FILE);
        return users.find(u => u.id === id);
    },

    async createUser(username, email, passwordHash) {
        const users = readJSON(USERS_FILE);
        const newUser = {
            id: generateId(),
            username,
            email,
            passwordHash,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        writeJSON(USERS_FILE, users);
        return newUser;
    },

    // ==========================================
    // BOARD METHODS
    // ==========================================
    async listBoards(userId) {
        const boards = readJSON(BOARDS_FILE);
        // Return boards owned by user or where user is a member, or public boards
        return boards.filter(b => b.ownerId === userId || b.isPublic);
    },

    async getBoard(boardId) {
        const boards = readJSON(BOARDS_FILE);
        return boards.find(b => b.id === boardId);
    },

    async createBoard(title, ownerId, isPublic = false) {
        const boards = readJSON(BOARDS_FILE);
        const newBoard = {
            id: generateId(),
            title,
            ownerId,
            isPublic,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        boards.push(newBoard);
        writeJSON(BOARDS_FILE, boards);
        return newBoard;
    },

    async updateBoard(boardId, data) {
        const boards = readJSON(BOARDS_FILE);
        const index = boards.findIndex(b => b.id === boardId);
        if (index === -1) return null;

        boards[index] = {
            ...boards[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        writeJSON(BOARDS_FILE, boards);
        return boards[index];
    },

    async deleteBoard(boardId) {
        let boards = readJSON(BOARDS_FILE);
        const index = boards.findIndex(b => b.id === boardId);
        if (index === -1) return false;

        boards = boards.filter(b => b.id !== boardId);
        writeJSON(BOARDS_FILE, boards);

        // Also clean up board elements
        let elements = readJSON(ELEMENTS_FILE);
        elements = elements.filter(el => el.boardId !== boardId);
        writeJSON(ELEMENTS_FILE, elements);

        return true;
    },

    // ==========================================
    // ELEMENT METHODS
    // ==========================================
    async listElements(boardId) {
        const elements = readJSON(ELEMENTS_FILE);
        return elements.filter(el => el.boardId === boardId);
    },

    async addElement(boardId, elementData, userId) {
        const elements = readJSON(ELEMENTS_FILE);
        const newElement = {
            id: elementData.id || generateId(),
            boardId,
            type: elementData.type,
            x: elementData.x || 0,
            y: elementData.y || 0,
            width: elementData.width || 0,
            height: elementData.height || 0,
            color: elementData.color || '#000000',
            content: elementData.content || '',
            zIndex: elementData.zIndex || 0,
            updatedBy: userId,
            updatedAt: new Date().toISOString()
        };
        elements.push(newElement);
        writeJSON(ELEMENTS_FILE, elements);
        return newElement;
    },

    async saveElements(boardId, elementsArray, userId) {
        let elements = readJSON(ELEMENTS_FILE);
        
        // Remove existing elements for this board
        elements = elements.filter(el => el.boardId !== boardId);
        
        // Add new elements
        const resolvedElements = elementsArray.map(el => ({
            id: el.id || generateId(),
            boardId,
            type: el.type,
            x: el.x || 0,
            y: el.y || 0,
            width: el.width || 0,
            height: el.height || 0,
            color: el.color || '#000000',
            content: el.content || '',
            zIndex: el.zIndex || 0,
            updatedBy: userId,
            updatedAt: new Date().toISOString()
        }));

        elements.push(...resolvedElements);
        writeJSON(ELEMENTS_FILE, elements);
        return resolvedElements;
    },

    async deleteElement(boardId, elementId) {
        let elements = readJSON(ELEMENTS_FILE);
        const initialLen = elements.length;
        elements = elements.filter(el => !(el.boardId === boardId && el.id === elementId));
        writeJSON(ELEMENTS_FILE, elements);
        return elements.length < initialLen;
    }
};

module.exports = db;

# Todo Application - Implementation Guide

This guide provides step-by-step instructions and code examples for implementing the todo application.

---

## Quick Start Checklist

- [ ] Create project directory structure
- [ ] Set up Python virtual environment
- [ ] Install backend dependencies
- [ ] Create backend files
- [ ] Create frontend files
- [ ] Test the application
- [ ] Initialize git repository

---

## Step 1: Create Project Structure

```bash
# Create main project directory
mkdir todo-app
cd todo-app

# Create backend directory and files
mkdir -p backend/instance
touch backend/app.py
touch backend/models.py
touch backend/config.py
touch backend/requirements.txt

# Create frontend directory and files
mkdir -p frontend/css
mkdir -p frontend/js
touch frontend/index.html
touch frontend/css/styles.css
touch frontend/js/app.js
touch frontend/js/api.js

# Create root files
touch .gitignore
touch README.md
```

---

## Step 2: Backend Implementation

### File: [`backend/requirements.txt`](backend/requirements.txt)

```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
```

### File: [`backend/config.py`](backend/config.py)

```python
import os

class Config:
    """Application configuration"""
    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///todos.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = True
```

### File: [`backend/models.py`](backend/models.py)

```python
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Todo(db.Model):
    """Todo model for storing todo items"""
    __tablename__ = 'todos'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert todo object to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Todo {self.id}: {self.title}>'
```

### File: [`backend/app.py`](backend/app.py)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Todo

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

# Helper function for error responses
def error_response(message, status_code=400):
    return jsonify({'success': False, 'error': message}), status_code

# Helper function for success responses
def success_response(data, status_code=200):
    return jsonify({'success': True, 'data': data}), status_code

# Routes

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos"""
    try:
        todos = Todo.query.order_by(Todo.created_at.desc()).all()
        return success_response([todo.to_dict() for todo in todos])
    except Exception as e:
        return error_response(str(e), 500)

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return error_response('Todo not found', 404)
        return success_response(todo.to_dict())
    except Exception as e:
        return error_response(str(e), 500)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'title' not in data:
            return error_response('Title is required', 400)
        
        title = data['title'].strip()
        if not title:
            return error_response('Title cannot be empty', 400)
        
        if len(title) > 200:
            return error_response('Title must be 200 characters or less', 400)
        
        # Create new todo
        todo = Todo(title=title)
        db.session.add(todo)
        db.session.commit()
        
        return success_response(todo.to_dict(), 201)
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update an existing todo"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return error_response('Todo not found', 404)
        
        data = request.get_json()
        if not data:
            return error_response('No data provided', 400)
        
        # Update title if provided
        if 'title' in data:
            title = data['title'].strip()
            if not title:
                return error_response('Title cannot be empty', 400)
            if len(title) > 200:
                return error_response('Title must be 200 characters or less', 400)
            todo.title = title
        
        # Update completed status if provided
        if 'completed' in data:
            if not isinstance(data['completed'], bool):
                return error_response('Completed must be a boolean', 400)
            todo.completed = data['completed']
        
        db.session.commit()
        return success_response(todo.to_dict())
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return error_response('Todo not found', 404)
        
        db.session.delete(todo)
        db.session.commit()
        
        return success_response({'message': 'Todo deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return error_response('Resource not found', 404)

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return error_response('Internal server error', 500)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## Step 3: Frontend Implementation

### File: [`frontend/index.html`](frontend/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📝 My Todo List</h1>
        </header>

        <main>
            <!-- Add Todo Form -->
            <form id="todo-form" class="todo-form">
                <input 
                    type="text" 
                    id="todo-input" 
                    placeholder="What needs to be done?" 
                    maxlength="200"
                    required
                >
                <button type="submit" class="btn btn-primary">Add</button>
            </form>

            <!-- Todo List -->
            <div id="todo-list" class="todo-list">
                <!-- Todos will be dynamically inserted here -->
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="empty-state" style="display: none;">
                <p>🎉 No todos yet! Add one above to get started.</p>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="error-message" style="display: none;"></div>
        </main>

        <footer>
            <p>Built with Flask & JavaScript</p>
        </footer>
    </div>

    <script src="js/api.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

### File: [`frontend/css/styles.css`](frontend/css/styles.css)

```css
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
    color: #333;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* Header */
header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

header h1 {
    font-size: 2rem;
    font-weight: 600;
}

/* Main Content */
main {
    padding: 30px;
}

/* Todo Form */
.todo-form {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
}

#todo-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

#todo-input:focus {
    outline: none;
    border-color: #667eea;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: #f0f0f0;
    color: #666;
    padding: 8px 16px;
    font-size: 0.875rem;
}

.btn-secondary:hover {
    background: #e0e0e0;
}

.btn-danger {
    background: #ff6b6b;
    color: white;
    padding: 8px 16px;
    font-size: 0.875rem;
}

.btn-danger:hover {
    background: #ff5252;
}

/* Todo List */
.todo-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s;
}

.todo-item:hover {
    background: #f0f0f0;
    transform: translateX(4px);
}

.todo-item.completed {
    opacity: 0.6;
}

.todo-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.todo-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
}

.todo-text {
    flex: 1;
    font-size: 1rem;
    color: #333;
}

.todo-item.completed .todo-text {
    text-decoration: line-through;
    color: #999;
}

.todo-input-edit {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid #667eea;
    border-radius: 6px;
    font-size: 1rem;
}

.todo-actions {
    display: flex;
    gap: 8px;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #999;
}

.empty-state p {
    font-size: 1.1rem;
}

/* Error Message */
.error-message {
    background: #ffebee;
    color: #c62828;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #c62828;
}

/* Footer */
footer {
    background: #f8f9fa;
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: 0.875rem;
}

/* Loading State */
.loading {
    text-align: center;
    padding: 20px;
    color: #999;
}

/* Responsive Design */
@media (max-width: 640px) {
    .container {
        border-radius: 0;
    }
    
    header h1 {
        font-size: 1.5rem;
    }
    
    main {
        padding: 20px;
    }
    
    .todo-form {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}
```

### File: [`frontend/js/api.js`](frontend/js/api.js)

```javascript
/**
 * API communication layer for the Todo application
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * API methods
 */
const api = {
    /**
     * Get all todos
     */
    getTodos: async () => {
        return fetchAPI('/todos');
    },

    /**
     * Get a specific todo by ID
     */
    getTodo: async (id) => {
        return fetchAPI(`/todos/${id}`);
    },

    /**
     * Create a new todo
     */
    createTodo: async (title) => {
        return fetchAPI('/todos', {
            method: 'POST',
            body: JSON.stringify({ title }),
        });
    },

    /**
     * Update a todo
     */
    updateTodo: async (id, updates) => {
        return fetchAPI(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a todo
     */
    deleteTodo: async (id) => {
        return fetchAPI(`/todos/${id}`, {
            method: 'DELETE',
        });
    },
};
```

### File: [`frontend/js/app.js`](frontend/js/app.js)

```javascript
/**
 * Main application logic for the Todo app
 */

// DOM elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const errorMessage = document.getElementById('error-message');

// State
let todos = [];
let editingTodoId = null;

/**
 * Initialize the application
 */
async function init() {
    await loadTodos();
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    todoForm.addEventListener('submit', handleAddTodo);
}

/**
 * Load todos from the API
 */
async function loadTodos() {
    try {
        showLoading();
        const response = await api.getTodos();
        todos = response.data;
        renderTodos();
    } catch (error) {
        showError('Failed to load todos. Please refresh the page.');
    }
}

/**
 * Handle adding a new todo
 */
async function handleAddTodo(e) {
    e.preventDefault();
    
    const title = todoInput.value.trim();
    if (!title) return;

    try {
        const response = await api.createTodo(title);
        todos.unshift(response.data);
        todoInput.value = '';
        renderTodos();
        hideError();
    } catch (error) {
        showError(error.message || 'Failed to create todo');
    }
}

/**
 * Handle toggling todo completion
 */
async function handleToggleTodo(id) {
    try {
        const todo = todos.find(t => t.id === id);
        const response = await api.updateTodo(id, { completed: !todo.completed });
        
        const index = todos.findIndex(t => t.id === id);
        todos[index] = response.data;
        renderTodos();
    } catch (error) {
        showError('Failed to update todo');
    }
}

/**
 * Handle editing a todo
 */
function handleEditTodo(id) {
    editingTodoId = id;
    renderTodos();
}

/**
 * Handle saving edited todo
 */
async function handleSaveTodo(id, newTitle) {
    if (!newTitle.trim()) {
        showError('Todo title cannot be empty');
        return;
    }

    try {
        const response = await api.updateTodo(id, { title: newTitle });
        
        const index = todos.findIndex(t => t.id === id);
        todos[index] = response.data;
        editingTodoId = null;
        renderTodos();
        hideError();
    } catch (error) {
        showError(error.message || 'Failed to update todo');
    }
}

/**
 * Handle canceling edit
 */
function handleCancelEdit() {
    editingTodoId = null;
    renderTodos();
}

/**
 * Handle deleting a todo
 */
async function handleDeleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        await api.deleteTodo(id);
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    } catch (error) {
        showError('Failed to delete todo');
    }
}

/**
 * Render todos to the DOM
 */
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    todoList.innerHTML = todos.map(todo => {
        const isEditing = editingTodoId === todo.id;
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="handleToggleTodo(${todo.id})"
                >
                <div class="todo-content">
                    ${isEditing ? `
                        <input 
                            type="text" 
                            class="todo-input-edit" 
                            value="${escapeHtml(todo.title)}"
                            id="edit-input-${todo.id}"
                            maxlength="200"
                        >
                    ` : `
                        <span class="todo-text">${escapeHtml(todo.title)}</span>
                    `}
                </div>
                <div class="todo-actions">
                    ${isEditing ? `
                        <button class="btn btn-primary" onclick="handleSaveTodo(${todo.id}, document.getElementById('edit-input-${todo.id}').value)">
                            Save
                        </button>
                        <button class="btn btn-secondary" onclick="handleCancelEdit()">
                            Cancel
                        </button>
                    ` : `
                        <button class="btn btn-secondary" onclick="handleEditTodo(${todo.id})">
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="handleDeleteTodo(${todo.id})">
                            Delete
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Show loading state
 */
function showLoading() {
    todoList.innerHTML = '<div class="loading">Loading todos...</div>';
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(hideError, 5000);
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
```

---

## Step 4: Additional Files

### File: [`.gitignore`](.gitignore)

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
*.egg
*.egg-info/
dist/
build/
venv/
env/
ENV/

# Flask
instance/
.env
.flaskenv

# Database
*.db
*.sqlite
*.sqlite3

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

### File: [`README.md`](README.md)

```markdown
# Todo Application

A simple todo application built with Flask backend and vanilla JavaScript frontend.

## Features

- Create new todos
- Mark todos as complete/incomplete
- Edit todo titles
- Delete todos
- Persistent storage with SQLite

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```

   Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Start a local server:
   ```bash
   python -m http.server 8000
   ```

   Frontend will run on http://localhost:8000

3. Open http://localhost:8000 in your browser

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/<id>` - Get specific todo
- `POST /api/todos` - Create new todo
- `PUT /api/todos/<id>` - Update todo
- `DELETE /api/todos/<id>` - Delete todo

## Technology Stack

- **Backend**: Flask, SQLAlchemy, SQLite
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: RESTful with JSON

## Project Structure

```
todo-app/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── app.js
│       └── api.js
└── README.md
```

## License

MIT
```

---

## Step 5: Running the Application

### Terminal 1 - Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Terminal 2 - Frontend

```bash
cd frontend
python -m http.server 8000
```

### Access the Application

Open your browser and navigate to: http://localhost:8000

---

## Testing Checklist

After implementation, test these features:

- [ ] Add a new todo
- [ ] View the todo in the list
- [ ] Mark todo as complete
- [ ] Mark todo as incomplete
- [ ] Edit todo title
- [ ] Delete todo
- [ ] Refresh page (data should persist)
- [ ] Try adding empty todo (should show error)
- [ ] Try adding very long todo (should be limited to 200 chars)

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`
**Solution**: Make sure virtual environment is activated and dependencies are installed

**Problem**: Database errors
**Solution**: Delete `instance/todos.db` and restart the backend

### Frontend Issues

**Problem**: CORS errors in browser console
**Solution**: Ensure Flask-CORS is installed and backend is running

**Problem**: API requests failing
**Solution**: Check that backend is running on port 5000

---

## Next Steps

Once the basic application is working, you can:

1. Add due dates for todos
2. Implement categories or tags
3. Add priority levels
4. Implement search functionality
5. Add user authentication
6. Deploy to production

---

This implementation guide provides all the code needed to build a fully functional todo application. Follow the steps in order, and you'll have a working application!
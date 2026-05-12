# Todo Application - Project Plan

## Overview
A simple todo application with Flask backend and JavaScript frontend, using SQLite database for data persistence.

---

## 1. Project Directory Structure

```
todo-app/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   └── instance/
│       └── todos.db          # SQLite database (auto-generated)
├── frontend/
│   ├── index.html            # Main HTML page
│   ├── css/
│   │   └── styles.css        # Application styles
│   └── js/
│       ├── app.js            # Main application logic
│       └── api.js            # API communication layer
├── .gitignore
└── README.md
```

---

## 2. Database Schema

### Todo Table

| Column      | Type         | Constraints                    | Description                    |
|-------------|--------------|--------------------------------|--------------------------------|
| id          | INTEGER      | PRIMARY KEY, AUTOINCREMENT     | Unique identifier              |
| title       | VARCHAR(200) | NOT NULL                       | Todo title/description         |
| completed   | BOOLEAN      | NOT NULL, DEFAULT FALSE        | Completion status              |
| created_at  | DATETIME     | NOT NULL, DEFAULT CURRENT_TIME | Creation timestamp             |
| updated_at  | DATETIME     | NOT NULL, DEFAULT CURRENT_TIME | Last update timestamp          |

**SQLAlchemy Model Structure:**
```python
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

---

## 3. REST API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint        | Description              | Request Body                    | Response                        |
|--------|-----------------|--------------------------|----------------------------------|----------------------------------|
| GET    | `/todos`        | Get all todos            | None                            | `[{id, title, completed, ...}]` |
| GET    | `/todos/<id>`   | Get specific todo        | None                            | `{id, title, completed, ...}`   |
| POST   | `/todos`        | Create new todo          | `{title: string}`               | `{id, title, completed, ...}`   |
| PUT    | `/todos/<id>`   | Update todo              | `{title?, completed?}`          | `{id, title, completed, ...}`   |
| DELETE | `/todos/<id>`   | Delete todo              | None                            | `{message: "success"}`          |

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* todo object or array */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Example API Calls

**Create Todo:**
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries"
}
```

**Update Todo:**
```bash
PUT /api/todos/1
Content-Type: application/json

{
  "completed": true
}
```

---

## 4. Technology Stack

### Backend
- **Framework:** Flask 3.0+
- **Database ORM:** SQLAlchemy 2.0+
- **Database:** SQLite 3
- **CORS:** Flask-CORS (for cross-origin requests)
- **Python Version:** 3.8+

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with Flexbox/Grid)
- **Vanilla JavaScript (ES6+)** - Logic and interactivity
- **Fetch API** - HTTP requests to backend

### Development Tools
- **Backend Server:** Flask development server
- **Frontend Server:** Python's built-in HTTP server or Live Server
- **Version Control:** Git

---

## 5. Backend Architecture

### Flask Application Structure

```
Backend Flow:
┌─────────────┐
│   app.py    │  Main application entry point
│             │  - Initialize Flask app
│             │  - Configure CORS
│             │  - Register routes
└──────┬──────┘
       │
       ├──────────────┐
       │              │
┌──────▼──────┐  ┌───▼────────┐
│  models.py  │  │ config.py  │
│             │  │            │
│ - Todo      │  │ - DB URI   │
│   Model     │  │ - Settings │
└─────────────┘  └────────────┘
```

### Key Components

1. **[`app.py`](backend/app.py)** - Main application file
   - Initialize Flask app and SQLAlchemy
   - Configure CORS for frontend communication
   - Define API routes and handlers
   - Error handling

2. **[`models.py`](backend/models.py)** - Database models
   - Define Todo model with SQLAlchemy
   - Include serialization methods

3. **[`config.py`](backend/config.py)** - Configuration
   - Database URI
   - Environment-specific settings

---

## 6. Frontend Architecture

### Application Flow

```
User Interface Flow:
┌──────────────┐
│  index.html  │  Main page structure
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
┌──────▼──────┐   ┌──────▼──────┐   ┌─────▼──────┐
│ styles.css  │   │   app.js    │   │  api.js    │
│             │   │             │   │            │
│ - Layout    │   │ - UI Logic  │   │ - Fetch    │
│ - Styling   │   │ - Events    │   │ - Requests │
└─────────────┘   │ - Rendering │   └────────────┘
                  └─────────────┘
```

### Key Components

1. **[`index.html`](frontend/index.html)** - Main HTML structure
   - Todo input form
   - Todo list container
   - Basic semantic HTML

2. **[`css/styles.css`](frontend/css/styles.css)** - Styling
   - Modern, clean design
   - Responsive layout
   - Visual feedback for interactions

3. **[`js/api.js`](frontend/js/api.js)** - API communication
   - Fetch wrapper functions
   - Error handling
   - Base URL configuration

4. **[`js/app.js`](frontend/js/app.js)** - Application logic
   - DOM manipulation
   - Event handlers
   - State management
   - UI updates

---

## 7. Features Implementation

### Core Features
- ✅ Create new todos
- ✅ View all todos
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo titles
- ✅ Delete todos
- ✅ Persist data in SQLite database

### UI Features
- Input field for new todos
- List display with checkboxes
- Edit button for each todo
- Delete button for each todo
- Visual distinction for completed todos
- Empty state message

---

## 8. Setup Instructions

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask application
python app.py
```

Backend will run on: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Option 1: Use Python's built-in server
python -m http.server 8000

# Option 2: Use VS Code Live Server extension
# Right-click index.html and select "Open with Live Server"
```

Frontend will run on: `http://localhost:8000`

---

## 9. Dependencies

### Backend (`requirements.txt`)
```
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
```

### Frontend
No external dependencies - uses vanilla JavaScript and native browser APIs.

---

## 10. Development Workflow

1. **Start Backend Server**
   - Activate virtual environment
   - Run Flask app
   - Database will be created automatically on first run

2. **Start Frontend Server**
   - Open frontend in browser
   - Ensure CORS is configured correctly

3. **Development Cycle**
   - Make changes to code
   - Backend: Flask auto-reloads in debug mode
   - Frontend: Refresh browser to see changes

---

## 11. Testing Strategy

### Manual Testing Checklist
- [ ] Create a new todo
- [ ] View all todos
- [ ] Mark todo as complete
- [ ] Mark todo as incomplete
- [ ] Edit todo title
- [ ] Delete todo
- [ ] Refresh page (data persists)
- [ ] Test with empty database
- [ ] Test error handling (invalid requests)

---

## 12. Future Enhancements (Optional)

If you want to expand the application later:
- Add due dates for todos
- Implement categories/tags
- Add priority levels
- Search and filter functionality
- User authentication
- Multiple todo lists
- Dark mode toggle
- Export/import todos

---

## 13. Git Configuration

### `.gitignore`
```
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
*.so

# Flask
instance/
.env

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## Summary

This plan provides a complete blueprint for building a simple, functional todo application with:
- Clean separation between frontend and backend
- RESTful API design
- Persistent data storage with SQLite
- Modern JavaScript frontend
- Easy setup and deployment

The architecture is simple enough for quick development but structured well enough to allow for future enhancements.
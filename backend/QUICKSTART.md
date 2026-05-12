# Quick Start Guide - Flask Backend

Get your Todo API up and running in 3 minutes!

## 🚀 Quick Setup

### Step 1: Create Virtual Environment
```bash
cd backend
python -m venv venv
```

### Step 2: Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Server
```bash
python app.py
```

✅ **Server is now running at:** `http://localhost:5000`

## 🧪 Test the API

### Option 1: Using cURL

**Create a todo:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Todo", "description": "Testing the API"}'
```

**Get all todos:**
```bash
curl http://localhost:5000/api/todos
```

### Option 2: Using Browser

Open your browser and visit:
- Health check: http://localhost:5000/api/health
- Get all todos: http://localhost:5000/api/todos

### Option 3: Using Python

```python
import requests

# Create a todo
response = requests.post(
    'http://localhost:5000/api/todos',
    json={'title': 'Test Todo', 'description': 'This is a test'}
)
print(response.json())
```

## 📁 What Was Created?

After running the server, you'll see:
- `todos.db` - SQLite database file (auto-generated)
- `__pycache__/` - Python cache directory (auto-generated)

## 🔧 Common Commands

**Stop the server:**
- Press `Ctrl + C` in the terminal

**Deactivate virtual environment:**
```bash
deactivate
```

**Reset database:**
```bash
rm todos.db
python app.py  # Database will be recreated
```

## 📊 API Endpoints Summary

| Method | Endpoint           | Description      |
|--------|-------------------|------------------|
| GET    | /api/todos        | Get all todos    |
| GET    | /api/todos/:id    | Get single todo  |
| POST   | /api/todos        | Create todo      |
| PUT    | /api/todos/:id    | Update todo      |
| DELETE | /api/todos/:id    | Delete todo      |
| GET    | /api/health       | Health check     |

## ✅ Verification Checklist

- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000/api/health
- [ ] Can create a todo via API
- [ ] Can retrieve todos via API

## 🐛 Troubleshooting

**Problem:** `command not found: python`
**Solution:** Try `python3` instead of `python`

**Problem:** Port 5000 already in use
**Solution:** Change port in `app.py` line 223: `app.run(debug=True, port=5001)`

**Problem:** Module not found errors
**Solution:** Ensure virtual environment is activated and run `pip install -r requirements.txt`

## 📚 Next Steps

1. ✅ Backend is running
2. 📱 Create the frontend (HTML/CSS/JavaScript)
3. 🔗 Connect frontend to this backend API
4. 🎉 Start building your todo app!

For detailed API documentation, see [README.md](README.md)
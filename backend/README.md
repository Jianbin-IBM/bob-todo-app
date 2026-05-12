# Todo App - Flask Backend

A RESTful API backend for the Todo application built with Flask and SQLAlchemy.

## Features

- RESTful API with CRUD operations
- SQLite database with SQLAlchemy ORM
- CORS enabled for frontend integration
- Input validation and error handling
- Todo model with title, description, completed status, and timestamp

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Setup Instructions

### 1. Create Virtual Environment

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
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Application

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Get All Todos
```http
GET /api/todos
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

#### 2. Get Single Todo
```http
GET /api/todos/<id>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2024-01-15T10:30:00"
  }
}
```

#### 3. Create Todo
```http
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2024-01-15T10:30:00"
  }
}
```

#### 4. Update Todo
```http
PUT /api/todos/<id>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Updated description",
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Updated description",
    "completed": true,
    "created_at": "2024-01-15T10:30:00"
  }
}
```

#### 5. Delete Todo
```http
DELETE /api/todos/<id>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Todo deleted successfully"
  }
}
```

#### 6. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Todo API is running"
  }
}
```

## Database Schema

### Todo Table

| Column      | Type         | Constraints           | Description                    |
|-------------|--------------|----------------------|--------------------------------|
| id          | INTEGER      | PRIMARY KEY          | Unique identifier              |
| title       | VARCHAR(200) | NOT NULL             | Todo title                     |
| description | VARCHAR(500) | NULLABLE             | Detailed description           |
| completed   | BOOLEAN      | NOT NULL, DEFAULT 0  | Completion status              |
| created_at  | DATETIME     | NOT NULL             | Creation timestamp             |

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── models.py           # SQLAlchemy Todo model
├── database.py         # Database initialization
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── todos.db           # SQLite database (auto-generated)
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

- `400` - Bad Request (validation errors)
- `404` - Not Found (todo doesn't exist)
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Validation Rules

### Title
- Required field
- Cannot be empty
- Maximum 200 characters

### Description
- Optional field
- Maximum 500 characters

### Completed
- Must be a boolean value (true/false)

## Testing the API

### Using cURL

**Create a todo:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo", "description": "This is a test"}'
```

**Get all todos:**
```bash
curl http://localhost:5000/api/todos
```

**Update a todo:**
```bash
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Delete a todo:**
```bash
curl -X DELETE http://localhost:5000/api/todos/1
```

### Using Python requests

```python
import requests

# Create todo
response = requests.post(
    'http://localhost:5000/api/todos',
    json={'title': 'Test Todo', 'description': 'Test description'}
)
print(response.json())

# Get all todos
response = requests.get('http://localhost:5000/api/todos')
print(response.json())
```

## Development

### Debug Mode

The application runs in debug mode by default, which provides:
- Auto-reload on code changes
- Detailed error messages
- Interactive debugger

To disable debug mode for production:
```python
app.run(debug=False, port=5000)
```

### Database Management

The database is automatically created when you first run the application.

To reset the database:
```bash
# Stop the server
# Delete the database file
rm todos.db
# Restart the server (database will be recreated)
python app.py
```

## Troubleshooting

### Issue: Module not found errors
**Solution:** Make sure virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Issue: Port already in use
**Solution:** Either stop the process using port 5000 or change the port:
```python
app.run(debug=True, port=5001)
```

### Issue: CORS errors from frontend
**Solution:** Ensure Flask-CORS is installed and the frontend URL is allowed

### Issue: Database locked
**Solution:** Close all connections to the database and restart the server

## Security Considerations

⚠️ **Important for Production:**

1. Change the `SECRET_KEY` in `app.py`
2. Set `debug=False` in production
3. Use environment variables for sensitive configuration
4. Implement authentication if needed
5. Add rate limiting
6. Use HTTPS in production
7. Validate and sanitize all inputs

## Testing

The backend includes a comprehensive test suite with >90% code coverage.

### Run Tests

**Quick Start:**
```bash
# Unix/macOS
./run_tests.sh

# Windows
run_tests.bat

# Manual
pytest
```

### Test Coverage

- 50+ comprehensive tests
- All API endpoints tested
- Error cases covered
- Integration tests included
- >90% code coverage

For detailed testing documentation, see [TESTING.md](TESTING.md)

### Test Structure

```
backend/
├── conftest.py          # Test fixtures
├── test_api.py          # Test suite (50+ tests)
├── pytest.ini           # Pytest configuration
├── run_tests.sh         # Test runner (Unix/macOS)
└── run_tests.bat        # Test runner (Windows)
```

## Next Steps

- Add user authentication
- Implement pagination for large todo lists
- Add filtering and sorting options
- Add due dates and priorities
- Implement todo categories/tags
- Add file attachments support

## License

MIT
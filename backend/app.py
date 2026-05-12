from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db, init_db
from models import Todo

# Initialize Flask application
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Enable CORS for all routes
CORS(app)

# Initialize database
init_db(app)

# Helper functions for responses
def success_response(data, status_code=200):
    """Create a success response."""
    return jsonify({'success': True, 'data': data}), status_code

def error_response(message, status_code=400):
    """Create an error response."""
    return jsonify({'success': False, 'error': message}), status_code

# Routes

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """
    Get all todos.
    
    Returns:
        JSON response with list of all todos
    """
    try:
        todos = Todo.query.order_by(Todo.created_at.desc()).all()
        return success_response([todo.to_dict() for todo in todos])
    except Exception as e:
        return error_response(f'Failed to fetch todos: {str(e)}', 500)

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """
    Get a specific todo by ID.
    
    Args:
        todo_id: ID of the todo to retrieve
        
    Returns:
        JSON response with the todo data
    """
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return error_response('Todo not found', 404)
        return success_response(todo.to_dict())
    except Exception as e:
        return error_response(f'Failed to fetch todo: {str(e)}', 500)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """
    Create a new todo.
    
    Expected JSON body:
        {
            "title": "Todo title (required)",
            "description": "Todo description (optional)"
        }
        
    Returns:
        JSON response with the created todo
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return error_response('No data provided', 400)
        
        if 'title' not in data:
            return error_response('Title is required', 400)
        
        title = data['title'].strip()
        if not title:
            return error_response('Title cannot be empty', 400)
        
        if len(title) > 200:
            return error_response('Title must be 200 characters or less', 400)
        
        # Get optional description
        description = data.get('description', '').strip() if data.get('description') else None
        if description and len(description) > 500:
            return error_response('Description must be 500 characters or less', 400)
        
        # Create new todo
        todo = Todo(title=title, description=description)
        db.session.add(todo)
        db.session.commit()
        
        return success_response(todo.to_dict(), 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create todo: {str(e)}', 500)

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """
    Update an existing todo.
    
    Args:
        todo_id: ID of the todo to update
        
    Expected JSON body (all fields optional):
        {
            "title": "Updated title",
            "description": "Updated description",
            "completed": true/false
        }
        
    Returns:
        JSON response with the updated todo
    """
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
        
        # Update description if provided
        if 'description' in data:
            description = data['description'].strip() if data['description'] else None
            if description and len(description) > 500:
                return error_response('Description must be 500 characters or less', 400)
            todo.description = description
        
        # Update completed status if provided
        if 'completed' in data:
            if not isinstance(data['completed'], bool):
                return error_response('Completed must be a boolean', 400)
            todo.completed = data['completed']
        
        db.session.commit()
        return success_response(todo.to_dict())
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update todo: {str(e)}', 500)

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """
    Delete a todo.
    
    Args:
        todo_id: ID of the todo to delete
        
    Returns:
        JSON response confirming deletion
    """
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return error_response('Todo not found', 404)
        
        db.session.delete(todo)
        db.session.commit()
        
        return success_response({'message': 'Todo deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete todo: {str(e)}', 500)

# Error handlers

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return error_response('Resource not found', 404)

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    db.session.rollback()
    return error_response('Internal server error', 500)

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return error_response('Method not allowed', 405)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return success_response({'status': 'healthy', 'message': 'Todo API is running'})

if __name__ == '__main__':
    print("Starting Flask Todo API server...")
    print("Server running on http://localhost:5000")
    print("API endpoints available at http://localhost:5000/api/todos")
    app.run(debug=True, port=5000)

# Made with Bob

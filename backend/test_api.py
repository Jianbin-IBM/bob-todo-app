"""
Comprehensive unit tests for the Todo API endpoints.
Tests all CRUD operations and edge cases.
"""
import json
import pytest
from models import Todo
from database import db


class TestHealthEndpoint:
    """Tests for the health check endpoint."""
    
    def test_health_check(self, client):
        """Test that health check endpoint returns success."""
        response = client.get('/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'status' in data['data']
        assert data['data']['status'] == 'healthy'


class TestGetTodos:
    """Tests for GET /api/todos endpoint."""
    
    def test_get_empty_todos(self, client):
        """Test getting todos when database is empty."""
        response = client.get('/api/todos')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data'] == []
    
    def test_get_single_todo(self, client, sample_todo):
        """Test getting todos when one exists."""
        response = client.get('/api/todos')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert len(data['data']) == 1
        assert data['data'][0]['title'] == 'Sample Todo'
        assert data['data'][0]['description'] == 'This is a sample todo for testing'
        assert data['data'][0]['completed'] is False
    
    def test_get_multiple_todos(self, client, multiple_todos):
        """Test getting multiple todos."""
        response = client.get('/api/todos')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert len(data['data']) == 3
        
        # Verify todos are ordered by created_at desc (newest first)
        titles = [todo['title'] for todo in data['data']]
        assert 'Todo 3' in titles
        assert 'Todo 2' in titles
        assert 'Todo 1' in titles


class TestGetSingleTodo:
    """Tests for GET /api/todos/<id> endpoint."""
    
    def test_get_existing_todo(self, client, sample_todo):
        """Test getting a specific todo that exists."""
        response = client.get(f'/api/todos/{sample_todo}')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['id'] == sample_todo
        assert data['data']['title'] == 'Sample Todo'
        assert data['data']['description'] == 'This is a sample todo for testing'
    
    def test_get_nonexistent_todo(self, client):
        """Test getting a todo that doesn't exist."""
        response = client.get('/api/todos/999')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'not found' in data['error'].lower()
    
    def test_get_todo_invalid_id(self, client):
        """Test getting a todo with invalid ID format."""
        response = client.get('/api/todos/invalid')
        assert response.status_code == 404


class TestCreateTodo:
    """Tests for POST /api/todos endpoint."""
    
    def test_create_todo_with_title_only(self, client):
        """Test creating a todo with only title."""
        payload = {'title': 'New Todo'}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['title'] == 'New Todo'
        assert data['data']['description'] is None
        assert data['data']['completed'] is False
        assert 'id' in data['data']
        assert 'created_at' in data['data']
    
    def test_create_todo_with_title_and_description(self, client):
        """Test creating a todo with title and description."""
        payload = {
            'title': 'New Todo',
            'description': 'This is a detailed description'
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['title'] == 'New Todo'
        assert data['data']['description'] == 'This is a detailed description'
        assert data['data']['completed'] is False
    
    def test_create_todo_without_title(self, client):
        """Test creating a todo without title (should fail)."""
        payload = {'description': 'No title'}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'title' in data['error'].lower()
    
    def test_create_todo_with_empty_title(self, client):
        """Test creating a todo with empty title (should fail)."""
        payload = {'title': '   '}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'empty' in data['error'].lower()
    
    def test_create_todo_with_long_title(self, client):
        """Test creating a todo with title exceeding max length."""
        payload = {'title': 'x' * 201}
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert '200' in data['error']
    
    def test_create_todo_with_long_description(self, client):
        """Test creating a todo with description exceeding max length."""
        payload = {
            'title': 'Valid Title',
            'description': 'x' * 501
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert '500' in data['error']
    
    def test_create_todo_with_no_data(self, client):
        """Test creating a todo with no JSON data."""
        response = client.post(
            '/api/todos',
            data='',
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_create_todo_with_empty_description(self, client):
        """Test creating a todo with empty description (should be None)."""
        payload = {
            'title': 'Valid Title',
            'description': '   '
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['description'] is None


class TestUpdateTodo:
    """Tests for PUT /api/todos/<id> endpoint."""
    
    def test_update_todo_title(self, client, sample_todo):
        """Test updating only the title of a todo."""
        payload = {'title': 'Updated Title'}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['title'] == 'Updated Title'
        assert data['data']['description'] == 'This is a sample todo for testing'
    
    def test_update_todo_description(self, client, sample_todo):
        """Test updating only the description of a todo."""
        payload = {'description': 'Updated description'}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['title'] == 'Sample Todo'
        assert data['data']['description'] == 'Updated description'
    
    def test_update_todo_completed(self, client, sample_todo):
        """Test updating the completed status of a todo."""
        payload = {'completed': True}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['completed'] is True
    
    def test_update_todo_all_fields(self, client, sample_todo):
        """Test updating all fields of a todo."""
        payload = {
            'title': 'Completely Updated',
            'description': 'New description',
            'completed': True
        }
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['title'] == 'Completely Updated'
        assert data['data']['description'] == 'New description'
        assert data['data']['completed'] is True
    
    def test_update_nonexistent_todo(self, client):
        """Test updating a todo that doesn't exist."""
        payload = {'title': 'Updated'}
        response = client.put(
            '/api/todos/999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_update_todo_with_empty_title(self, client, sample_todo):
        """Test updating a todo with empty title (should fail)."""
        payload = {'title': '   '}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_update_todo_with_long_title(self, client, sample_todo):
        """Test updating a todo with title exceeding max length."""
        payload = {'title': 'x' * 201}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_update_todo_with_long_description(self, client, sample_todo):
        """Test updating a todo with description exceeding max length."""
        payload = {'description': 'x' * 501}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_update_todo_with_invalid_completed(self, client, sample_todo):
        """Test updating a todo with invalid completed value."""
        payload = {'completed': 'not-a-boolean'}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'boolean' in data['error'].lower()
    
    def test_update_todo_with_no_data(self, client, sample_todo):
        """Test updating a todo with no data."""
        response = client.put(
            f'/api/todos/{sample_todo}',
            data='',
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_update_todo_clear_description(self, client, sample_todo):
        """Test clearing the description of a todo."""
        payload = {'description': ''}
        response = client.put(
            f'/api/todos/{sample_todo}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['data']['description'] is None


class TestDeleteTodo:
    """Tests for DELETE /api/todos/<id> endpoint."""
    
    def test_delete_existing_todo(self, client, sample_todo):
        """Test deleting an existing todo."""
        response = client.delete(f'/api/todos/{sample_todo}')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'deleted' in data['data']['message'].lower()
        
        # Verify todo is actually deleted
        get_response = client.get(f'/api/todos/{sample_todo}')
        assert get_response.status_code == 404
    
    def test_delete_nonexistent_todo(self, client):
        """Test deleting a todo that doesn't exist."""
        response = client.delete('/api/todos/999')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'not found' in data['error'].lower()
    
    def test_delete_todo_invalid_id(self, client):
        """Test deleting a todo with invalid ID format."""
        response = client.delete('/api/todos/invalid')
        assert response.status_code == 404


class TestErrorHandlers:
    """Tests for error handlers."""
    
    def test_404_error(self, client):
        """Test 404 error handler."""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'not found' in data['error'].lower()
    
    def test_405_method_not_allowed(self, client):
        """Test 405 error handler."""
        response = client.patch('/api/todos')
        assert response.status_code == 405
        
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'method not allowed' in data['error'].lower()


class TestTodoModel:
    """Tests for the Todo model."""
    
    def test_todo_creation(self, app):
        """Test creating a Todo model instance."""
        with app.app_context():
            todo = Todo(
                title='Test Todo',
                description='Test Description',
                completed=False
            )
            db.session.add(todo)
            db.session.commit()
            
            assert todo.id is not None
            assert todo.title == 'Test Todo'
            assert todo.description == 'Test Description'
            assert todo.completed is False
            assert todo.created_at is not None
    
    def test_todo_to_dict(self, app):
        """Test Todo model to_dict method."""
        with app.app_context():
            todo = Todo(
                title='Test Todo',
                description='Test Description',
                completed=True
            )
            db.session.add(todo)
            db.session.commit()
            
            todo_dict = todo.to_dict()
            assert todo_dict['id'] == todo.id
            assert todo_dict['title'] == 'Test Todo'
            assert todo_dict['description'] == 'Test Description'
            assert todo_dict['completed'] is True
            assert 'created_at' in todo_dict
    
    def test_todo_repr(self, app):
        """Test Todo model __repr__ method."""
        with app.app_context():
            todo = Todo(title='Test Todo')
            db.session.add(todo)
            db.session.commit()
            
            repr_str = repr(todo)
            assert 'Todo' in repr_str
            assert str(todo.id) in repr_str
            assert 'Test Todo' in repr_str


class TestIntegrationScenarios:
    """Integration tests for common workflows."""
    
    def test_create_and_complete_workflow(self, client):
        """Test creating a todo and marking it as complete."""
        # Create todo
        create_payload = {
            'title': 'Integration Test Todo',
            'description': 'Testing workflow'
        }
        create_response = client.post(
            '/api/todos',
            data=json.dumps(create_payload),
            content_type='application/json'
        )
        assert create_response.status_code == 201
        todo_id = json.loads(create_response.data)['data']['id']
        
        # Mark as complete
        update_payload = {'completed': True}
        update_response = client.put(
            f'/api/todos/{todo_id}',
            data=json.dumps(update_payload),
            content_type='application/json'
        )
        assert update_response.status_code == 200
        assert json.loads(update_response.data)['data']['completed'] is True
        
        # Verify in list
        list_response = client.get('/api/todos')
        todos = json.loads(list_response.data)['data']
        completed_todo = next(t for t in todos if t['id'] == todo_id)
        assert completed_todo['completed'] is True
    
    def test_create_update_delete_workflow(self, client):
        """Test full CRUD workflow."""
        # Create
        create_response = client.post(
            '/api/todos',
            data=json.dumps({'title': 'Workflow Test'}),
            content_type='application/json'
        )
        todo_id = json.loads(create_response.data)['data']['id']
        
        # Update
        update_response = client.put(
            f'/api/todos/{todo_id}',
            data=json.dumps({'title': 'Updated Workflow Test'}),
            content_type='application/json'
        )
        assert json.loads(update_response.data)['data']['title'] == 'Updated Workflow Test'
        
        # Delete
        delete_response = client.delete(f'/api/todos/{todo_id}')
        assert delete_response.status_code == 200
        
        # Verify deleted
        get_response = client.get(f'/api/todos/{todo_id}')
        assert get_response.status_code == 404

# Made with Bob

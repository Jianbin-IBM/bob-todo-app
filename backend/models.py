from datetime import datetime
from database import db

class Todo(db.Model):
    """
    Todo model for storing todo items.
    
    Attributes:
        id: Unique identifier (primary key)
        title: Todo title (required, max 200 characters)
        description: Detailed description of the todo (optional, max 500 characters)
        completed: Boolean flag indicating completion status
        created_at: Timestamp when the todo was created
    """
    __tablename__ = 'todos'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """
        Convert todo object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the todo
        """
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        """String representation of the Todo object."""
        return f'<Todo {self.id}: {self.title}>'

# Made with Bob

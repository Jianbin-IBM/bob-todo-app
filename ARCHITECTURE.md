# Todo Application - Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend (Port 8000)"]
        HTML[index.html]
        CSS[styles.css]
        JS[app.js]
        API[api.js]
    end
    
    subgraph Backend["Backend (Port 5000)"]
        Flask[Flask App]
        Routes[API Routes]
        Models[SQLAlchemy Models]
        DB[(SQLite Database)]
    end
    
    User[User Browser] --> HTML
    HTML --> CSS
    HTML --> JS
    JS --> API
    API -->|HTTP Requests| Flask
    Flask --> Routes
    Routes --> Models
    Models --> DB
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style User fill:#f0f0f0
```

## Request Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Layer
    participant Flask Backend
    participant Database
    
    User->>Frontend: Interact with UI
    Frontend->>API Layer: Call API function
    API Layer->>Flask Backend: HTTP Request (GET/POST/PUT/DELETE)
    Flask Backend->>Database: Query/Update via SQLAlchemy
    Database-->>Flask Backend: Return data
    Flask Backend-->>API Layer: JSON Response
    API Layer-->>Frontend: Process response
    Frontend-->>User: Update UI
```

## Database Schema

```mermaid
erDiagram
    TODO {
        int id PK
        string title
        boolean completed
        datetime created_at
        datetime updated_at
    }
```

## API Endpoint Structure

```mermaid
graph LR
    A[API Base: /api] --> B[GET /todos]
    A --> C[GET /todos/:id]
    A --> D[POST /todos]
    A --> E[PUT /todos/:id]
    A --> F[DELETE /todos/:id]
    
    B --> G[Return all todos]
    C --> H[Return single todo]
    D --> I[Create new todo]
    E --> J[Update todo]
    F --> K[Delete todo]
    
    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#2196F3,color:#fff
    style D fill:#FF9800,color:#fff
    style E fill:#FFC107,color:#fff
    style F fill:#F44336,color:#fff
```

## Frontend Component Structure

```mermaid
graph TD
    A[index.html] --> B[Header Section]
    A --> C[Input Form]
    A --> D[Todo List Container]
    
    C --> E[Text Input]
    C --> F[Add Button]
    
    D --> G[Todo Items]
    
    G --> H[Checkbox]
    G --> I[Title Text]
    G --> J[Edit Button]
    G --> K[Delete Button]
    
    style A fill:#FF6B6B
    style C fill:#4ECDC4
    style D fill:#45B7D1
```

## Backend Component Structure

```mermaid
graph TD
    A[app.py] --> B[Initialize Flask]
    A --> C[Configure CORS]
    A --> D[Initialize SQLAlchemy]
    A --> E[Define Routes]
    
    E --> F[GET /todos]
    E --> G[POST /todos]
    E --> H[PUT /todos/:id]
    E --> I[DELETE /todos/:id]
    
    J[models.py] --> K[Todo Model]
    K --> L[Serialization Methods]
    
    M[config.py] --> N[Database URI]
    M --> O[App Settings]
    
    style A fill:#95E1D3
    style J fill:#F38181
    style M fill:#AA96DA
```

## Data Flow for Creating a Todo

```mermaid
flowchart TD
    A[User types todo title] --> B[User clicks Add button]
    B --> C[app.js captures form submit]
    C --> D[api.js sends POST request]
    D --> E{Flask receives request}
    E --> F[Validate input]
    F --> G{Valid?}
    G -->|Yes| H[Create Todo object]
    G -->|No| I[Return error response]
    H --> J[Save to database]
    J --> K[Return success response]
    K --> L[api.js receives response]
    L --> M[app.js updates UI]
    M --> N[New todo appears in list]
    I --> O[Display error message]
    
    style A fill:#E8F5E9
    style N fill:#C8E6C9
    style O fill:#FFCDD2
```

## File Organization

```mermaid
graph TD
    A[todo-app/] --> B[backend/]
    A --> C[frontend/]
    A --> D[.gitignore]
    A --> E[README.md]
    
    B --> F[app.py]
    B --> G[models.py]
    B --> H[config.py]
    B --> I[requirements.txt]
    B --> J[instance/todos.db]
    
    C --> K[index.html]
    C --> L[css/]
    C --> M[js/]
    
    L --> N[styles.css]
    M --> O[app.js]
    M --> P[api.js]
    
    style A fill:#FFE082
    style B fill:#90CAF9
    style C fill:#A5D6A7
```

## Technology Stack Layers

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        HTML5[HTML5]
        CSS3[CSS3]
        JS[JavaScript ES6+]
    end
    
    subgraph Application["Application Layer"]
        Flask[Flask 3.0]
        Routes[RESTful Routes]
    end
    
    subgraph Data["Data Layer"]
        SQLAlchemy[SQLAlchemy ORM]
        SQLite[SQLite Database]
    end
    
    subgraph Communication["Communication Layer"]
        FetchAPI[Fetch API]
        CORS[Flask-CORS]
        JSON[JSON Format]
    end
    
    Presentation --> Communication
    Communication --> Application
    Application --> Data
    
    style Presentation fill:#E1BEE7
    style Application fill:#BBDEFB
    style Data fill:#C5E1A5
    style Communication fill:#FFE0B2
```

## Development Workflow

```mermaid
flowchart LR
    A[Write Code] --> B[Start Backend Server]
    B --> C[Start Frontend Server]
    C --> D[Test in Browser]
    D --> E{Works?}
    E -->|No| F[Debug]
    F --> A
    E -->|Yes| G[Commit Changes]
    G --> H[Continue Development]
    H --> A
    
    style A fill:#B3E5FC
    style G fill:#C8E6C9
    style F fill:#FFCCBC
```

## Deployment Architecture (Future)

```mermaid
graph TB
    subgraph Production["Production Environment"]
        LB[Load Balancer]
        WS1[Web Server 1]
        WS2[Web Server 2]
        DB[(Production DB)]
    end
    
    subgraph Development["Development Environment"]
        DevFE[Frontend Dev Server]
        DevBE[Flask Dev Server]
        DevDB[(SQLite Dev DB)]
    end
    
    User[Users] --> LB
    LB --> WS1
    LB --> WS2
    WS1 --> DB
    WS2 --> DB
    
    Dev[Developer] --> DevFE
    Dev --> DevBE
    DevBE --> DevDB
    
    style Production fill:#E8F5E9
    style Development fill:#FFF3E0
```

---

## Key Architectural Decisions

### 1. Separation of Concerns
- **Frontend**: Handles UI/UX and user interactions
- **Backend**: Manages business logic and data persistence
- **API Layer**: Clean interface between frontend and backend

### 2. RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON data format
- Stateless communication

### 3. Database Choice
- SQLite for simplicity and zero configuration
- SQLAlchemy ORM for database abstraction
- Easy migration to PostgreSQL/MySQL if needed

### 4. Frontend Architecture
- Vanilla JavaScript for simplicity
- Modular code organization (api.js, app.js)
- Separation of concerns (HTML, CSS, JS)

### 5. Development Approach
- Start simple, iterate quickly
- Clear API contracts
- Easy local development setup
- Version control ready

---

## Security Considerations

```mermaid
graph LR
    A[Input Validation] --> B[SQL Injection Prevention]
    B --> C[CORS Configuration]
    C --> D[Error Handling]
    D --> E[Data Sanitization]
    
    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
```

### Implemented Security Measures
1. **SQLAlchemy ORM** - Prevents SQL injection
2. **Input Validation** - Server-side validation of todo titles
3. **CORS Configuration** - Controlled cross-origin access
4. **Error Handling** - Graceful error responses without exposing internals

---

## Performance Considerations

- **Database Indexing**: Primary key on id column
- **Efficient Queries**: SQLAlchemy optimized queries
- **Minimal Dependencies**: Fast load times
- **Caching Strategy**: Browser caching for static assets

---

This architecture provides a solid foundation for a simple, maintainable todo application that can be easily extended in the future.
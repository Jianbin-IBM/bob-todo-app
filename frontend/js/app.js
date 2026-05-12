/**
 * ============================================================================
 * TODO APP - MAIN JAVASCRIPT APPLICATION
 * ============================================================================
 * 
 * This file contains all the JavaScript code for the Todo application frontend.
 * It handles:
 * - Communication with the backend API
 * - User interface updates
 * - Event handling (clicks, form submissions, etc.)
 * - State management (keeping track of todos)
 * 
 * LEARNING NOTES:
 * - We use vanilla JavaScript (no frameworks like React or Vue)
 * - We use modern ES6+ features like async/await, arrow functions, and template literals
 * - The code is organized into logical sections for easy understanding
 * 
 * ============================================================================
 */

// ============================================================================
// SECTION 1: CONFIGURATION
// ============================================================================

/**
 * API_BASE_URL: The base URL for our backend API
 * 
 * WHY: We store this in a constant so we can easily change it if needed
 * (e.g., when deploying to production with a different URL)
 * 
 * EXAMPLE: If the backend moves to https://api.example.com, we only need
 * to change this one line instead of updating it everywhere in the code.
 */
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// SECTION 2: STATE MANAGEMENT
// ============================================================================

/**
 * STATE: These variables keep track of the application's current state
 * 
 * WHY WE NEED STATE:
 * - The browser doesn't automatically remember data between page interactions
 * - We need to store todos locally so we can filter, edit, and display them
 * - State helps us avoid making unnecessary API calls
 * 
 * THINK OF IT LIKE: A notebook where we write down what's currently happening
 */

/**
 * todos: Array that stores all todo items
 * EXAMPLE: [{id: 1, title: "Buy milk", completed: false}, ...]
 */
let todos = [];

/**
 * currentFilter: Tracks which filter is active ('all', 'active', or 'completed')
 * WHY: So we know which todos to show when the user clicks filter buttons
 */
let currentFilter = 'all';

/**
 * editingTodoId: Stores the ID of the todo being edited (null if none)
 * WHY: We need to know which todo to update when the user saves changes
 */
let editingTodoId = null;

// ============================================================================
// SECTION 3: DOM ELEMENTS
// ============================================================================

/**
 * DOM ELEMENTS: References to HTML elements we'll interact with
 * 
 * WHY WE DO THIS:
 * - document.getElementById() searches the entire page each time it's called
 * - By storing references once, we make our code faster
 * - It's like bookmarking pages in a book instead of searching from the start
 * 
 * NAMING CONVENTION: We use descriptive names that match the HTML element's purpose
 */

// Form elements - where users input data
const todoForm = document.getElementById('todo-form');
const todoTitleInput = document.getElementById('todo-title');
const todoDescriptionInput = document.getElementById('todo-description');

// Display elements - where we show todos and messages
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Filter elements - buttons to filter todos
const filterTabs = document.querySelectorAll('.filter-tab');

// Modal elements - popup for editing todos
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

// ============================================================================
// SECTION 4: API FUNCTIONS
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * UNDERSTANDING ASYNC/AWAIT AND API CALLS
 * ----------------------------------------------------------------------------
 * 
 * WHAT IS AN API?
 * - API stands for "Application Programming Interface"
 * - It's like a waiter in a restaurant: you tell it what you want, and it
 *   brings back the data from the kitchen (backend server)
 * 
 * WHY ASYNC/AWAIT?
 * - Network requests take time (like waiting for a waiter)
 * - We don't want to freeze the entire page while waiting
 * - async/await lets us write code that waits for responses without blocking
 * 
 * ANALOGY:
 * - Synchronous (blocking): You stand at the counter until your order is ready
 * - Asynchronous (non-blocking): You get a buzzer and can sit down while waiting
 * 
 * HOW IT WORKS:
 * 1. 'async' keyword: Marks a function as asynchronous
 * 2. 'await' keyword: Pauses execution until a promise resolves
 * 3. Promises: Objects representing eventual completion of an operation
 * 
 * ----------------------------------------------------------------------------
 */

/**
 * fetchAPI: Generic function to make API calls
 * 
 * PURPOSE: This is our "universal waiter" - it handles all communication
 * with the backend API, regardless of what we're requesting.
 * 
 * WHY WE CREATED THIS:
 * - Avoids repeating the same code for every API call
 * - Centralizes error handling in one place
 * - Makes it easy to add features like authentication headers later
 * 
 * PARAMETERS:
 * @param {string} endpoint - The specific API route (e.g., '/todos')
 * @param {object} options - Configuration for the request (method, body, etc.)
 * 
 * RETURNS:
 * @returns {Promise<object>} - The JSON response from the server
 * 
 * HOW IT WORKS:
 * 1. Combines base URL with endpoint to create full URL
 * 2. Sends request to server using fetch()
 * 3. Waits for response
 * 4. Converts response to JSON
 * 5. Checks if request was successful
 * 6. Returns data or throws error
 * 
 * ERROR HANDLING:
 * - try/catch blocks catch errors (like a safety net)
 * - If something goes wrong, we throw an error with a helpful message
 * - The calling function can then decide how to handle the error
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        // STEP 1: Make the HTTP request
        // fetch() is a built-in browser function for making network requests
        // It returns a Promise that resolves to a Response object
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            // Set default headers (tells server we're sending/expecting JSON)
            headers: {
                'Content-Type': 'application/json',
                ...options.headers, // Spread operator: merges any custom headers
            },
            ...options, // Spread operator: includes method, body, etc.
        });

        // STEP 2: Parse the JSON response
        // .json() converts the response body from JSON string to JavaScript object
        // This is also asynchronous, so we use await
        const data = await response.json();

        // STEP 3: Check if the request was successful
        // response.ok is true for status codes 200-299
        if (!response.ok) {
            // If not successful, throw an error with the server's error message
            // The 'throw' keyword stops execution and jumps to the catch block
            throw new Error(data.error || 'An error occurred');
        }

        // STEP 4: Return the data if everything went well
        return data;
        
    } catch (error) {
        // CATCH BLOCK: Handles any errors that occurred in the try block
        // This includes network errors, JSON parsing errors, or our thrown errors
        
        // Log error to console for debugging (developers can see this)
        console.error('API Error:', error);
        
        // Re-throw the error so the calling function knows something went wrong
        // This is like passing the problem up to someone who can handle it better
        throw error;
    }
}

/**
 * getTodos: Fetch all todos from the server
 * 
 * PURPOSE: Retrieves the complete list of todos from the database
 * 
 * WHY ASYNC: Network requests take time, so we use async/await to wait
 * for the response without freezing the page
 * 
 * RETURNS: Promise that resolves to an object like:
 * {
 *   success: true,
 *   data: [{id: 1, title: "Buy milk", ...}, ...]
 * }
 * 
 * EXAMPLE USAGE:
 * const response = await getTodos();
 * console.log(response.data); // Array of todos
 */
async function getTodos() {
    // We don't need to specify method because GET is the default
    return fetchAPI('/todos');
}

/**
 * createTodo: Create a new todo on the server
 * 
 * PURPOSE: Sends a new todo to the backend to be saved in the database
 * 
 * PARAMETERS:
 * @param {string} title - The todo's title (required)
 * @param {string} description - The todo's description (optional)
 * 
 * WHY WE PASS PARAMETERS:
 * - The function needs to know what todo to create
 * - Parameters make the function reusable with different data
 * 
 * HOW IT WORKS:
 * 1. Takes title and description as input
 * 2. Sends POST request to /todos endpoint
 * 3. Backend creates todo in database
 * 4. Backend returns the created todo with its new ID
 * 5. We return that data to the caller
 * 
 * EXAMPLE USAGE:
 * const response = await createTodo("Buy milk", "From the store");
 * console.log(response.data.id); // New todo's ID
 */
async function createTodo(title, description) {
    return fetchAPI('/todos', {
        method: 'POST', // POST = create new resource
        // JSON.stringify converts JavaScript object to JSON string
        // The server expects JSON format, not a JavaScript object
        body: JSON.stringify({ title, description }),
    });
}

/**
 * updateTodo: Update an existing todo on the server
 * 
 * PURPOSE: Modifies a todo's properties (title, description, completed status)
 * 
 * PARAMETERS:
 * @param {number} id - The ID of the todo to update
 * @param {object} updates - Object containing fields to update
 * 
 * WHY WE USE AN OBJECT FOR UPDATES:
 * - Flexibility: Can update one field or multiple fields
 * - Clarity: {completed: true} is clearer than just 'true'
 * - Extensibility: Easy to add new fields later
 * 
 * EXAMPLE USAGE:
 * // Mark todo as complete
 * await updateTodo(1, { completed: true });
 * 
 * // Update title and description
 * await updateTodo(1, { 
 *   title: "New title", 
 *   description: "New description" 
 * });
 */
async function updateTodo(id, updates) {
    return fetchAPI(`/todos/${id}`, {
        method: 'PUT', // PUT = update existing resource
        body: JSON.stringify(updates),
    });
}

/**
 * deleteTodo: Delete a todo from the server
 * 
 * PURPOSE: Permanently removes a todo from the database
 * 
 * PARAMETERS:
 * @param {number} id - The ID of the todo to delete
 * 
 * WHY DELETE IS PERMANENT:
 * - Once deleted from the database, the todo is gone forever
 * - That's why we show a confirmation dialog before calling this
 * 
 * EXAMPLE USAGE:
 * await deleteTodo(1); // Deletes todo with ID 1
 */
async function deleteTodo(id) {
    return fetchAPI(`/todos/${id}`, {
        method: 'DELETE', // DELETE = remove resource
    });
}

// ============================================================================
// SECTION 5: INITIALIZATION AND EVENT LISTENERS
// ============================================================================

/**
 * init: Initialize the application
 * 
 * PURPOSE: This is the "startup" function that runs when the page loads
 * 
 * WHAT IT DOES:
 * 1. Sets up event listeners (tells browser what to do when user clicks, types, etc.)
 * 2. Loads todos from the server
 * 
 * WHY ASYNC:
 * - loadTodos() makes an API call, which is asynchronous
 * - We use await to wait for todos to load before continuing
 * 
 * THINK OF IT LIKE: Turning on a computer
 * - First, load the operating system (setup event listeners)
 * - Then, load your files (load todos)
 */
async function init() {
    setupEventListeners();
    await loadTodos();
}

/**
 * setupEventListeners: Attach event handlers to DOM elements
 * 
 * PURPOSE: Tell the browser what functions to call when users interact with the page
 * 
 * WHAT ARE EVENT LISTENERS?
 * - They "listen" for events (clicks, key presses, form submissions)
 * - When an event happens, they call a function to handle it
 * - Like a doorbell: when pressed (event), it rings (calls function)
 * 
 * WHY WE SEPARATE THIS:
 * - Keeps initialization code organized
 * - Makes it easy to see all event handlers in one place
 * - Follows the principle of "separation of concerns"
 */
function setupEventListeners() {
    // FORM SUBMISSION LISTENERS
    // 'submit' event fires when user submits a form (clicks button or presses Enter)
    todoForm.addEventListener('submit', handleAddTodo);
    editForm.addEventListener('submit', handleEditSubmit);
    
    // FILTER TAB LISTENERS
    // Loop through each filter tab and add a click listener
    // forEach is like a for loop but more readable
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get the filter type from the button's data-filter attribute
            // HTML: <button data-filter="active">Active</button>
            const filter = tab.dataset.filter;
            setFilter(filter);
        });
    });
    
    // MODAL BACKGROUND CLICK LISTENER
    // Close modal when user clicks outside of it (on the dark background)
    editModal.addEventListener('click', (e) => {
        // e.target is the element that was clicked
        // If it's the modal background (not the content), close the modal
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // KEYBOARD SHORTCUT LISTENERS
    // Listen for key presses on the entire document
    document.addEventListener('keydown', (e) => {
        // e.key is the key that was pressed
        // Close modal when user presses Escape key
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeEditModal();
        }
    });
}

// ============================================================================
// SECTION 6: DATA LOADING AND MANAGEMENT
// ============================================================================

/**
 * loadTodos: Fetch todos from API and update the UI
 * 
 * PURPOSE: This is the main function that loads all todos from the server
 * 
 * FLOW:
 * 1. Show loading spinner (user sees something is happening)
 * 2. Make API call to get todos
 * 3. Store todos in our state variable
 * 4. Update the UI to show the todos
 * 5. Update the count badges
 * 6. Hide loading spinner
 * 
 * ERROR HANDLING:
 * - If API call fails, we catch the error
 * - Show error message to user
 * - Hide loading spinner so page isn't stuck
 * 
 * WHY TRY/CATCH:
 * - Network requests can fail (server down, no internet, etc.)
 * - try/catch prevents the entire app from crashing
 * - Lets us show a friendly error message instead of a blank page
 */
async function loadTodos() {
    try {
        // STEP 1: Show loading state
        // This gives user feedback that something is happening
        showLoading();
        
        // STEP 2: Fetch todos from API
        // await pauses here until the API responds
        const response = await getTodos();
        
        // STEP 3: Store todos in state
        // response.data is the array of todos from the server
        todos = response.data;
        
        // STEP 4: Update the UI
        renderTodos(); // Display todos on the page
        updateCounts(); // Update the count badges (e.g., "Active: 5")
        
        // STEP 5: Hide loading state
        hideLoading();
        
    } catch (error) {
        // CATCH BLOCK: Runs if anything in try block fails
        
        // Hide loading state first
        hideLoading();
        
        // Show error message to user
        // We provide a helpful message instead of technical error details
        showError('Failed to load todos. Please refresh the page.');
    }
}

// ============================================================================
// SECTION 7: USER ACTION HANDLERS
// ============================================================================

/**
 * handleAddTodo: Handle form submission to create a new todo
 * 
 * PURPOSE: Called when user submits the "add todo" form
 * 
 * PARAMETERS:
 * @param {Event} e - The form submission event
 * 
 * WHY WE NEED THE EVENT PARAMETER:
 * - The browser automatically passes the event object
 * - We need it to prevent the default form submission behavior
 * 
 * WHAT IS e.preventDefault()?
 * - By default, forms reload the page when submitted
 * - We don't want that (we're building a single-page app)
 * - preventDefault() stops the default behavior
 * 
 * FLOW:
 * 1. Prevent page reload
 * 2. Get values from input fields
 * 3. Validate input
 * 4. Send to API
 * 5. Update local state
 * 6. Clear form
 * 7. Update UI
 * 8. Show success message
 */
async function handleAddTodo(e) {
    // STEP 1: Prevent default form submission
    // Without this, the page would reload
    e.preventDefault();
    
    // STEP 2: Get input values
    // .value gets the text from the input field
    // .trim() removes whitespace from start and end
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    
    // STEP 3: Validate input
    // Check if title is empty (required field)
    if (!title) {
        showError('Please enter a todo title');
        return; // Stop execution if validation fails
    }

    try {
        // STEP 4: Create todo via API
        // If description is empty, send null instead of empty string
        const response = await createTodo(title, description || null);
        
        // STEP 5: Add new todo to the beginning of our local array
        // unshift() adds to the start (newest todos appear first)
        todos.unshift(response.data);
        
        // STEP 6: Clear the form inputs
        // Reset form so user can add another todo
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
        
        // STEP 7: Update the UI
        renderTodos(); // Re-render the todo list
        updateCounts(); // Update count badges
        
        // STEP 8: Show success message
        showSuccess('Todo added successfully!');
        
    } catch (error) {
        // If API call fails, show error message
        // error.message contains the error text from the server
        showError(error.message || 'Failed to create todo');
    }
}

/**
 * handleToggleTodo: Toggle a todo's completed status
 * 
 * PURPOSE: Called when user clicks a todo's checkbox
 * 
 * PARAMETERS:
 * @param {number} id - The ID of the todo to toggle
 * 
 * HOW IT WORKS:
 * 1. Find the todo in our local array
 * 2. Send update to API with opposite completed value
 * 3. Update local state with response from API
 * 4. Re-render UI
 * 5. Show success message
 * 
 * WHY WE UPDATE LOCAL STATE:
 * - The API might modify the data (e.g., update timestamp)
 * - We want our local state to match the server exactly
 * - This prevents inconsistencies
 */
async function handleToggleTodo(id) {
    try {
        // STEP 1: Find the todo in our local array
        // .find() returns the first item that matches the condition
        const todo = todos.find(t => t.id === id);
        
        // STEP 2: Send update to API
        // !todo.completed flips the boolean (true becomes false, false becomes true)
        const response = await updateTodo(id, { completed: !todo.completed });
        
        // STEP 3: Update local state
        // Find the index of the todo in our array
        const index = todos.findIndex(t => t.id === id);
        // Replace the old todo with the updated one from the server
        todos[index] = response.data;
        
        // STEP 4: Update UI
        renderTodos();
        updateCounts();
        
        // STEP 5: Show appropriate success message
        // Ternary operator: condition ? valueIfTrue : valueIfFalse
        showSuccess(response.data.completed ? 'Todo completed!' : 'Todo marked as active');
        
    } catch (error) {
        showError('Failed to update todo');
    }
}

/**
 * handleEditTodo: Open the edit modal for a todo
 * 
 * PURPOSE: Called when user clicks the edit button on a todo
 * 
 * PARAMETERS:
 * @param {number} id - The ID of the todo to edit
 * 
 * WHY WE USE A MODAL:
 * - Provides a focused editing experience
 * - Prevents accidental clicks on other todos
 * - Clearly shows what's being edited
 * 
 * FLOW:
 * 1. Find the todo in our array
 * 2. Store the ID (so we know what to update later)
 * 3. Fill the modal form with current values
 * 4. Show the modal
 */
function handleEditTodo(id) {
    // STEP 1: Find the todo
    const todo = todos.find(t => t.id === id);
    
    // If todo not found, exit early
    if (!todo) return;
    
    // STEP 2: Store the ID for later use
    editingTodoId = id;
    
    // STEP 3: Fill the form with current values
    // We set the value of each input field to the todo's current data
    document.getElementById('edit-todo-id').value = id;
    document.getElementById('edit-todo-title').value = todo.title;
    // Use empty string if description is null (null would show as "null")
    document.getElementById('edit-todo-description').value = todo.description || '';
    
    // STEP 4: Show the modal
    // Adding 'active' class makes the modal visible (CSS handles the display)
    editModal.classList.add('active');
}

/**
 * handleEditSubmit: Handle edit form submission
 * 
 * PURPOSE: Called when user submits the edit form (clicks "Save Changes")
 * 
 * PARAMETERS:
 * @param {Event} e - The form submission event
 * 
 * FLOW:
 * 1. Prevent page reload
 * 2. Get form values
 * 3. Validate input
 * 4. Send update to API
 * 5. Update local state
 * 6. Close modal
 * 7. Update UI
 * 8. Show success message
 */
async function handleEditSubmit(e) {
    // STEP 1: Prevent default form behavior
    e.preventDefault();
    
    // STEP 2: Get form values
    // parseInt converts string to number (IDs are numbers)
    const id = parseInt(document.getElementById('edit-todo-id').value);
    const title = document.getElementById('edit-todo-title').value.trim();
    const description = document.getElementById('edit-todo-description').value.trim();
    
    // STEP 3: Validate input
    if (!title) {
        showError('Title cannot be empty');
        return;
    }
    
    try {
        // STEP 4: Send update to API
        const response = await updateTodo(id, {
            title,
            description: description || null // Use null if empty
        });
        
        // STEP 5: Update local state
        const index = todos.findIndex(t => t.id === id);
        todos[index] = response.data;
        
        // STEP 6: Close modal
        closeEditModal();
        
        // STEP 7: Update UI
        renderTodos();
        
        // STEP 8: Show success message
        showSuccess('Todo updated successfully!');
        
    } catch (error) {
        showError(error.message || 'Failed to update todo');
    }
}

/**
 * handleDeleteTodo: Delete a todo
 * 
 * PURPOSE: Called when user clicks the delete button
 * 
 * PARAMETERS:
 * @param {number} id - The ID of the todo to delete
 * 
 * WHY WE CONFIRM:
 * - Deletion is permanent
 * - Prevents accidental deletions
 * - Good user experience practice
 * 
 * FLOW:
 * 1. Ask for confirmation
 * 2. If confirmed, delete via API
 * 3. Remove from local state
 * 4. Update UI
 * 5. Show success message
 */
async function handleDeleteTodo(id) {
    // STEP 1: Ask for confirmation
    // confirm() shows a browser dialog with OK/Cancel buttons
    // Returns true if user clicks OK, false if Cancel
    if (!confirm('Are you sure you want to delete this todo?')) {
        return; // User cancelled, so exit
    }

    try {
        // STEP 2: Delete via API
        await deleteTodo(id);
        
        // STEP 3: Remove from local state
        // .filter() creates a new array with only items that match the condition
        // We keep all todos except the one with the matching ID
        todos = todos.filter(t => t.id !== id);
        
        // STEP 4: Update UI
        renderTodos();
        updateCounts();
        
        // STEP 5: Show success message
        showSuccess('Todo deleted successfully!');
        
    } catch (error) {
        showError('Failed to delete todo');
    }
}

/**
 * clearAllCompleted: Delete all completed todos
 * 
 * PURPOSE: Bulk delete operation for completed todos
 * 
 * WHY THIS IS USEFUL:
 * - Users often accumulate many completed todos
 * - Deleting them one by one is tedious
 * - This provides a quick cleanup option
 * 
 * FLOW:
 * 1. Find all completed todos
 * 2. Check if there are any
 * 3. Ask for confirmation
 * 4. Delete all via API (in parallel)
 * 5. Update local state
 * 6. Update UI
 * 7. Show success message
 */
async function clearAllCompleted() {
    // STEP 1: Find all completed todos
    // .filter() returns a new array with only completed todos
    const completedTodos = todos.filter(t => t.completed);
    
    // STEP 2: Check if there are any completed todos
    if (completedTodos.length === 0) {
        showError('No completed todos to clear');
        return;
    }
    
    // STEP 3: Ask for confirmation
    // Template literal (backticks) lets us embed variables in strings
    if (!confirm(`Delete ${completedTodos.length} completed todo(s)?`)) {
        return;
    }
    
    try {
        // STEP 4: Delete all completed todos
        // Promise.all() runs multiple async operations in parallel
        // .map() creates an array of delete promises
        // This is faster than deleting one at a time
        await Promise.all(completedTodos.map(todo => deleteTodo(todo.id)));
        
        // STEP 5: Update local state
        // Keep only todos that are not completed
        todos = todos.filter(t => !t.completed);
        
        // STEP 6: Update UI
        renderTodos();
        updateCounts();
        
        // STEP 7: Show success message
        showSuccess(`${completedTodos.length} completed todo(s) deleted!`);
        
    } catch (error) {
        showError('Failed to clear completed todos');
        // If deletion failed, reload todos to sync state with server
        await loadTodos();
    }
}

// ============================================================================
// SECTION 8: FILTERING AND DISPLAY
// ============================================================================

/**
 * setFilter: Change the active filter
 * 
 * PURPOSE: Called when user clicks a filter tab (All, Active, Completed)
 * 
 * PARAMETERS:
 * @param {string} filter - The filter to apply ('all', 'active', or 'completed')
 * 
 * WHAT IT DOES:
 * 1. Updates the current filter state
 * 2. Updates the UI to show which tab is active
 * 3. Re-renders todos with the new filter
 * 
 * WHY WE UPDATE THE TAB APPEARANCE:
 * - Visual feedback shows user which filter is active
 * - Improves user experience
 */
function setFilter(filter) {
    // STEP 1: Update state
    currentFilter = filter;
    
    // STEP 2: Update active tab styling
    // Loop through all filter tabs
    filterTabs.forEach(tab => {
        // If this tab matches the selected filter, add 'active' class
        // Otherwise, remove 'active' class
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // STEP 3: Re-render todos with new filter
    renderTodos();
}

/**
 * getFilteredTodos: Get todos based on current filter
 * 
 * PURPOSE: Returns only the todos that match the current filter
 * 
 * RETURNS: Array of filtered todos
 * 
 * HOW IT WORKS:
 * - Uses a switch statement to handle different filter types
 * - .filter() method creates a new array with only matching items
 * 
 * WHY WE SEPARATE THIS:
 * - Keeps filtering logic in one place
 * - Makes it easy to add new filter types
 * - Follows "single responsibility principle"
 */
function getFilteredTodos() {
    // Switch statement: like multiple if/else but cleaner
    switch (currentFilter) {
        case 'active':
            // Return only todos where completed is false
            // ! means "not", so !t.completed means "not completed"
            return todos.filter(t => !t.completed);
            
        case 'completed':
            // Return only todos where completed is true
            return todos.filter(t => t.completed);
            
        default:
            // 'all' or any other value: return all todos
            return todos;
    }
}

/**
 * renderTodos: Update the DOM to display todos
 * 
 * PURPOSE: This is the main rendering function that updates what users see
 * 
 * HOW IT WORKS:
 * 1. Get filtered todos
 * 2. Check if there are any todos to show
 * 3. If none, show empty state
 * 4. If some, generate HTML for each todo
 * 5. Insert HTML into the page
 * 
 * WHY WE REGENERATE ALL HTML:
 * - Simpler than updating individual elements
 * - Ensures UI always matches state
 * - Fast enough for typical todo lists
 * 
 * TEMPLATE LITERALS:
 * - Backticks (`) allow multi-line strings
 * - ${variable} inserts variable values
 * - Makes HTML generation readable
 */
function renderTodos() {
    // STEP 1: Get todos to display
    const filteredTodos = getFilteredTodos();
    
    // STEP 2: Check if there are any todos
    if (filteredTodos.length === 0) {
        // No todos: clear the list and show empty state
        todoList.innerHTML = '';
        emptyState.style.display = 'block';
        return; // Exit early
    }

    // STEP 3: Hide empty state (we have todos to show)
    emptyState.style.display = 'none';
    
    // STEP 4: Generate HTML for all todos
    // .map() transforms each todo into HTML string
    // .join('') combines all strings into one
    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="handleToggleTodo(${todo.id})"
            >
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span>Created ${formatDate(todo.created_at)}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button 
                    class="btn-icon-only btn-edit" 
                    onclick="handleEditTodo(${todo.id})"
                    title="Edit todo"
                >
                    ✏️
                </button>
                <button 
                    class="btn-icon-only btn-delete" 
                    onclick="handleDeleteTodo(${todo.id})"
                    title="Delete todo"
                >
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * updateCounts: Update the count badges on filter tabs
 * 
 * PURPOSE: Shows how many todos are in each category
 * 
 * HOW IT WORKS:
 * 1. Count all todos
 * 2. Count active todos (not completed)
 * 3. Count completed todos
 * 4. Update the badge text for each filter
 * 
 * WHY THIS IS HELPFUL:
 * - Users can see at a glance how many todos they have
 * - Provides context for filtering
 * - Motivates users (seeing completed count go up)
 */
function updateCounts() {
    // Count all todos
    const allCount = todos.length;
    
    // Count active todos (where completed is false)
    const activeCount = todos.filter(t => !t.completed).length;
    
    // Count completed todos (where completed is true)
    const completedCount = todos.filter(t => t.completed).length;
    
    // Update the badge text
    // .textContent sets the text inside an element
    document.getElementById('count-all').textContent = allCount;
    document.getElementById('count-active').textContent = activeCount;
    document.getElementById('count-completed').textContent = completedCount;
}

// ============================================================================
// SECTION 9: UI STATE FUNCTIONS
// ============================================================================

/**
 * closeEditModal: Hide the edit modal
 * 
 * PURPOSE: Closes the edit dialog and resets its state
 * 
 * WHAT IT DOES:
 * 1. Remove 'active' class (CSS hides the modal)
 * 2. Clear the editing ID
 * 3. Reset the form
 * 
 * WHY WE RESET:
 * - Prevents old data from appearing next time modal opens
 * - Cleans up state
 */
function closeEditModal() {
    editModal.classList.remove('active');
    editingTodoId = null;
    editForm.reset(); // Clears all form fields
}

/**
 * showLoading: Display loading spinner
 * 
 * PURPOSE: Shows user that data is being loaded
 * 
 * WHY THIS MATTERS:
 * - Users need feedback that something is happening
 * - Prevents confusion ("Is it broken?")
 * - Improves perceived performance
 */
function showLoading() {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    todoList.style.display = 'none';
}

/**
 * hideLoading: Hide loading spinner
 * 
 * PURPOSE: Removes loading spinner after data is loaded
 */
function hideLoading() {
    loadingState.style.display = 'none';
    todoList.style.display = 'flex';
}

/**
 * showError: Display error message to user
 * 
 * PURPOSE: Shows a friendly error message when something goes wrong
 * 
 * PARAMETERS:
 * @param {string} message - The error message to display
 * 
 * WHY WE SHOW ERRORS:
 * - Users need to know when something fails
 * - Helps with debugging
 * - Better than silent failures
 * 
 * AUTO-HIDE:
 * - Message disappears after 5 seconds
 * - Prevents cluttering the UI
 * - setTimeout() schedules a function to run later
 */
function showError(message) {
    // Set the error text
    errorMessage.querySelector('.error-text').textContent = message;
    // Show the error message
    errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds (5000 milliseconds)
    // setTimeout() runs a function after a delay
    setTimeout(hideError, 5000);
}

/**
 * hideError: Hide error message
 * 
 * PURPOSE: Removes error message from view
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * showSuccess: Display success message to user
 * 
 * PURPOSE: Provides positive feedback when actions succeed
 * 
 * PARAMETERS:
 * @param {string} message - The success message to display
 * 
 * WHY SUCCESS MESSAGES:
 * - Confirms action was completed
 * - Provides positive feedback
 * - Improves user confidence
 */
function showSuccess(message) {
    successMessage.querySelector('.success-text').textContent = message;
    successMessage.style.display = 'flex';
    
    // Auto-hide after 3 seconds (shorter than errors)
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// ============================================================================
// SECTION 10: UTILITY FUNCTIONS
// ============================================================================

/**
 * escapeHtml: Prevent XSS attacks by escaping HTML
 * 
 * PURPOSE: Security function that prevents malicious code injection
 * 
 * WHAT IS XSS?
 * - XSS = Cross-Site Scripting
 * - Attacker tries to inject malicious HTML/JavaScript
 * - Example: Todo title like "<script>alert('hacked')</script>"
 * 
 * HOW THIS PREVENTS XSS:
 * - Creates a temporary div element
 * - Sets text content (browser automatically escapes HTML)
 * - Returns the escaped HTML
 * 
 * EXAMPLE:
 * Input:  "<script>alert('hi')</script>"
 * Output: "<script>alert('hi')</script>"
 * 
 * WHY THIS WORKS:
 * - .textContent treats everything as plain text
 * - .innerHTML returns the escaped version
 * - Browser won't execute escaped code
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * formatDate: Convert timestamp to human-readable format
 * 
 * PURPOSE: Shows relative time (e.g., "2 hours ago") instead of full timestamp
 * 
 * PARAMETERS:
 * @param {string} dateString - ISO date string from server
 * 
 * RETURNS: Human-readable time string
 * 
 * HOW IT WORKS:
 * 1. Convert string to Date object
 * 2. Calculate time difference from now
 * 3. Return appropriate format based on age
 * 
 * WHY RELATIVE TIME:
 * - More intuitive than "2024-01-15T10:30:00"
 * - Users care about recency, not exact time
 * - Common pattern in modern apps
 * 
 * EXAMPLES:
 * - Less than 1 minute: "just now"
 * - Less than 1 hour: "5 minutes ago"
 * - Less than 1 day: "3 hours ago"
 * - Less than 1 week: "2 days ago"
 * - Older: "Jan 15" or "Jan 15, 2023"
 */
function formatDate(dateString) {
    // Convert string to Date object
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate differences in various units
    const diffMs = now - date; // Difference in milliseconds
    const diffMins = Math.floor(diffMs / 60000); // 60000 ms = 1 minute
    const diffHours = Math.floor(diffMs / 3600000); // 3600000 ms = 1 hour
    const diffDays = Math.floor(diffMs / 86400000); // 86400000 ms = 1 day
    
    // Return appropriate format based on age
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        // Only show year if it's different from current year
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// ============================================================================
// SECTION 11: APPLICATION STARTUP
// ============================================================================

/**
 * APPLICATION INITIALIZATION
 * 
 * This code runs when the page loads. It waits for the DOM to be ready,
 * then calls our init() function to start the application.
 * 
 * WHY WE CHECK document.readyState:
 * - JavaScript might run before HTML is fully loaded
 * - We need to wait for DOM elements to exist
 * - Otherwise, getElementById() would return null
 * 
 * TWO SCENARIOS:
 * 1. If DOM is still loading: Wait for DOMContentLoaded event
 * 2. If DOM is already loaded: Call init() immediately
 */

if (document.readyState === 'loading') {
    // DOM is still loading, so wait for it
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already loaded, start immediately
    init();
}

/**
 * GLOBAL FUNCTION EXPOSURE
 * 
 * WHY WE DO THIS:
 * - We use inline event handlers in HTML (onclick="functionName()")
 * - These need to be globally accessible
 * - window.functionName makes them available globally
 * 
 * ALTERNATIVE APPROACH:
 * - Could use addEventListener() for all events
 * - Would avoid global scope pollution
 * - But inline handlers are simpler for this app
 * 
 * FUNCTIONS EXPOSED:
 * - handleToggleTodo: Called from checkbox onchange
 * - handleEditTodo: Called from edit button onclick
 * - handleDeleteTodo: Called from delete button onclick
 * - closeEditModal: Called from modal close button
 * - hideError: Called from error message close button
 * - clearAllCompleted: Called from footer link
 */
window.handleToggleTodo = handleToggleTodo;
window.handleEditTodo = handleEditTodo;
window.handleDeleteTodo = handleDeleteTodo;
window.closeEditModal = closeEditModal;
window.hideError = hideError;
window.clearAllCompleted = clearAllCompleted;

/**
 * ============================================================================
 * END OF APPLICATION
 * ============================================================================
 * 
 * CONGRATULATIONS! You've reached the end of the code.
 * 
 * KEY TAKEAWAYS:
 * 1. Async/await makes asynchronous code readable
 * 2. Separation of concerns keeps code organized
 * 3. Error handling prevents crashes and improves UX
 * 4. State management keeps UI in sync with data
 * 5. Security (XSS prevention) is important
 * 6. User feedback (loading, errors, success) improves experience
 * 
 * NEXT STEPS TO LEARN:
 * - Try adding new features (search, sorting, etc.)
 * - Experiment with the code
 * - Read about JavaScript promises and async/await
 * - Learn about modern frameworks (React, Vue, etc.)
 * 
 * HAPPY CODING! 🚀
 * ============================================================================
 */

// Made with Bob

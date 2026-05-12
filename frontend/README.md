# Todo App - Frontend

A modern, responsive frontend for the Todo application built with vanilla HTML, CSS, and JavaScript.

## Features

- ✨ Clean, modern UI design
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Beautiful gradient theme
- ⚡ Fast and lightweight (no frameworks)
- 🔄 Real-time updates
- 🎯 Filter todos (All, Active, Completed)
- ✏️ Edit todos with modal dialog
- 🗑️ Delete todos with confirmation
- ✅ Mark todos as complete/incomplete
- 📝 Add descriptions to todos
- 🕐 Relative timestamps (e.g., "2 hours ago")
- 🎭 Smooth animations and transitions
- 🔒 XSS protection with HTML escaping

## Prerequisites

- A web server to serve the files (Python, Node.js, or any HTTP server)
- Backend API running on `http://localhost:5000`

## Quick Start

### Option 1: Python HTTP Server (Recommended)

```bash
cd frontend
python -m http.server 8000
```

Then open: http://localhost:8000

### Option 2: Python 3

```bash
cd frontend
python3 -m http.server 8000
```

### Option 3: Node.js (http-server)

```bash
# Install http-server globally (one time)
npm install -g http-server

# Run server
cd frontend
http-server -p 8000
```

### Option 4: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Project Structure

```
frontend/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styling (738 lines)
├── js/
│   └── app.js          # Application logic (518 lines)
└── README.md           # This file
```

## Configuration

### API Endpoint

The frontend connects to the backend API at `http://localhost:5000/api` by default.

To change this, edit `js/app.js`:

```javascript
const API_BASE_URL = 'http://your-api-url.com/api';
```

## Features Breakdown

### 1. Add Todo
- Input field for title (required, max 200 chars)
- Textarea for description (optional, max 500 chars)
- Form validation
- Success/error messages

### 2. Todo List
- Display all todos with title and description
- Checkbox to mark complete/incomplete
- Edit button to modify todo
- Delete button with confirmation
- Relative timestamps
- Visual distinction for completed todos

### 3. Filters
- **All**: Show all todos
- **Active**: Show only incomplete todos
- **Completed**: Show only completed todos
- Count badges for each filter

### 4. Edit Modal
- Modal dialog for editing todos
- Update title and description
- Cancel or save changes
- Close on background click or ESC key

### 5. Responsive Design
- Desktop: Full-width layout with sidebar
- Tablet: Optimized spacing
- Mobile: Stacked layout, full-width buttons

## UI Components

### Color Scheme
- Primary: `#667eea` (Purple-blue)
- Secondary: `#764ba2` (Purple)
- Success: `#48bb78` (Green)
- Danger: `#f56565` (Red)

### Typography
- System font stack for native look
- Responsive font sizes
- Clear hierarchy

### Animations
- Slide-in for new todos
- Fade-in for messages
- Smooth transitions on hover
- Scale effects on buttons

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## API Integration

The frontend communicates with the backend using the Fetch API:

### Endpoints Used

```javascript
GET    /api/todos           // Get all todos
POST   /api/todos           // Create todo
PUT    /api/todos/:id       // Update todo
DELETE /api/todos/:id       // Delete todo
```

### Request Format

```javascript
// Create todo
POST /api/todos
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

// Update todo
PUT /api/todos/1
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

### Response Format

```javascript
// Success
{
  "success": true,
  "data": { /* todo object */ }
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

## Development

### File Organization

**index.html**
- Semantic HTML5 structure
- Accessibility attributes
- Meta tags for SEO and mobile

**css/styles.css**
- CSS variables for theming
- Mobile-first responsive design
- BEM-like naming convention
- Organized by component

**js/app.js**
- Modular function organization
- Clear separation of concerns
- Comprehensive error handling
- JSDoc comments

### Code Style

- **HTML**: Semantic, accessible markup
- **CSS**: Organized by component, uses CSS variables
- **JavaScript**: ES6+, async/await, clear naming

### Adding New Features

1. **Add HTML structure** in `index.html`
2. **Style the component** in `css/styles.css`
3. **Add functionality** in `js/app.js`
4. **Test on multiple devices**

## Customization

### Change Theme Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... other colors */
}
```

### Modify Layout

Adjust spacing variables:

```css
:root {
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    /* ... other spacing */
}
```

### Change Animations

Modify transition speeds:

```css
:root {
    --transition-fast: 150ms ease-in-out;
    --transition-base: 200ms ease-in-out;
}
```

## Troubleshooting

### Issue: CORS errors in console
**Solution**: Ensure backend is running and CORS is enabled

### Issue: Todos not loading
**Solution**: 
1. Check backend is running on port 5000
2. Verify API_BASE_URL in `js/app.js`
3. Check browser console for errors

### Issue: Styles not loading
**Solution**: 
1. Ensure you're using a web server (not file://)
2. Check file paths are correct
3. Clear browser cache

### Issue: Buttons not working
**Solution**: 
1. Check browser console for JavaScript errors
2. Ensure `app.js` is loaded
3. Verify backend API is responding

## Performance

- **Lightweight**: No external dependencies
- **Fast Load**: ~50KB total (HTML + CSS + JS)
- **Optimized**: Minimal DOM manipulation
- **Efficient**: Debounced API calls

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Color contrast compliant

## Security

- ✅ XSS protection (HTML escaping)
- ✅ Input validation
- ✅ No inline scripts
- ✅ Content Security Policy ready

## Testing

### Manual Testing Checklist

- [ ] Add a new todo
- [ ] Add todo with description
- [ ] Mark todo as complete
- [ ] Mark todo as incomplete
- [ ] Edit todo title
- [ ] Edit todo description
- [ ] Delete todo
- [ ] Filter by All/Active/Completed
- [ ] Clear completed todos
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Test with slow network
- [ ] Test error handling

### Browser Testing

Test in multiple browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

## Deployment

### Static Hosting

Deploy to any static hosting service:

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**GitHub Pages:**
1. Push to GitHub repository
2. Enable GitHub Pages in settings
3. Select branch and `/frontend` folder

### Environment Variables

For production, update API URL:

```javascript
const API_BASE_URL = process.env.API_URL || 'https://your-api.com/api';
```

## Future Enhancements

Potential features to add:
- [ ] Dark mode toggle
- [ ] Drag and drop reordering
- [ ] Todo categories/tags
- [ ] Due dates with calendar
- [ ] Priority levels
- [ ] Search functionality
- [ ] Bulk actions
- [ ] Export/import todos
- [ ] Offline support (Service Worker)
- [ ] Push notifications

## Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

## License

MIT

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**
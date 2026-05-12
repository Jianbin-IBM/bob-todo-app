# GitHub Setup Guide

This guide will help you create a GitHub repository and push your todo app code.

## Prerequisites

- GitHub account
- Git installed locally
- GitHub CLI (optional but recommended)

## Option 1: Using GitHub CLI (Recommended)

### Step 1: Install GitHub CLI (if not already installed)

**macOS:**
```bash
brew install gh
```

**Windows:**
```bash
winget install --id GitHub.cli
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh
```

### Step 2: Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate.

### Step 3: Create Repository and Push

```bash
# Create the repository on GitHub
gh repo create bob-todo-app --public --source=. --remote=origin --push

# Or if you want it private
gh repo create bob-todo-app --private --source=. --remote=origin --push
```

That's it! Your repository is created and code is pushed.

---

## Option 2: Using GitHub Web Interface

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `bob-todo-app`
3. Description: "Full-stack todo application with Flask backend and vanilla JavaScript frontend"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Add Remote and Push

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/bob-todo-app.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Option 3: Using SSH (If you have SSH keys set up)

### Step 1: Create Repository on GitHub (same as Option 2)

### Step 2: Add Remote and Push with SSH

```bash
# Add GitHub as remote (SSH)
git remote add origin git@github.com:YOUR_USERNAME/bob-todo-app.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

---

## Verify Your Repository

After pushing, visit:
```
https://github.com/YOUR_USERNAME/bob-todo-app
```

You should see:
- ✅ All 22 files
- ✅ README.md displayed on the main page
- ✅ Commit history
- ✅ Project structure

---

## Repository Settings (Optional)

### Add Topics

Add these topics to help others discover your project:
- `flask`
- `python`
- `javascript`
- `todo-app`
- `rest-api`
- `sqlite`
- `vanilla-js`
- `full-stack`

### Enable GitHub Pages (Optional)

To host the frontend:
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: /frontend
5. Save

### Add Repository Description

In the repository settings, add:
```
Full-stack todo application with Flask REST API backend and vanilla JavaScript frontend. Features include CRUD operations, filtering, and 98% test coverage.
```

---

## Troubleshooting

### Error: "remote origin already exists"

```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/bob-todo-app.git
```

### Error: "failed to push some refs"

```bash
# Force push (only if you're sure)
git push -u origin main --force
```

### Error: "Permission denied (publickey)"

You need to set up SSH keys:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to ssh-agent: `ssh-add ~/.ssh/id_ed25519`
3. Add public key to GitHub: Settings → SSH and GPG keys → New SSH key
4. Copy key: `cat ~/.ssh/id_ed25519.pub`

---

## Quick Reference

```bash
# Check remote
git remote -v

# Check status
git status

# View commit history
git log --oneline

# Push changes
git push

# Pull changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

## What's Already Done

✅ Git repository initialized
✅ All files committed
✅ .gitignore configured
✅ README.md created
✅ Clean working directory

**You just need to create the GitHub repository and push!**

---

## Repository Structure on GitHub

Once pushed, your repository will have:

```
bob-todo-app/
├── 📄 README.md (displayed on main page)
├── 📁 backend/ (Flask API)
├── 📁 frontend/ (JavaScript UI)
├── 📄 PROJECT_PLAN.md
├── 📄 ARCHITECTURE.md
├── 📄 IMPLEMENTATION_GUIDE.md
└── 📄 .gitignore
```

---

## Next Steps After Pushing

1. **Add a LICENSE** (MIT recommended)
2. **Enable Issues** for bug tracking
3. **Add GitHub Actions** for CI/CD (optional)
4. **Create a Project Board** for task management
5. **Invite Collaborators** if working in a team

---

**Need help?** Check the [GitHub Docs](https://docs.github.com/en/get-started/quickstart/create-a-repo)
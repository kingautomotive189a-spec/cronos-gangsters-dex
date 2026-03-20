# GitHub Pages Deployment Guide

## Step 1: Install gh-pages package
After cloning your repo locally:
```bash
cd frontend
yarn add gh-pages --dev
```

## Step 2: Update package.json
Add these lines to your package.json:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
  "scripts": {
    "predeploy": "yarn build",
    "deploy": "gh-pages -d build"
  }
}
```

## Step 3: Deploy
```bash
yarn deploy
```

## Step 4: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **gh-pages** branch
4. Click **Save**

Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## Alternative: GitHub Actions (Automatic Deploys)
Create `.github/workflows/deploy.yml` for automatic deploys on every push.

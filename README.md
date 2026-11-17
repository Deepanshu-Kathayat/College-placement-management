# CampusHire College Placement Management System

CampusHire is a responsive frontend project for managing college placement activities. It gives students one dashboard for placement drives, applications, deadlines, profile completeness, and placement progress.

## Features

- Responsive dashboard with sidebar navigation and placement statistics.
- Search and filter placement drives by company, role, or category.
- Application modal with local application history in Local Storage.
- Upcoming deadline list and recent application status cards.
- Student profile completeness panel.
- Optional Node.js server using built-in modules to serve static files and save application records to `data/placement_data.json`.
- MongoDB-ready data shape for a future database-backed placement cell portal.

## Run locally

```bash
cd placement-management
node server.js
```

Open `http://localhost:3000` in a browser. The dashboard also works by opening `index.html` directly, but the Node server enables the optional API.

## Git repository setup

```bash
git init
git add .
git commit -m "Build College Placement Management System"
git branch -M main
git remote add origin https://github.com/your-username/college-placement-management.git
git push -u origin main
```

## Repository structure

```text
placement-management/
|-- index.html
|-- styles.css
|-- app.js
|-- server.js
|-- package.json
|-- data/placement_data.json
|-- README.md
`-- .gitignore
```

## Course mapping

| Course topic | Implementation |
|---|---|
| HTML and forms | Semantic dashboard, search input, application form, labels, buttons |
| CSS | Flexbox, Grid, media queries, custom properties, responsive layout |
| JavaScript | DOM rendering, filters, search, modal events, Local Storage |
| Async and server connection | `fetch()` sends applications to the Node.js API |
| Node.js | Built-in HTTP server, static file serving, JSON persistence |
| MongoDB | Future-ready model for students, drives, applications, and offers |

# Lab Reservation System

Created by: Abagat, Casem, Gonzales, & Luyun [CCAPDEV S18 Group 6]

---

This is a Node.js/Express application for managing laboratory reservations with user authentication, role-based access, and a modern UI using Handlebars.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

## Setup Instructions

1. **Clone/Download the repository:**
   ```bash
   git clone https://github.com/your-username/CCAPDEV_MCO.git
   cd CCAPDEV_MCO
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure MongoDB connection:**
   - Edit `compass-connections.json` or update your connection string in the code as needed.
   - Make sure MongoDB is running locally or update the connection to your cloud instance.

4. **Seed the database (optional):**
   - To populate the database with sample data, run:
     ```bash
     node init.js
     ```

5. **Start the application:**
   ```bash
   node app.js
   ```
   - The server will start on the default port (e.g., 3000). You can access the app at [http://localhost:3000](http://localhost:3000).

## Folder Structure
- `app.js` - Main application entry point
- `controllers/` - Route controllers
- `models/` - Mongoose models
- `routes/` - Express route definitions
- `views/` - Handlebars templates
- `public/` - Static assets (CSS, JS, images)

## Features
- User registration and login (Student/Technician roles)
- Create, edit, and delete lab reservations
- Role-based access control
- Responsive UI with Bootstrap

## Troubleshooting
- Ensure MongoDB is running and accessible.
- If you change the database connection, update it in the code/config.
- For any issues, check the console output for errors.
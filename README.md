# CollegeEventsWebsite

Project Description:

Overview:
Many universities host a variety of events, including social gatherings, fundraisers, and tech talks, which are often organized by student-led groups such as Registered Student Organizations (RSOs). However, existing university event websites have limitations:

They only list official university events, leaving out many student-organized activities.
Students must manually check university websites to track upcoming events.
There is no centralized way to explore and manage both public and private events.

Solution
This project aims to develop a web-based application that provides a comprehensive event management platform for college students, organizations, and administrators. The platform allows users to discover, create, and manage campus events more efficiently.

Key Features
User Roles & Authentication
Super Admin: Manages university profiles and approves public events.
Admin (RSO Leaders): Creates and manages events for their student organizations.
Students: Browse and interact with events (comment, rate, and join RSOs).
Event Management
Create events with name, category, description, time, location (map integration), and contact details.
Different event visibility levels:
Public Events: Visible to everyone.
Private Events: Only accessible to students from the university.
RSO Events: Exclusive to members of a specific student organization.
Super Admin approval required for non-RSO public events.
Social Engagement
Users can comment, edit, and rate events (1-5 stars).
Social media integration for sharing events.
User & Organization Management
Students can create or join RSOs, requiring a minimum of five members from the same university email domain.

Technical Details
Frontend: Built with Vite, JavaScript, HTML, and CSS for a fast and modern web experience.
Backend: Developed using Express.js and PostgreSQL for efficient data handling.
Database: At least five relational tables, enforcing constraints using SQL triggers.
Scalability: Supports multiple concurrent users with efficient data indexing.
Additional Features: Integration with university event feeds (e.g., events.ucf.edu), security measures, and potential social media APIs.


Getting Started:

Prerequisites
npm
    npm install npm@latest -g
*Frontend Setup:

1. Navigate to the Frontend Folder from the root project directory
    cd frontend/ 

2. Install all Project Dependencies From package.json file
    npm install 

3. Run and Starts the Frontend Vite Configured Server
    npm run dev 


*Backend Setup:

1. Navigate to the Backend Folder from the root directory
    cd backend/

2. Creates a .env file (Stores Sensitive Project Credentials) from .env.example template
** Make Sure to Fill in the Specific Database Credentials in the .env file
    cp .env.example .env

3. Runs and Starts the Backend Server
    npm start


Common Setup Errors:

1. Port Conflicts

Error Code: "EADDRINUSE"

Change Port Code in .env file and index.js in backend/src/index.js file to an unoccupied port
# 🎓 College Events Website.

## 📌 Project Description  

### **Overview**  
Many universities host a variety of events, including **social gatherings, fundraisers, and tech talks**, often organized by **Registered Student Organizations (RSOs)**. However, existing university event websites have limitations:  

- ❌ Often only list **official university events**, leaving out many student-organized activities.  
- ❌ Students must **manually check** university websites to track upcoming events.  
- ❌ No **centralized way** to explore and manage both **public and private** events.  

### **💡 Solution**  
This project aims to develop a **web-based application** that provides a **comprehensive event management platform** for students, organizations, and administrators. The platform enables users to:  

✅ **Discover, create, and manage** campus events efficiently.  
✅ Improve **event visibility and accessibility** for students.  
✅ Support **multiple event types** with role-based access control.  

---

## 🚀 Key Features  

### **👤 User Roles & Authentication**  
- **Super Admin**: Manages university profiles & approves public events.  
- **Admin (RSO Leaders)**: Creates & manages events for their student organizations.  
- **Students**: Browse and interact with events (**comment, rate, and join RSOs**).  

### **📅 Event Management**  
- Create events with:  
  - **Name**, **Category**, **Description**, **Time**, **Date**, **Location (Map Integration)**, **Contact Details**  
- **Event Visibility Levels**:  
  - 🟢 **Public Events** → Visible to everyone.  
  - 🔵 **Private Events** → Accessible only to students of the host university.  
  - 🟠 **RSO Events** → Exclusive to members of a specific RSO.  
- ✅ **Super Admin approval required** for non-RSO public events.  

### **💬 Social Engagement**  
- Users can **comment, edit, and rate** events (**1-5 stars**).  
- **Social media integration** for event sharing.  

### **🏫 User & Organization Management**  
- Students can **create or join RSOs**.  
- New RSOs require **at least five members** from the same university email domain.  

---

## 🛠️ Technical Details  

- **Frontend**: Built with **Vite, JavaScript, HTML, and CSS** for a modern, fast UI.  
- **Backend**: Developed using **Express.js and PostgreSQL** for robust data handling.  
- **Database**: Includes at least **five relational tables** with **SQL triggers**.  
- **Scalability**: Supports **multiple concurrent users** with efficient indexing.  
- **Additional Features**:  
  - Integration with **university event feeds** (e.g., [events.ucf.edu](https://events.ucf.edu)).  
  - Security measures and **potential social media APIs**.  

---

## 🏁 Getting Started  

### **🔧 Prerequisites**  
Ensure you have **Node.js** and **npm** installed. Install the latest npm version with:  

```sh
npm install npm@latest -g
```

## 🎨 Frontend Setup  

💻 Follow these steps to set up the frontend of the project:

1️⃣ Navigate to the **frontend folder** from the root directory:  
   ```sh
   cd frontend/
```
2️⃣ Install all Project Dependencies From the package.json:  
   ```sh
   npm install
```
3️⃣ Starts the Frontend Vite Configured Server:  
   ```sh
   npm run dev
```

## 🖥️ Backend Setup  

🛠️ Follow these steps to set up the backend of the project:

1️⃣ Navigate to the **backend folder** from the root directory:  
   ```sh
   cd backend/
```
2️⃣ Install all Project Dependencies From the package.json:  
   ```sh
   npm install
```
3️⃣ Creates a .environment file (Stores Sensitive Projec Credentials) from .env.example template:  
    - **Make Sure to incldue the Correct Database Information in the .env file**
   ```sh
   cp .env.example .env
```
4️⃣ Starts the Backend Server:  
   ```sh
   npm start
```
## ⚠️ Common Setup Errors  

🚨 Here are some common setup issues and how to resolve them:  

### **1️⃣ Port Conflicts**  
💡 **Error:** `EADDRINUSE` (Address already in use)  
🔹 **Solution:** Change the port in:  
- `.env` file  
- `backend/src/index.js`  

To an **unoccupied port**, then restart the backend server:  
```sh
npm start
```

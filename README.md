# Project Organizer

## Overview
This application is designed to help users organize their projects efficiently, providing features for task management, deadline tracking, and collaboration tools.

## Firebase Configuration Setup Instructions
1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click on 'Add project' and follow the prompts to create a new project.

2. **Add a Web App**:
   - In your Firebase project, click on the web icon (</>) to add a web app.
   - Register your app and Firebase will provide you with the configuration object.

3. **Install Firebase SDK**:
   - If you haven't already, install Firebase SDK using npm:
     ```bash
     npm install firebase
     ```

4. **Initialize Firebase in Your Project**:
   - Import Firebase and initialize it with your configuration object:
   ```javascript
   import { initializeApp } from "firebase/app";
   
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   
   const app = initializeApp(firebaseConfig);
   ```

5. **Set Up Database**:
   - Choose Firestore or Realtime Database based on your project requirements.
   - Follow the Firebase documentation to create the necessary database structure.

## How to Use the Application
1. **Clone the Repository**:
   - Use the following command to clone the repository:
   ```bash
   git clone https://github.com/mlaurentUSL/ProjectOrganizer.git
   ```

2. **Install Dependencies**:
   - Navigate to the project directory and run:
   ```bash
   npm install
   ```

3. **Run the Application**:
   - Start the application using:
   ```bash
   npm start
   ```
   - Open a browser and go to `http://localhost:3000` to access the application.

4. **Manage Your Projects**:
   - Use the interface to add, edit, and delete projects and tasks.

## Contributing
Feel free to submit issues or pull requests for any improvements or bug fixes!
# SNav - Safe Route Provider

SNav is a mobile application developed using React Native that serves as a Safe Route provider for travelers. It integrates various services such as Firebase for authentication, Firestore database for storing user data, Twilio for SMS services, Google Maps API for map services, and Express.js for the backend.

## Features

- **Secure Authentication**: Users can securely sign up and log in using Firebase authentication.
- **Profile Management**: Users can manage their profiles, update information, and view their account details.
- **Route Planning**: SNav provides users with the ability to plan their routes, ensuring safety and security.
- **Emergency Assistance**: In case of emergencies, users can easily request assistance through the app, which utilizes Twilio's SMS services to send alerts.
- **Location Tracking**: The app utilizes Google Maps API to provide real-time location tracking and navigation services.
- **Customizable Settings**: Users can customize their preferences and settings to tailor the app to their needs.

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/snav.git


2. Install dependencies:
   cd snav
   npm install


3. Set up Firebase:
- Create a Firebase project on the [Firebase Console](https://console.firebase.google.com/).
- Enable authentication with email/password.
- Set up Firestore database.
- Obtain your Firebase configuration and replace it in the project files.

4. Set up Twilio:
- Sign up for a Twilio account and obtain your API credentials.
- Configure Twilio to enable SMS services.
- Replace Twilio API credentials in the project files.

5. Set up Google Maps API:
- Obtain an API key from the Google Cloud Console.
- Enable the Maps JavaScript API and Geocoding API.
- Replace the API key in the project files.

6. Set up Express.js backend:
- Set up an Express.js server with necessary endpoints for the app.
- Replace the server URL in the project files.
- Run the server: "node server.js"


7. Run the app:
   npm start


## Usage

- After installation, users can sign up or log in to the app using their email and password.
- Upon logging in, users can access various features such as route planning, profile management, emergency assistance, and more.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests for any improvements or bug fixes.

## Credits

SNav is developed by [Your Name](https://github.com/ItachI008).



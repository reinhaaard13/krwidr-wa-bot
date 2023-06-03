// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import dotenv from "dotenv";
dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "koridr-wa-bot.firebaseapp.com",
  databaseURL: "https://koridr-wa-bot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "koridr-wa-bot",
  storageBucket: "koridr-wa-bot.appspot.com",
  messagingSenderId: "1046272641011",
  appId: "1:1046272641011:web:cdd443c905fc273c4c3486",
  measurementId: "G-02L7XT2S8D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
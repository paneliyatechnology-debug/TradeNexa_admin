/**
 * ==============================================================================
 * TradeNexa Admin - Firebase Configuration
 * ==============================================================================
 */

import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA69_MjbZ22YnkFxPqLWOGSOfuJPB44Ni0",
  authDomain: "tradehub-b7b28.firebaseapp.com",
  projectId: "tradehub-b7b28",
  storageBucket: "tradehub-b7b28.firebasestorage.app",
  messagingSenderId: "42547333485",
  appId: "1:42547333485:web:5c4dbbdc1ee9f95cb6b264",
  measurementId: "G-4BWH7SKJQH",
};

// Prevent re-initializing on hot reloads
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default firebaseApp;

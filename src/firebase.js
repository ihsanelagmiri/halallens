import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmpftDQpwKPFv4l59nEcpVXSPOcxjAiy8",
  authDomain: "halalhan-f7d24.firebaseapp.com",
  projectId: "halalhan-f7d24",
  storageBucket: "halalhan-f7d24.firebasestorage.app",
  messagingSenderId: "347701734518",
  appId: "1:347701734518:web:f8339c05ee1cf36488c357",
  measurementId: "G-SBKZ95E288"
};

// Initialize Firebases
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
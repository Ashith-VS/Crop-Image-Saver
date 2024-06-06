import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDGVVSPIBa-OY_eDAa_vU0yAX7ffsZqkpw",
  authDomain: "todolist-e8c13.firebaseapp.com",
  projectId: "todolist-e8c13",
  storageBucket: "todolist-e8c13.appspot.com",
  messagingSenderId: "1097068272002",
  appId: "1:1097068272002:web:fd1b093aeec0169797979b",
  measurementId: "G-0ZKEG6DSB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZbTld5cOSn8yt-4QjxT54Spa2YZhJcLk",
  authDomain: "carweb-c4504.firebaseapp.com",
  projectId: "carweb-c4504",
  storageBucket: "carweb-c4504.appspot.com",
  messagingSenderId: "532505089595",
  appId: "1:532505089595:web:fcf66aecf176387e106e1e",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };

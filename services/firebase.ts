
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYdWvZbTTkGlfI6vv02EFUMbw5eeF4UpU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sample-firebase-adddi-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sample-firebase-adddi-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sample-firebase-adddi-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1013529485030",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1013529485030:web:3dd9b79cd7d7ba41b42527"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تفعيل ميزة التخزين المؤقت المحلي (Persistence)
// تسمح هذه الميزة للتطبيق بالعمل دون إنترنت ومزامنة البيانات لاحقاً
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // تعدد التبويبات المفتوحة قد يمنع التفعيل في أكثر من تبويب
      console.warn("Firebase Persistence: Multiple tabs open, persistence enabled in only one tab.");
    } else if (err.code === 'unimplemented') {
      // المتصفح لا يدعم الميزة
      console.warn("Firebase Persistence: Browser doesn't support offline persistence.");
    }
  });
} catch (e) {
  console.error("Firebase Persistence Error:", e);
}

export { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  where 
};

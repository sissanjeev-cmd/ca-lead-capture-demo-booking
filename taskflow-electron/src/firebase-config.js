// ── TaskFlow Firebase Configuration ────────────────────────────────────────
// Follow these steps to get your values:
//
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" (or select an existing one)
// 3. In the left sidebar: Authentication → Sign-in method → Enable "Google"
// 4. In the left sidebar: Firestore Database → Create database → Production mode
//    (choose the region closest to you, e.g. nam5 for US)
// 5. Firestore → Rules tab → paste the rules below → Publish
// 6. Project Settings (gear icon) → Your apps → Add app → Web (</>)
//    Copy the firebaseConfig values and paste below
//
// ── Firestore Security Rules ────────────────────────────────────────────────
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId}/tasks/{taskId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }
// ────────────────────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey:            "AIzaSyBY-WmP2AlhbWYp2ZKkUEtL4EWD8eg5I8c",
  authDomain:        "tasksreminders-9e7a8.firebaseapp.com",
  projectId:         "tasksreminders-9e7a8",
  storageBucket:     "tasksreminders-9e7a8.firebasestorage.app",
  messagingSenderId: "593931374306",
  appId:             "1:593931374306:web:b4c73694e5dbfc2cead8bb",
  measurementId:     "G-QEKFTTPBS6"
};

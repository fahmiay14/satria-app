import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth' // <-- Tambahkan signInAnonymously
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD44Pjk7UKcu08H3CEeSOoEXfHlxbm9lvM',
  authDomain: 'db-arsip-153a0.firebaseapp.com',
  projectId: 'db-arsip-153a0',
  storageBucket: 'db-arsip-153a0.firebasestorage.app',
  messagingSenderId: '1038523807909',
  appId: '1:1038523807909:web:80b536fab08d1ca6a3754c'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// TAMBAHKAN BARIS INI AGAR DIBERIKAN AKSES OLEH FIRESTORE
signInAnonymously(auth).catch((error) => {
  console.error("Gagal login anonim Firebase:", error)
})

export { app, auth, db }
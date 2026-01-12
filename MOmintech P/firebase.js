<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyA2hfoccqz8w_tDbK06dHAp-1vgQFqyLdo",
    authDomain: "momintech-1.firebaseapp.com",
    projectId: "momintech-1",
    storageBucket: "momintech-1.firebasestorage.app",
    messagingSenderId: "849179614240",
    appId: "1:849179614240:web:41d2ec6e0be36cbd50b045"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  window.db = db; // expose globally
</script>

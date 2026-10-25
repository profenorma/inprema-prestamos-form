// Importar o inicializar Firebase (Usando CDN SDK modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Reemplaza esto con la configuración de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ID único del formulario (puedes cambiarlo o generarlo dinámicamente por usuario/trámite)
const docId = "solicitud_activa";

document.addEventListener("DOMContentLoaded", async () => {
  const inputs = document.querySelectorAll("input");

  // 1. Intentar cargar datos desde Firestore al iniciar
  try {
    const docRef = doc(db, "solicitudes", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      inputs.forEach(input => {
        if (input.id && data[input.id] !== undefined) {
          input.value = data[input.id];
          localStorage.setItem(input.id, data[input.id]); // Respaldo local
        }
      });
    }
  } catch (error) {
    console.warn("Modo offline o error al conectar a Firestore, usando localStorage:", error);
    // Fallback a localStorage si falla la red
    inputs.forEach(input => {
      if (!input.id) return;
      const savedValue = localStorage.getItem(input.id);
      if (savedValue !== null) input.value = savedValue;
    });
  }

  // 2. Guardar cambios automáticamente en LocalStorage y Firestore al escribir
  inputs.forEach(input => {
    if (!input.id) return;

    input.addEventListener("input", async () => {
      const value = input.value;
      localStorage.setItem(input.id, value);

      // Sincronización en tiempo real con Firestore
      try {
        const payload = { [input.id]: value, updatedAt: new Date() };
        await setDoc(doc(db, "solicitudes", docId), payload, { merge: true });
      } catch (err) {
        console.error("Error al sincronizar con Firestore:", err);
      }
    });
  });
});

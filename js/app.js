import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de tu proyecto Firebase (Asegúrate de poner tus credenciales reales aquí cuando gustes)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docId = "contenido_global_formulario";

document.addEventListener("DOMContentLoaded", async () => {
  const inputs = document.querySelectorAll("input");
  const editableElements = document.querySelectorAll("[data-editable]");
  
  // Crear una barra flotante de control de diseño (Interlineado y Fuente)
  const toolbar = document.querySelector(".toolbar") || document.body;
  const controlPanel = document.createElement("div");
  controlPanel.innerHTML = `
    <div style="background:#2b3a4a; color:#fff; padding:10px; margin-bottom:15px; display:flex; gap:15px; align-items:center; border-radius:4px; font-size:9pt;">
      <label>🔤 Fuente: <input type="range" id="fontSizeRange" min="8" max="12" step="0.5" value="9.5"></label>
      <label>📏 Interlineado: <input type="range" id="lineHeightRange" min="1.1" max="1.8" step="0.1" value="1.4"></label>
      <button id="toggleEdit" style="background:#4CAF50; color:#fff; border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:3px;">✏️ Activar Edición de Textos</button>
    </div>
  `;
  toolbar.parentNode.insertBefore(controlPanel, toolbar);

  let isEditingEnabled = false;
  const toggleEditBtn = document.getElementById("toggleEdit");
  const fontSizeRange = document.getElementById("fontSizeRange");
  const lineHeightRange = document.getElementById("lineHeightRange");

  // 1. Cargar datos y estilos desde Firestore o LocalStorage al iniciar
  try {
    const docRef = doc(db, "configuraciones", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Restaurar Inputs
      inputs.forEach(input => {
        if (input.id && data.inputs && data.inputs[input.id] !== undefined) {
          input.value = data.inputs[input.id];
          localStorage.setItem(input.id, data.inputs[input.id]);
        }
      });

      // Restaurar Textos Editables
      editableElements.forEach(el => {
        const key = el.getAttribute("data-editable");
        if (data.texts && data.texts[key] !== undefined) {
          el.innerHTML = data.texts[key];
        }
      });

      // Restaurar Estilos
      if (data.styles) {
        document.body.style.fontSize = data.styles.fontSize + "pt";
        document.body.style.lineHeight = data.styles.lineHeight;
        fontSizeRange.value = data.styles.fontSize;
        lineHeightRange.value = data.styles.lineHeight;
      }
    }
  } catch (err) {
    console.warn("Trabajando offline, cargando desde LocalStorage:", err);
    inputs.forEach(input => {
      if (!input.id) return;
      const saved = localStorage.getItem(input.id);
      if (saved !== null) input.value = saved;
    });
  }

  // 2. Habilitar / Deshabilitar modo edición de textos estáticos
  toggleEditBtn.addEventListener("click", () => {
    isEditingEnabled = !isEditingEnabled;
    editableElements.forEach(el => {
      el.contentEditable = isEditingEnabled;
      el.style.outline = isEditingEnabled ? "2px dashed #ff9800" : "none";
      el.style.background = isEditingEnabled ? "#fffde7" : "transparent";
    });
    toggleEditBtn.style.background = isEditingEnabled ? "#d32f2f" : "#4CAF50";
    toggleEditBtn.textContent = isEditingEnabled ? "🔒 Bloquear Edición" : "✏️ Activar Edición de Textos";
  });

  // Función genérica para guardar todo en Firestore y LocalStorage
  async function saveDataToCloud() {
    const inputsData = {};
    inputs.forEach(input => { if (input.id) inputsData[input.id] = input.value; });

    const textsData = {};
    editableElements.forEach(el => {
      const key = el.getAttribute("data-editable");
      textsData[key] = el.innerHTML;
    });

    const stylesData = {
      fontSize: fontSizeRange.value,
      lineHeight: lineHeightRange.value
    };

    const payload = {
      inputs: inputsData,
      texts: textsData,
      styles: stylesData,
      updatedAt: new Date()
    };

    // Guardar local
    localStorage.setItem("app_payload", JSON.stringify(payload));

    // Guardar en la nube (Firestore)
    try {
      await setDoc(doc(db, "configuraciones", docId), payload);
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
    }
  }

  // 3. Event listeners para cambios en inputs
  inputs.forEach(input => {
    if (!input.id) return;
    input.addEventListener("input", saveDataToCloud);
  });

  // Event listeners para textos editables
  editableElements.forEach(el => {
    el.addEventListener("blur", saveDataToCloud);
  });

  // Event listeners para controles de diseño (Fuente e Interlineado)
  fontSizeRange.addEventListener("input", () => {
    document.body.style.fontSize = fontSizeRange.value + "pt";
    saveDataToCloud();
  });

  lineHeightRange.addEventListener("input", () => {
    document.body.style.lineHeight = lineHeightRange.value;
    saveDataToCloud();
  });
});

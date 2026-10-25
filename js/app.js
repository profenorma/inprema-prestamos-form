document.addEventListener("DOMContentLoaded", () => {
  // Sincronizar inputs con localStorage automáticamente
  const inputs = document.querySelectorAll("input");

  inputs.forEach(input => {
    if (!input.id) return;
    
    // Cargar valor guardado
    const savedValue = localStorage.getItem(input.id);
    if (savedValue !== null) {
      input.value = savedValue;
    }

    // Guardar al escribir
    input.addEventListener("input", () => {
      localStorage.setItem(input.id, input.value);
    });
  });
});

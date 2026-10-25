document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input[type="text"], select');
  
  inputs.forEach(input => {
    // Usamos el nombre del archivo actual (index o page2) para separar los datos guardados
    const pagePrefix = window.location.pathname.includes('page2') ? 'inprema_p2_' : 'inprema_p1_';
    const savedValue = localStorage.getItem(pagePrefix + input.id);
    if (savedValue) input.value = savedValue;

    input.addEventListener('input', () => {
      localStorage.setItem(pagePrefix + input.id, input.value);
    });
  });
});

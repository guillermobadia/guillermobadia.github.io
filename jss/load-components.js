// Cargar componentes HTML
document.addEventListener('DOMContentLoaded', function() {
  // Cargar el header
  fetch('components/header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar el header');
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('header-container').innerHTML = html;
      
      // Inicializar el menú móvil después de cargar el header
      initMobileMenu();
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('header-container').innerHTML = '<p>Error al cargar el header</p>';
    });
  
  // Cargar el footer
  fetch('components/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar el footer');
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('footer-container').innerHTML = html;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('footer-container').innerHTML = '<p>Error al cargar el footer</p>';
    });
});

// Inicializar el menú móvil
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Cerrar el menú al hacer clic en los enlaces
  const menuLinks = document.querySelectorAll('.mobile-menu-links a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}
/* Código JavaScript para gestionar el menú en dispositivos móviles */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del menú
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    // Abrir el menú móvil
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evitar scroll cuando el menú está abierto
            if (overlay) overlay.classList.add('active');
        });
    }
    
    // Cerrar el menú móvil
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
            if (overlay) overlay.classList.remove('active');
        });
    }
    
    // Cerrar el menú al hacer clic en el overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            overlay.classList.remove('active');
        });
    }
    
    // Cerrar el menú al hacer clic en un enlace
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            if (overlay) overlay.classList.remove('active');
        });
    });
    
    // Verificar si estamos en dispositivo móvil
    function isMobile() {
        return window.innerWidth < 768;
    }
    
    // Mostrar el botón del menú móvil solo en móviles
    function checkMobileMenu() {
        if (mobileMenuBtn) {
            if (isMobile()) {
                mobileMenuBtn.style.display = 'block';
            } else {
                mobileMenuBtn.style.display = 'none';
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                if (overlay) overlay.classList.remove('active');
            }
        }
    }
    
    // Verificar tamaño al cargar y al cambiar el tamaño de la ventana
    checkMobileMenu();
    window.addEventListener('resize', checkMobileMenu);
});
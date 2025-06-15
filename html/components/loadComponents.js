// components/loadComponents.js
async function loadComponents() {
  try {
    const [navbar, footer] = await Promise.all([
      fetch('components/navbar.html').then(res => res.text()),
      fetch('components/footer.html').then(res => res.text())
    ]);
    
    document.getElementById('navbar-placeholder').innerHTML = navbar;
    document.getElementById('footer-placeholder').innerHTML = footer;
    
    // Initialize any Bootstrap components in the navbar if needed
    if (typeof bootstrap !== 'undefined') {
      new bootstrap.Collapse(document.getElementById('navbarSupportedContent'), {
        toggle: false
      });
    }
  } catch (error) {
    console.error('Failed to load components:', error);
  }
}

// Call it when DOM is ready
document.addEventListener('DOMContentLoaded', loadComponents);
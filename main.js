/**
 * main.js — التهيئة العامة والهيدر والوضع الداكن لمكتبة مراقي المعرفة
 */

function initHeader(relativePath) {
  const root = relativePath !== undefined ? relativePath : '.';
  const headerUrl = (root ? root + '/' : '') + 'header.html';

  fetch(headerUrl)
    .then(response => {
      if (!response.ok) throw new Error('فشل جلب الهيدر');
      return response.text();
    })
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.outerHTML = html.replaceAll('PLACEHOLDER_ROOT', root || '.');
        updateThemeToggleButton();
      }
    })
    .catch(() => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.innerHTML = `
          <header id="site-header">
            <div class="header-inner container">
              <a href="${root || '.'}/index.html" id="logo-link">
                <img src="${root || '.'}/logo.png" alt="شعار مكتبة مراقي المعرفة" class="logo-img">
                <span class="logo-text">مكتبة مراقي المعرفة</span>
              </a>
              <button id="theme-toggle" class="theme-toggle" type="button" aria-label="تبديل الوضع الداكن/الفاتح">
                <span class="theme-icon sun-icon">☀️</span>
                <span class="theme-icon moon-icon">🌙</span>
                <span class="theme-text">المظهر</span>
              </button>
            </div>
          </header>`;
        updateThemeToggleButton();
      }
    });
}

function updateThemeToggleButton() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const label = document.getElementById('theme-text');
  if (label) {
    label.textContent = current === 'dark' ? 'الداكن' : 'الفاتح';
  }
}

// الاستماع لزر تبديل المظهر
document.addEventListener('click', function(e) {
  const btn = e.target.closest('#theme-toggle');
  if (!btn) return;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', nextTheme);
  try {
    localStorage.setItem('maraqi-theme', nextTheme);
  } catch(err) {}

  updateThemeToggleButton();
});

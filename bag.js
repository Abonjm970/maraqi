/**
 * bag.js — منطق عرض كتب الحقيبة وجدول القراءة لمكتبة مراقي المعرفة
 */

// ── تحميل الهيدر المشترك ──
function initHeader(relativePath) {
  const root = relativePath || '../..';
  const headerUrl = root + '/header.html';

  fetch(headerUrl)
    .then(response => {
      if (!response.ok) throw new Error('فشل جلب الهيدر');
      return response.text();
    })
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.outerHTML = html.replaceAll('PLACEHOLDER_ROOT', root);
        updateThemeToggleButton();
      }
    })
    .catch(() => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.innerHTML = `
          <header id="site-header">
            <div class="header-inner container">
              <a href="${root}/index.html" id="logo-link">
                <img src="${root}/logo.png" alt="شعار مكتبة مراقي المعرفة" class="logo-img">
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

// ── تحميل وتصيير الكتب وجدول القراءة ──
function initBag(jsonPath = 'books.json') {
  const grid = document.getElementById('books-grid');
  if (!grid) return;

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error('تعذر تحميل بيانات الكتب (' + response.status + ')');
      }
      return response.json();
    })
    .then(data => {
      grid.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('قائمة الكتب فارغة');
      }

      // بطاقات الكتب
      data.forEach((item, index) => {
        if (item.table) return; // تخطي كائن جدول القراءة
        const card = buildBookCard(item, index);
        grid.appendChild(card);
      });

      // جدول خطة القراءة
      const tableEntry = data.find(item => item.table);
      if (tableEntry && Array.isArray(tableEntry.table) && tableEntry.table.length > 0) {
        const tableSection = buildReadingTable(tableEntry.table);
        const container = grid.closest('.container');
        if (container) {
          container.appendChild(tableSection);
        }
      }
    })
    .catch(err => {
      grid.innerHTML = `
        <div class="error-state" style="grid-column: 1/-1;" role="alert">
          <p style="font-size: 3rem; margin-bottom: var(--space-2);">📚</p>
          <p>تعذّر تحميل الكتب. تأكد من تشغيل الموقع عبر خادم محلي (Local Server).</p>
          <p style="font-size: var(--text-sm); margin-top: var(--space-2); color: var(--color-text-muted);">${err.message}</p>
        </div>`;
    });
}

// ── بناء بطاقة الكتاب ──
function buildBookCard(book, index) {
  const article = document.createElement('article');
  article.className = 'book-card animate-in';
  article.setAttribute('role', 'listitem');
  article.style.animationDelay = `${index * 80}ms`;

  // تجهيز حقل المؤلف
  const authorText = (book.author && book.author.trim()) ? book.author.trim() : '—';
  const formUrl = book.form_url || 'https://forms.gle/4YaGfoH9GxrszY8PA';

  article.innerHTML = `
    <div class="book-cover-container">
      <div class="book-cover-wrapper">
        <img
          src="${escapeHtml(book.cover)}"
          alt="غلاف كتاب ${escapeHtml(book.title)}"
          class="book-cover-img"
          loading="lazy"
          onerror="this.parentElement.classList.add('cover-fallback'); this.style.display='none';"
        >
        <div class="book-spine" aria-hidden="true"></div>
      </div>
    </div>
    <div class="book-info">
      <div class="book-category-wrap">
        <span class="badge book-category">${escapeHtml(book.category || 'عام')}</span>
      </div>
      <h2 class="book-title">${escapeHtml(book.title)}</h2>
      <div class="book-author">
        <span class="book-author-label">المؤلف:</span>
        <span class="book-author-name">${escapeHtml(authorText)}</span>
      </div>
      <div class="book-actions">
        <a
          href="${escapeHtml(book.drive_id || '#')}"
          target="_blank"
          rel="noopener noreferrer"
          class="card-btn book-read-btn"
          aria-label="قراءة ${escapeHtml(book.title)} في Google Drive (يفتح في نافذة جديدة)"
        >
          <span>قراءة الكتاب</span>
          <span class="btn-arrow" aria-hidden="true">↗</span>
        </a>
        <a
          href="${escapeHtml(formUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="book-reg-btn"
          aria-label="كناشة الفوائد لكتاب ${escapeHtml(book.title)} (يفتح في نافذة جديدة)"
        >
          <span> كناشة الفوائد 🖋️</span>
        </a>
      </div>
    </div>
  `;

  return article;
}

// ── بناء جدول خطة القراءة ──
function buildReadingTable(rows) {
  const section = document.createElement('section');
  section.className = 'reading-table-section animate-in';
  section.setAttribute('aria-labelledby', 'reading-table-title');

  const title = document.createElement('h2');
  title.id = 'reading-table-title';
  title.className = 'section-title';
  title.textContent = 'جدول خطة القراءة';
  section.appendChild(title);

  const wrap = document.createElement('div');
  wrap.className = 'reading-table-wrap';

  const table = document.createElement('table');
  table.className = 'reading-table';
  table.setAttribute('dir', 'rtl');

  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col" class="th-book">الكتاب</th>
        <th scope="col" class="th-duration">المدة</th>
        <th scope="col" class="th-date">تاريخ البداية</th>
        <th scope="col" class="th-date">تاريخ النهاية</th>
        <th scope="col" class="th-task">المهمة</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  rows.forEach(row => {
    const tr = document.createElement('tr');

    const bookVal = (row.book && row.book.trim()) ? escapeHtml(row.book) : '—';
    const durationVal = (row.duration && row.duration.trim()) ? escapeHtml(row.duration) : '—';
    const startVal = (row.start_date && row.start_date.trim()) ? escapeHtml(row.start_date) : '—';
    const endVal = (row.end_date && row.end_date.trim()) ? escapeHtml(row.end_date) : '—';
    const taskVal = (row.task && row.task.trim()) ? escapeHtml(row.task) : '—';

    tr.innerHTML = `
      <td class="td-book"><strong>${bookVal}</strong></td>
      <td class="td-duration">${durationVal}</td>
      <td class="td-date">${startVal}</td>
      <td class="td-date">${endVal}</td>
      <td class="td-task">${taskVal}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrap.appendChild(table);
  section.appendChild(wrap);

  return section;
}

// ── مساعدات الحماية ──
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── إدارة الوضع الداكن / الفاتح ──
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

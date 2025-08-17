/* Dynamic Quote Generator with:
 * - Local Storage (persist quotes)
 * - Session Storage (last viewed quote)
 * - JSON Export/Import (Blob + FileReader)
 */

const STORAGE_KEY = 'dqg_quotes_v1';
const SESSION_LAST_KEY = 'dqg_last_quote_v1';

const els = {
  quoteText: document.getElementById('quoteText'),
  quoteMeta: document.getElementById('quoteMeta'),
  status: document.getElementById('status'),
  btnNew: document.getElementById('newQuote'),
  btnExport: document.getElementById('exportJson'),
  btnClear: document.getElementById('clearStorage'),
  inputText: document.getElementById('newQuoteText'),
  inputCategory: document.getElementById('newQuoteCategory'),
};

const DEFAULT_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" }
];

let quotes = [];

/* ---------- Storage Helpers ---------- */
// Function to display a random quote
function displayRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Update DOM with innerHTML
  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>Category: ${randomQuote.category}</small>
  `;

  // Save last viewed in session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
displayRandomQuote();

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes(); // initialize for first-time users
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = sanitizeQuotes(parsed);
      // If sanitize removed everything, repopulate with defaults
      if (quotes.length === 0) {
        quotes = [...DEFAULT_QUOTES];
        saveQuotes();
      }
    } else {
      // Corrupt -> reset
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
    }
  } catch {
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function saveLastViewed(quote) {
  try {
    sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(quote));
  } catch {}
}

function getLastViewed() {
  try {
    const raw = sessionStorage.getItem(SESSION_LAST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ---------- Rendering ---------- */
function renderQuote(quote, note = '') {
  els.quoteText.textContent = `“${quote.text}”`;
  els.quoteMeta.textContent = `Category: ${quote.category}${note ? ` · ${note}` : ''}`;
}

/* ---------- Main Features ---------- */
function showRandomQuote() {
  if (!quotes.length) {
    renderQuote({ text: 'No quotes available. Please add one!', category: 'Info' });
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const q = quotes[idx];
  renderQuote(q);
  saveLastViewed(q); // session-specific
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();

  alert("New quote added successfully!");
  textInput.value = "";
  categoryInput.value = "";

  // Update dropdown with new category if needed
  populateCategories();
  displayRandomQuote();
}

function exportToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const ts = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fname = `quotes_${ts.getFullYear()}-${pad(ts.getMonth()+1)}-${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setStatus('Exported quotes to JSON file.');
}

/* Provided signature (kept global for inline onchange). */
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('JSON must be an array');
      const cleaned = sanitizeQuotes(imported);

      // De-duplicate against existing
      const existingKeys = new Set(quotes.map(q => `${q.text.toLowerCase()}||${q.category.toLowerCase()}`));
      let added = 0;
      for (const q of cleaned) {
        const key = `${q.text.toLowerCase()}||${q.category.toLowerCase()}`;
        if (!existingKeys.has(key)) {
          quotes.push(q);
          existingKeys.add(key);
          added++;
        }
      }

      saveQuotes();
      setStatus(`Quotes imported successfully! Added ${added} new ${added === 1 ? 'item' : 'items'}.`);
      if (added > 0) showRandomQuote();
    } catch (err) {
      setStatus(`Import failed: ${err.message}`, true);
    } finally {
      // Let user import the same file again if needed
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

/* ---------- Utilities ---------- */
function sanitizeQuotes(arr) {
  // Keep only objects with non-empty string text + category
  return arr
    .filter(x => x && typeof x === 'object')
    .map(x => ({
      text: String(x.text ?? '').trim(),
      category: String(x.category ?? '').trim()
    }))
    .filter(x => x.text.length > 0 && x.category.length > 0);
}

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.style.color = isError ? '#b00020' : '#0b6e2e';
}

/* ---------- Event Wiring & Init ---------- */
(function init() {
  loadQuotes();

  els.btnNew.addEventListener('click', showRandomQuote);
  els.btnExport.addEventListener('click', exportToJson);
  els.btnClear.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_LAST_KEY);
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
    setStatus('Local & session storage cleared. Restored default quotes.');
    showRandomQuote();
  });

  // Prefer session's last viewed quote if available
  const last = getLastViewed();
  if (last && last.text && last.category) {
    renderQuote(last, 'Last viewed (this session)');
  } else {
    showRandomQuote();
  }
})();

// Function to populate categories dynamically in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear old options except "All"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  // Extract unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Modified displayRandomQuote to respect category filter
function displayRandomQuote() {
  const filter = document.getElementById("categoryFilter").value;

  // Filtered list based on category
  const filteredQuotes = filter === "all" ? quotes : quotes.filter(q => q.category === filter);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>Category: ${randomQuote.category}</small>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}
(function init() {
  loadQuotes();

  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJson);
  document.getElementById("clearStorage").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("lastViewedQuote");
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
    populateCategories();
    displayRandomQuote();
  });

  // Dynamically create Add Quote form
  createAddQuoteForm();

  // Populate category dropdown
  populateCategories();

  // Handle category change
  document.getElementById("categoryFilter").addEventListener("change", displayRandomQuote);

  displayRandomQuote();
})();

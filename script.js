// Quotes array with objects
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" }
];

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Create a dynamic quote element
  const quoteElement = document.createElement("p");
  quoteElement.textContent = `"${randomQuote.text}" — (${randomQuote.category})`;

  // Clear old content & display new
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";
  quoteDisplay.appendChild(quoteElement);
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote object
  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);

  // Feedback to user
  alert("New quote added successfully!");

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Show a random quote at startup
showRandomQuote();

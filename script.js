// Quotes array with objects (text + category)
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" }
];

// Function to random quote
function showRandomQuote () {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Use innerHTML as required
  document.getElementById("quoteText").innerHTML = randomQuote.text;
  document.getElementById("quoteCategory").innerHTML = "Category: " + randomQuote.category;
}

// Function to add a new quote
function addQuote(text, category) {
  if (text && category) {
    quotes.push({ text, category });
    showRandomQuote();
  } else {
    alert("Please enter both quote text and category");
  }
}

// Event listener for "Show New Quote" button
document.getElementById("newQuoteBtn").addEventListener("click", showRandomQuote);

// Event listener for "Add Quote" button
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  addQuote(text, category);

  // Clear inputs after adding
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
});


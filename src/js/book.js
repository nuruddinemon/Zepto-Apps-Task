const apiUrl = "https://gutendex.com/books";
const bookDetailsContainer = document.getElementById("book-details-container");

// Get the book ID from localStorage
const bookId = localStorage.getItem("currentBookId");

if (bookId) {
  fetchBookDetails(bookId); // Call the function to fetch book details
} else {
  bookDetailsContainer.innerHTML = "<p>No book selected.</p>";
}

// to fetch and display book details
async function fetchBookDetails(bookId) {
  try {
    const response = await fetch(`${apiUrl}/${bookId}`);
    if (!response.ok)
      throw new Error(`Error fetching book: ${response.status}`);
    const book = await response.json();
    displayBookDetails(book); // Display the book details if fetched successfully
  } catch (error) {
    console.error("Error fetching book details:", error);
    bookDetailsContainer.innerHTML = "<p>Error fetching book details.</p>"; // Handle error gracefully
  }
}

// Function to display the book details
function displayBookDetails(book) {
  bookDetailsContainer.innerHTML = `
        <div class="book-details">
            <img src="${
              book.formats["image/jpeg"]
            }" alt="Book Cover" class="book-cover">
            <h1 class="book-title">${book.title}</h1>
            <p class="book-author">Author(s): ${book.authors
              .map((author) => author.name)
              .join(", ")}</p>
            <p class="book-genre">Genre: ${book.subjects.join(", ")}</p>
            <p class="book-id">ID: ${book.id}</p>
            <p class="book-downloads">Downloads: ${book.download_count}</p>
            <a href="${
              book.formats["text/html"]
            }" target="_blank">Read Online</a>
        </div>
    `;
}

const apiUrl = "https://gutendex.com/books";
let books = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let currentPage = 1;
const booksPerPage = 10;
let totalBooks = 0; // Total number of books returned by the API
let searchQuery = "";
let genreFilter = "";
let genres = new Set(); // To store unique genres from the bookshelves
let searchTimeout;

document.addEventListener("DOMContentLoaded", () => {
  fetchBooks(); // Initial book fetch

  // Search input with debouncing
  const searchElement = document.getElementById("search");
  if (searchElement) {
    searchElement.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchQuery = e.target.value.toLowerCase();
      searchTimeout = setTimeout(() => {
        currentPage = 1;
        fetchBooks(); // Refetch books on search
      }, 300); // Debounce for 300ms
    });
  }

  // Genre filter
  const genreElement = document.getElementById("genre-filter");
  if (genreElement) {
    genreElement.addEventListener("change", (e) => {
      genreFilter = e.target.value.toLowerCase();
      currentPage = 1; // Reset to first page when genre filter changes
      filterAndDisplayBooks(); // Filter books by genre
    });
  }

  // Pagination buttons
  const nextPageElement = document.getElementById("nextPage");
  if (nextPageElement) {
    nextPageElement.addEventListener("click", () => changePage(1));
  }
  const prevPageElement = document.getElementById("prevPage");
  if (prevPageElement) {
    prevPageElement.addEventListener("click", () => changePage(-1));
  }
});

// Show loading indicator
function showLoading() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) loadingElement.style.display = "block";
}

// Hide loading indicator
function hideLoading() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) loadingElement.style.display = "none";
}

// Fetch books from API
async function fetchBooks() {
  showLoading();
  let url = `${apiUrl}?page=${currentPage}&page_size=${booksPerPage}`;
  if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    books = data.results || [];
    totalBooks = data.count; // Set total books from API response
    populateGenres(); // Update genre dropdown
    filterAndDisplayBooks(); // Display books based on search and filters
    updatePagination(); // Update pagination
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    hideLoading();
  }
}

// Filter and display books based on search and genre
function filterAndDisplayBooks() {
  let filteredBooks = books;

  if (searchQuery) {
    filteredBooks = filteredBooks.filter((book) =>
      book.title.toLowerCase().includes(searchQuery)
    );
  }

  if (genreFilter) {
    filteredBooks = filteredBooks.filter((book) =>
      book.bookshelves.some((shelf) => shelf.toLowerCase() === genreFilter)
    );
  }

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  currentPage = Math.min(currentPage, totalPages || 1);

  const booksToDisplay = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const bookGrid = document.getElementById("book-grid");
  if (bookGrid) {
    bookGrid.innerHTML = booksToDisplay.length
      ? booksToDisplay.map(displayBookCard).join("")
      : "<p>No books found for the selected criteria.</p>";
  }

  updatePagination(filteredBooks.length);
}

// Create HTML structure for each book card
function displayBookCard(book) {
  return `
    <div class="book-card">
      <img src="${
        book.formats["image/jpeg"]
      }" alt="Book Cover" class="book-cover">
      <h3 class="book-title" onclick="openBookDetails(${book.id})">${
    book.title
  }</h3>
      <p class="book-author">${book.authors
        .map((author) => author.name)
        .join(", ")}</p>
      <span class="book-genre">${book.bookshelves.join(", ")}</span>
      <button class="wishlist-btn" data-id="${
        book.id
      }" onclick="toggleWishlist('${book.id}')">
        ${wishlist.includes(String(book.id)) ? "❤️" : "🤍"}
      </button>
    </div>`;
}

// Pagination handling
function changePage(change) {
  currentPage += change;
  currentPage = Math.max(currentPage, 1);
  fetchBooks(); // Fetch books for the new page
}

// Update pagination UI
function updatePagination() {
  const totalPages = Math.ceil(totalBooks / booksPerPage); // Calculate total pages
  const nextPageElement = document.getElementById("nextPage");
  const prevPageElement = document.getElementById("prevPage");
  const currentPageElement = document.getElementById("currentPage");
  const totalPagesElement = document.getElementById("totalPages");

  if (nextPageElement) nextPageElement.disabled = currentPage >= totalPages;
  if (prevPageElement) prevPageElement.disabled = currentPage <= 1;
  if (currentPageElement) currentPageElement.textContent = currentPage;
  if (totalPagesElement) totalPagesElement.textContent = totalPages;
}

// Toggle wishlist functionality
function toggleWishlist(bookId) {
  const wishlistBtn = document.querySelector(
    `.wishlist-btn[data-id="${bookId}"]`
  );
  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
    wishlistBtn.innerHTML = "🤍";
  } else {
    wishlist.push(bookId);
    wishlistBtn.innerHTML = "❤️";
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// Handle book details navigation
function openBookDetails(bookId) {
  localStorage.setItem("currentBookId", bookId);
  window.location.href = "book.html";
}

// Populate genres from the bookshelves
function populateGenres() {
  const genreElement = document.getElementById("genre-filter");
  if (!genreElement) return;

  genreElement.innerHTML = "<option value=''>All Genres</option>";
  books.forEach((book) => {
    book.bookshelves.forEach((shelf) => {
      genres.add(shelf.toLowerCase());
    });
  });

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreElement.appendChild(option);
  });
}

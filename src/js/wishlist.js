document.addEventListener("DOMContentLoaded", () => {
  displayWishlist();
});

// to display the wishlist
async function displayWishlist() {
  const wishlistGrid = document.getElementById("wishlist-grid");
  wishlistGrid.innerHTML = "";
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (wishlist.length === 0) {
    wishlistGrid.innerHTML = "<p>Your wishlist is empty!</p>";
    return;
  }

  // Fetch and display each book in the wishlist
  for (const bookId of wishlist) {
    await fetchBookDetails(bookId, wishlistGrid); // Await the fetching of book details
  }
}

// to fetch book details and display them
async function fetchBookDetails(bookId, wishlistGrid) {
  try {
    const response = await fetch(`https://gutendex.com/books/${bookId}`);
    if (!response.ok)
      throw new Error(`Error fetching book: ${response.status}`);
    const book = await response.json();

    const wishlistCard = document.createElement("div");
    wishlistCard.classList.add("book-card");
    wishlistCard.innerHTML = `
            <img src="${
              book.formats["image/jpeg"]
            }" alt="Book Cover" class="book-cover" onclick="openBookDetails(${
      book.id
    })">
            <h3 class="book-title" onclick="openBookDetails(${book.id})">${
      book.title
    }</h3>
            <p class="book-author">${book.authors
              .map((author) => author.name)
              .join(", ")}</p>
            <span class="book-genre">${book.subjects.join(", ")}</span>
            <button class="wishlist-btn" onclick="toggleWishlist('${book.id}')">
                ❤️
            </button>
        `;
    wishlistGrid.appendChild(wishlistCard);
  } catch (error) {
    console.error("Error fetching book details:", error);
    wishlistGrid.innerHTML += `<p>Error fetching book with ID ${bookId}</p>`; // Display error message
  }
}

// Toggle wishlist functionality
function toggleWishlist(bookId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    wishlist.push(bookId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayWishlist(); // Refresh the wishlist display
}

// Open book details page
function openBookDetails(bookId) {
  localStorage.setItem("currentBookId", bookId);
  window.location.href = "book.html";
}

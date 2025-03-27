const contentDisplay = document.querySelector(".content-display-area");
const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");
const pageNumbers = document.getElementById("page-numbers");
const listV = document.querySelector(".list-view");
const gridV = document.querySelector(".grid-view");
const inputSearch = document.querySelector(".input-search");
const searchBtn = document.querySelector(".search-btn");

// Sorting Dropdown
const sortSelect = document.createElement("select");
sortSelect.classList.add("sort-select");
sortSelect.innerHTML = `
    <option value="default">Sort By</option>
    <option value="title-asc">Title (A-Z)</option>
    <option value="title-desc">Title (Z-A)</option>
    <option value="date-asc">Date (Oldest First)</option>
    <option value="date-desc">Date (Newest First)</option>
`;
document.querySelector(".sort-view-area").appendChild(sortSelect);

let data = [];
const cardsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let filteredData = []; 

// Fetching Data from API
async function fetching() {
    const url = "https://api.freeapi.app/api/v1/public/books?limit=210";
    const options = { method: "GET", headers: { accept: "application/json" } };
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
            data = result.data.data;
            filteredData = [...data]; // for copying whole
            loadContent();
        
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Loading Books into Content Display
function loadContent() {
    if (!filteredData.length) {
        contentDisplay.innerHTML = `<p>No books found.</p>`;
        return;
    }

    contentDisplay.innerHTML = "";
    filteredData.forEach((element) => {
        const title = element.volumeInfo?.title || "No Title";
        const publisher = element.volumeInfo?.publisher || "Unknown Publisher";
        const publishedDate = element.volumeInfo?.publishedDate || "Unknown Published Date";
        const authors = element.volumeInfo?.authors?.join(", ") || "Unknown Authors";
        const infoLink = element.volumeInfo?.infoLink || "#";
        const thumbnail = element.volumeInfo?.imageLinks?.thumbnail ||
            "https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg";

        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <div loading="lazy" class="image-section">
                <a href="${infoLink}" target="_blank">
                    <img src="${thumbnail}" alt="Book Thumbnail">
                </a>
            </div>
            <div class="text-area">
                <div class="title">${title}</div>
                <div class="publisher-name">${publisher} (Publisher)</div>
                <div class="published-date">${publishedDate}</div>
                <div class="vauthors">${authors} (Author)</div>
            </div>
        `;
        contentDisplay.appendChild(div);
    });

    updatePagination();
    displayPages(currentPage);
}

// Display only books for the selected page
function displayPages(page) {
    const cards = Array.from(contentDisplay.getElementsByClassName("card"));
    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;

    cards.forEach((card, index) => {
        card.style.display = index >= start && index < end ? "flex" : "none";
    });
}

// Update Pagination Controls
function updatePagination() {
    totalPages = Math.ceil(filteredData.length / cardsPerPage);
    pageNumbers.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

//Handle Search Functionality
function searchBooks() {
    const query = inputSearch.value.trim().toLowerCase();
    
    if (!query) {
        filteredData = [...data]; 
    } else {
        filteredData = data.filter((book) => {
            const title = book.volumeInfo?.title?.toLowerCase() || "";
            const authors = book.volumeInfo?.authors?.join(", ").toLowerCase() || "";
            return title.includes(query) || authors.includes(query);
        });
    }

    currentPage = 1;
    loadContent();
}

//Sorting Functionality
sortSelect.addEventListener("change", () => {
    const sortBy = sortSelect.value;

    if (sortBy === "title-asc") {
        filteredData.sort((a, b) => (a.volumeInfo?.title || "").localeCompare(b.volumeInfo?.title || ""));
    } else if (sortBy === "title-desc") {
        filteredData.sort((a, b) => (b.volumeInfo?.title || "").localeCompare(a.volumeInfo?.title || ""));
    } else if (sortBy === "date-asc") {
        filteredData.sort((a, b) => new Date(a.volumeInfo?.publishedDate || "1970-01-01") - new Date(b.volumeInfo?.publishedDate || "1970-01-01")); // looked in google
    } else if (sortBy === "date-desc") {
        filteredData.sort((a, b) => new Date(b.volumeInfo?.publishedDate || "1970-01-01") - new Date(a.volumeInfo?.publishedDate || "1970-01-01"));
    }

    currentPage = 1;
    loadContent();
});

//Handle List View
function listView() {
    contentDisplay.style.flexDirection = "column";
    document.querySelectorAll(".card").forEach((card) => {
      card.style.width = window.innerWidth < 768 ? "100%" : "800px";
      card.style.gap = "20px";
      card.style.flexDirection = "row";
      card.style.justifyContent = "space-between";
    });
  }

//Handle Grid View
function gridView() {
    contentDisplay.style.flexDirection = "row";
    document.querySelectorAll(".card").forEach((card) => {
      card.style.width = window.innerWidth < 768 ? "100%" : "360px";
      card.style.flexDirection = "column";
    });
  }

// Event Listeners 
document.addEventListener("DOMContentLoaded", fetching);
prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayPages(currentPage);
        updatePagination();
    }
});
nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        displayPages(currentPage);
        updatePagination();
    }
});
listV.addEventListener("click", listView);
gridV.addEventListener("click", gridView);
searchBtn.addEventListener("click", searchBooks);
inputSearch.addEventListener("keypress", (event) => { //optional hi
    if (event.key === "Enter") {
        searchBooks();
    }
});

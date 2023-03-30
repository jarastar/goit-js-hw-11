import axios from "axios";
import Notiflix from "notiflix";
import debounce from "lodash.debounce";

const API_KEY = "34864216-4fa8cf27ab1b277ad0c21156c";
const BASE_URL = "https://pixabay.com/api/";

const galleryRef = document.querySelector(".gallery");
const searchFormRef = document.querySelector(".search-form");
const loadMoreBtnRef = document.querySelector(".load-more");
const PER_PAGE = 40;
let currentPage = 1;
let searchQuery = "";

searchFormRef.addEventListener("submit", searchFormSubmitHandler);
loadMoreBtnRef.addEventListener("click", loadMoreBtnClickHandler);

async function fetchImages(query, page, perPage) {
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  const response = await axios.get(url);
  const { hits, totalHits } = response.data;
  return { hits, totalHits };
}

async function searchFormSubmitHandler(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return Notiflix.Notify.failure("Sorry, enter search query!");
  }
  currentPage = 1;
  galleryRef.innerHTML = "";
  loadMoreBtnRef.classList.add("is-hidden");

  try {
    const images = await fetchImages(searchQuery, currentPage, PER_PAGE);
    if (images.hits.length === 0) {
      return Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query "${searchQuery}"!`
      );
    }
    appendImagesMarkup(images);
    if (images.hits.length < PER_PAGE) {
      loadMoreBtnRef.classList.add("is-hidden");
    } else {
      loadMoreBtnRef.classList.remove("is-hidden");
    }
    Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure("Oops, something went wrong! Try again later.");
  }
}

async function loadMoreBtnClickHandler() {
  currentPage += 1;
  const images = await fetchImages(searchQuery, currentPage, PER_PAGE);
  appendImagesMarkup(images);
  if (images.hits.length < PER_PAGE) {
    loadMoreBtnRef.classList.add("is-hidden");
  } else {
    loadMoreBtnRef.classList.remove("is-hidden");
  }
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
}

function appendImagesMarkup(images) {
  galleryRef.insertAdjacentHTML(
    "beforeend",
    images.hits
      .map(
        ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
          `<div class="photo-card">
            <img src="${webformatURL}" data-source="${largeImageURL}" alt="${tags}" class="photo-card__image" />
            <div class="photo-card__description">
              <p class="photo-card__item">
                <i class="material-icons photo-card__icon">thumb_up</i>
                <span class="photo-card__text">${likes}</span>
              </p>
              <p class="photo-card__item">
                <i class="material-icons photo-card__icon">visibility</i>
                <span class="photo-card__text">${views}</span>
              </p>
              <p class="photo-card__item">
                <i class="material-icons photo-card__icon">comment</i>
                <span class="photo-card__text">${comments}</span>
              </p>
              <p class="photo-card__item">
                <i class="material-icons photo-card__icon">cloud_download</i>
                <span class="photo-card__text">${downloads}</span>
              </p>
            </div>
          </div>`
      )
      .join("")
  );
}

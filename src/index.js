import {NewsApiService} from './js/pixApi';
import { lightbox } from './js/libox';
import { Notify } from 'notiflix';

const elements = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more')
};

let shownImagesCount = 0;
const apiService = new NewsApiService();

elements.form.addEventListener('submit', onSearch);
elements.loadMore.addEventListener('click', onLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);

function onSearch(event) {
  event.preventDefault();

  elements.gallery.innerHTML = '';
  apiService.query = event.currentTarget.elements.searchQuery.value.trim();
  apiService.resetPage();

  if (apiService.query === '') {
    Notify.warning('Please, fill in the search field');
    return;
  }

  shownImagesCount = 0;
  elements.loadMore.classList.add('is-hidden');
  fetchGallery();
}

function onLoadMore() {
  apiService.incrementPage();
  fetchGallery();
}

async function fetchGallery() {
  elements.loadMore.classList.add('is-hidden');

  const response = await apiService.fetchGallery();
  const { hits, total } = response;
  shownImagesCount += hits.length;

  if (!hits.length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    elements.loadMore.classList.add('is-hidden');
    return;
  }

  renderGallery(hits);

  if (shownImagesCount < total) {
    Notify.success(`Hooray! We found ${total} images !!!`);
    elements.loadMore.classList.remove('is-hidden'); // видаляємо клас "is-hidden"
  }

  if (shownImagesCount >= total) {
    Notify.info("We're sorry, but you've reached the end of the search results.");
    elements.loadMore.classList.add('is-hidden');
    return;
  }
}

function renderGallery(hits) {
  const markup = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
    <div class="photo-card">
      <a href="${largeImageURL}">
        <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${downloads}
        </p>
      </div>
    </div>`
  ).join('');
  elements.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}
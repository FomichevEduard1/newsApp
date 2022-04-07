// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function() {
  const apiKey = 'c69bb96f350341259130278283a2efcb';
  const apiUrl = 'http://newsapi.org/v2';

  return{
    topHeadLine(country = 'ru', categoryName, cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${categoryName}&apiKey=${apiKey}`,
      cb
      )
    },

    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, 
      cb
      )
    }
  }
})();

//Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categoryName = form.elements['categorys'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {

  M.AutoInit();
  loadNews();
});

//load news function
function loadNews() {
  showPreloader();
  const country = countrySelect.value;
  const searchText = searchInput.value;
  const selectCategory = categoryName.value;

  if(!searchText){
    newsService.topHeadLine(country, selectCategory, onGetResponse)
  }
  else{
    newsService.everything(searchText, onGetResponse)
  }
}

//function on get response from server
function onGetResponse(err, res) {
  removePreloader();
  
  if(err){
    showAlert(err, 'error-msg');
    return;
  }

  if(res.articles.length === 0){
    showAlert('по вашему запросу ничего не нашлось', 'empty-artics');
    return;
  }

renderNews(res.articles);
}


//function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  let fragment = '';

  if(newsContainer.children.length){
    clearContainer(newsContainer);
  }

  news.forEach(newsItem => {
    if(newsItem.urlToImage === null){
      newsItem.urlToImage = 'https://cdn-images-1.medium.com/max/1200/1*jZbZ6QGFUqPrNif873iGIw.jpeg';
    }
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//function clear container
function clearContainer(container) {
  // or container.innerHTML = "";
  let child = container.lastElementChild;
    while(child){
      container.removeChild(child);
      child = container.lastElementChild;
    }
}

//news item template function
function newsTemplate({urlToImage, title, url, description}){
  return `
  <div class = "col s12">
    <div class = "card">
        <div class = "card-image">
          <img src = "${urlToImage}">
          <span class ="card-title">${title || ''}></span>
        </div>
        <div class = "card-content">
         <p>${description || ''}</p>
        </div>
        <div class = "card-action">
          <a herf = "${url}">Read more</a>
        </div>
      </div>
  </div>
  `;
}

function showAlert(msg, type = 'success'){
  switch (type) {
    case 'error-msg':
      M.toast({html: msg, classes: type});
      break;
    case 'empty-artics':
      M.toast({html: msg, classes: type});
      break;
    default:
      M.toast({html: msg, classes: type});
  }
}

//show loader
function showPreloader() {
  document.body.insertAdjacentHTML('afterbegin', 
  `<div class="progress">
    <div class="indeterminate"></div>
  </div>`
  );
}

//remove loader
function removePreloader() {
  const loader = document.querySelector('.progress');
  if(loader){
    loader.remove();
  }
}

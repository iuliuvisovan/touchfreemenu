polyfill();

function app() {
  setupSearchInput();
  setupProductTaps();
}
app();

function setupSearchInput() {
  setTimeout(() => {
    const searchInput = document.querySelector('#searchInput');

    searchInput.addEventListener('focus', () => {
      window.scrollTo({ top: 198, behavior: 'smooth' });
    });
    searchInput.addEventListener('keyup', () => {
      search(searchInput.value);
    });
  }, 300);
}

function search(query) {
  document.querySelector('.menu').classList[query ? 'add' : 'remove']('searching');

  document.querySelectorAll('.product').forEach((product) => {
    const isMatch = product.innerHTML.toLowerCase().normalize('NFKD').replace(/[^\w]/g, '').includes(query.toLowerCase().normalize('NFKD').replace(/[^\w]/g, ''));

    if (!isMatch) {
      if (!product.classList.contains('hidden')) {
        product.classList.add('hidden');
      }
    } else {
      product.classList.remove('hidden');
    }
  });
}

function clearInput() {
  document.querySelector('#searchInput').value = '';
  search('');
}

function setupProductTaps() {
  document.querySelectorAll('.product').forEach((product) => {
    product.addEventListener('click', function () {
      const isTapped = product.classList.contains('tapped');
      document.querySelectorAll('.tapped').forEach((tappedProduct) => {
        tappedProduct.classList.remove('tapped');
      });
      if (isTapped) {
        product.classList.remove('tapped');
      } else {
        product.classList.add('tapped');
      }
    });
  });
}

function setupCategoryButtons() {
  document.querySelectorAll('.category-button').forEach((x) => {
    x.addEventListener('click', function () {
      if (this.classList.contains('active')) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
    });
  });
}

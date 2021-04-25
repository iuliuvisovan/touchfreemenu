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
    const normalizedQuery = query.toLowerCase().normalize('NFKD').replace(/[^\w]/g, '');
    const cleanedProductHtml = product.innerHTML
      .toLowerCase()
      .replace('<highlighted>', '')
      .replace('</highlighted>', '')
      .normalize('NFKD')
      .replace(/[^\w]/g, '');

    const isMatch = cleanedProductHtml.includes(normalizedQuery);

    if (!isMatch) {
      if (!product.classList.contains('hidden')) {
        product.classList.add('hidden');
      }
    } else {
      product.classList.remove('hidden');

      highlightFoundText(normalizedQuery, product.querySelector('.name'));
      highlightFoundText(normalizedQuery, product.querySelector('.description'));
    }
  });
}

function highlightFoundText(normalizedQuery, productNameOrDescription) {
  if (!productNameOrDescription?.innerHTML) {
    return;
  }

  const cleanedHTML = productNameOrDescription.innerHTML.replace('<highlighted>', '').replace('</highlighted>', '');

  const normalizedHtml = cleanedHTML.toLowerCase();
  const indexOfMatch = normalizedHtml.indexOf(normalizedQuery);

  if (indexOfMatch < 0) {
    productNameOrDescription.innerHTML = cleanedHTML;

    return;
  }

  const beforeMatchedString = cleanedHTML.substring(0, indexOfMatch);
  const matchedString = cleanedHTML.substring(indexOfMatch, indexOfMatch + normalizedQuery.length);
  const afterMatchedString = cleanedHTML.substring(indexOfMatch + normalizedQuery.length);

  productNameOrDescription.innerHTML = `${beforeMatchedString}<highlighted>${matchedString}</highlighted>${afterMatchedString}`;
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

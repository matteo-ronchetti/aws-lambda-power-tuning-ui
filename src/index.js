import { App } from './app.js';
const app = new App();

function onhashchange() {
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    app.show(hash);
  } else {
    app.error('empty');
  }
}

document.getElementById('compare').addEventListener('click', function () {
  const URL = prompt('Enter another visualization URL:');
  const hash2 = URL.split('#')[1];
  if (!hash2) {
    alert('Invalid URL. Please try again with a valid visualization URL.');
    return;
  }
  const legend = prompt('Enter a name for this function:', '2');
  const hash = window.location.hash.slice(1);
  app.show(hash, hash2, legend);
});

window.addEventListener('hashchange', onhashchange);
onhashchange();

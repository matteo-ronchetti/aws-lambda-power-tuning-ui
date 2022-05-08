import { App } from './app.js';
import { HashStore } from './hashStore';

const app = new App(HashStore);
app.init();
const compareModal = document.getElementById('modal-compare');

initUI();

function initUI() {
  window.addEventListener('click', (event) => {
    if (event.target === compareModal) {
      compareModal.style.display = 'none';
    }
  });
  setupModal();
}

function setupModal() {
  const compareModalButton = document.getElementById('compare');
  const compareConfirmButton = document.getElementById('confirm-compare');

  const compareF1Name = document.getElementById('compare-f1-name');
  const compareF1URL = document.getElementById('compare-f1-url');
  const compareF2Name = document.getElementById('compare-f2-name');
  const compareF2URL = document.getElementById('compare-f2-url');

  compareModalButton.addEventListener('click', function () {
    compareModal.style.display = 'block';

    // Update the form values when we show the dialog
    compareF1Name.value = app.legend1;
    compareF1URL.value = app.data1URL;
    compareF2Name.value = app.legend2;
    compareF2URL.value = app.data2URL;
  });

  compareConfirmButton.addEventListener('click', function (e) {
    const URL1 = compareF1URL.value || '';
    const [, hash1] = URL1.split('#');

    if (!hash1) {
      alert('Invalid URL for function 1. Please try again with a valid visualization URL.');
      return;
    }

    const URL2 = compareF2URL.value || '';
    const [, hash2] = URL2.split('#');
    if (!hash2) {
      alert('Invalid URL for function 2. Please try again with a valid visualization URL.');
      return;
    }

    const legend1 = compareF1Name.value || '';
    const legend2 = compareF2Name.value || '';

    compareModal.style.display = 'none';
    e.stopPropagation();

    app.compare(hash1, hash2, legend1, legend2);

    return false;
  });
}

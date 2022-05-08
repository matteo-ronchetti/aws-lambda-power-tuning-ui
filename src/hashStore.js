export class HashStore {
  constructor(onChangeCallback, onError) {
    this.onChangeCallback = onChangeCallback;
    this.onError = onError;
    window.addEventListener('hashchange', this.#onHashChange.bind(this));
  }

  ready() {
    this.#onHashChange();
  }

  setState(hash) {
    window.location.hash = hash;
  }

  #onHashChange() {
    if (window.location.hash) {
      this.onChangeCallback(window.location.hash.slice(1)); // remove the '#' char
    } else {
      this.onError('empty');
    }
  }
}

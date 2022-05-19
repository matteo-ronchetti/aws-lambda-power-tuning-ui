export class HashStore {
  constructor() {
    this.listeners = [];
    window.addEventListener('hashchange', this.#onHashChange.bind(this));
  }

  addListener(onChange, onError) {
    this.listeners.push([onChange, onError]);
    this.#onHashChange();
  }

  setState(hash) {
    window.location.hash = hash;
  }

  #onHashChange() {
    if (window.location.hash) {
      this.listeners.forEach(([onChange]) => onChange(window.location.hash.slice(1))); // remove the '#' char
    } else {
      this.listeners.forEach(([, onError]) => onError('empty'));
    }
  }
}

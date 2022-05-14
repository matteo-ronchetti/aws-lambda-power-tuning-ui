export function encode(input, cls = Float32Array) {
  input = new cls(input);
  if (!(input instanceof Uint8Array)) {
    input = new Uint8Array(input.buffer);
  }

  return window.base64js.fromByteArray(input); // base64 is on the window (global-scope) object
}

export function decode(x, cls = Float32Array) {
  return Array.from(new cls(window.base64js.toByteArray(x).buffer));
}

function encode(input, c = Float32Array) {
    input = new c(input);
    if (!(input instanceof Uint8Array)) {
        input = new Uint8Array(input.buffer)
    }

    return base64js.fromByteArray(input);
}

function decode(x, c = Float32Array) {
    return Array.from(new c(base64js.toByteArray(x).buffer));
}

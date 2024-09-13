export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  let binaryString = '';
  uint8Array.forEach((byte: number) => {
    binaryString += String.fromCharCode(byte);
  });
  return window.btoa(binaryString);
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

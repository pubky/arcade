import { base64ToUint8Array, uint8ArrayToBase64 } from "./conversion";
import storage from "./storage";

export const Utils = {
    storage,
    conversion: {
        base64ToUint8Array,
        uint8ArrayToBase64,
    }
}
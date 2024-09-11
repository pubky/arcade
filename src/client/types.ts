export interface TClientContext {
    secret: Uint8Array | null;
    pubky: string | null;
    homeserverURL: string | null;
    signUp: () => Promise<void>;
    signOut: () => Promise<void>;
    isLoggedIn: () => Promise<boolean>;
    client_put: (path: string, content: Uint8Array) => Promise<void>;
    client_get: (path: string) => Promise<Buffer | undefined>;
    client_delete: (path: string) => Promise<void>;
    randomBytes: (n?: number) => Buffer;
    z32_encode: (buffer: Buffer) => string;
    z32_decode: (value: string, output: Buffer) => void;
    hash: (message: string) => Promise<string>;
    sign: (message: string) => Promise<ArrayBuffer>;
    verify: (publicKey: Uint8Array, signature: ArrayBuffer, message: string) => Promise<boolean>;
}
export interface TClientContext {
    secret: string | null;
    pubky: string | null;
    homeserverURL: string | null;
    signUp: () => Promise<void>;
    signOut: () => Promise<void>;
    client_put: (path: string, content: Uint8Array) => Promise<void>;
    client_get: (path: string) => Promise<Buffer | undefined>;
    client_delete: (path: string) => Promise<void>;
    randomBytes: (n?: number) => Promise<Buffer>;
    z32_encode: (buffer: Buffer) => Promise<string>;
    z32_decode: (value: string) => Promise<Buffer>;
    hash: (message: string) => Promise<string>;
    sign: (message: string) => Promise<ArrayBuffer>;
    verify: (publicKey: Uint8Array, signature: ArrayBuffer, message: string) => Promise<boolean>;
}
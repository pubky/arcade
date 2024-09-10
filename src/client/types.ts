import { PubkyClient } from "@synonymdev/pubky";

export interface TClientContext {
    client: PubkyClient;
    secret: Uint8Array | null;
    pubky: string | null;
    homeserverURL: string | null;
    signUp: () => Promise<void>;
    signOut: () => Promise<void>;
    isLoggedIn: () => Promise<boolean>;
}
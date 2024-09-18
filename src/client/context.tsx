/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import { Buffer } from 'buffer';
import { createContext, useState } from 'react';

import {
  TClientContext
} from './types';

import { Keypair, PublicKey } from '@synonymdev/pubky';

import { Utils } from '../utils';

import { client, Homeserver } from './setup';

// @ts-ignore
let sodium
const sod = async () => {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (sodium) return sodium
  // @ts-ignore
  // eslint-disable-next-line
  sodium = await import('sodium-javascript').then(sod => sod);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return sodium
}

export const ClientContext = createContext<TClientContext>({} as TClientContext);

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState<string | null>(
    Utils.storage.get('secret')
  );
  const [pubky, setPubky] = useState<string | null>(
    Utils.storage.get('pubky')
  );
  const [homeserverURL, setHomeserverURL] = useState<string | null>(
    Utils.storage.get('homeserverURL')
  );

  const signUp = async (): Promise<void> => {
    if (pubky !== null) {
      const session = await client.session(PublicKey.from(pubky))
      if (!session) {
        await signOut();
        return await signUp();
      }
      return;
    }
    const keypair = Keypair.random();
    const secretKey = keypair.secretKey();
    const newPubky = keypair.publicKey().z32();
    const newHomeserverURL = `pubky://${newPubky}/pub/`;

    await client.signup(keypair, Homeserver);

    const encodedSecret = await z32_encode(Buffer.from(secretKey.buffer));
    Utils.storage.set('secret', encodedSecret);
    Utils.storage.set('pubky', newPubky);
    Utils.storage.set('homeserverURL', newHomeserverURL);
    setSecret(encodedSecret);
    setPubky(newPubky)
    setHomeserverURL(newHomeserverURL);
  };

  const signOut = async (): Promise<void> => {
    if (secret === null) {
      return
    }
    const decodedSecret = await z32_decode(secret);
    const keypair = Keypair.fromSecretKey(decodedSecret);
    await client.signout(keypair.publicKey());

    Utils.storage.remove('pubky');
    Utils.storage.remove('secret');
    Utils.storage.remove('homeserverURL');
    setSecret(null);
    setPubky(null);
    setHomeserverURL(null);
  };

  const client_put = async (path: string, content: Uint8Array): Promise<void> => {
    if (secret === null) {
      throw Error("Not logged in.");
    }

    await client.put(homeserverURL + path, content)
  };

  const client_get = async (path: string): Promise<Buffer | undefined> => {
    if (secret === null) {
      throw Error("Not logged in.");
    }
    const result = await client.get(path.startsWith('pubky://') ? path : homeserverURL + path);
    if (result === undefined) {
      throw Error("Not found.");
    }
    return Buffer.from(result);
  };

  const client_delete = async (path: string): Promise<void> => {
    if (secret === null) {
      throw Error("Not logged in.");
    }

    await client.delete(homeserverURL + path);
  };


  const randomBytes = async (n: number = 32): Promise<Buffer> => {
    // eslint-disable-next-line
    const signer = await sod();
    const buf = Buffer.alloc(n)
    // eslint-disable-next-line
    signer.randombytes_buf(buf)
    return buf
  }

  const hash = async (message: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const sign = async (message: string): Promise<Buffer> => {
    const data = Buffer.from(message);
    const decodedSecret = await z32_decode(secret as string);
    const decodedPublicKey = await z32_decode(pubky as string);

    // eslint-disable-next-line
    const signer = await sod();

    // eslint-disable-next-line
    const signingKey = new Uint8Array(signer.crypto_sign_SECRETKEYBYTES);
    signingKey.set(decodedSecret, 0);
    signingKey.set(decodedPublicKey, 32);

    // eslint-disable-next-line
    const signature = Buffer.alloc(signer.crypto_sign_BYTES);

    // eslint-disable-next-line
    signer.crypto_sign_detached(signature, data, signingKey);

    return signature
  }

  const verify = async (publicKey: string, signature: string, message: string): Promise<boolean> => {
    const data = Buffer.from(message);
    const decodedPublicKey = await z32_decode(publicKey);
    const decodedSignature = await z32_decode(signature);

    // eslint-disable-next-line
    const signer = await sod();

    // eslint-disable-next-line
    return signer.crypto_sign_verify_detached(decodedSignature, data, decodedPublicKey);
  }

  const z32_encode = async (buffer: Buffer): Promise<string> => {
    // @ts-ignore
    // eslint-disable-next-line
    const z32 = await import('z32');
    // eslint-disable-next-line
    return z32.encode(buffer)
  }

  const z32_decode = async (value: string): Promise<Buffer> => {
    // @ts-ignore
    // eslint-disable-next-line
    const z32 = await import('z32');
    // eslint-disable-next-line
    return Buffer.from(z32.decode(value));
  }

  return (
    <ClientContext.Provider
      value={{
        secret,
        pubky,
        homeserverURL,
        signUp,
        signOut,
        client_put,
        client_get,
        client_delete,
        randomBytes,
        z32_encode,
        z32_decode,
        sign,
        verify,
        hash
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
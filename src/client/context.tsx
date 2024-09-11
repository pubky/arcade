'use client';

import { createContext, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import sodium from 'sodium-javascript';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { decode, encode } from 'z32';

import {
  TClientContext
} from './types';

import { Keypair } from '@synonymdev/pubky';

import { Utils } from '../utils';

import { client, Homeserver } from './setup';

export const ClientContext = createContext<TClientContext>({} as TClientContext);

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState<Uint8Array | null>(
    Utils.storage.get('secret')
  );
  const [pubky, setPubky] = useState<string | null>(
    Utils.storage.get('pubky')
  );
  const [homeserverURL, setHomeserverURL] = useState<string | null>(
    Utils.storage.get('homeserverURL')
  );

  const isLoggedIn = async (): Promise<boolean> => {
    return pubky === null
  }

  const signUp = async (): Promise<void> => {
    try {
      const keypair = Keypair.random();
      const secretKey = keypair.secretKey();
      const pubky = keypair.publicKey().z32();
      const homeserverURL = `pubky://${pubky}/pub/`;

      await client.signup(keypair, Homeserver);

      Utils.storage.set('secret', secretKey);
      Utils.storage.set('pubky', pubky);
      Utils.storage.set('homeserverURL', homeserverURL);
      setSecret(secretKey);
      setPubky(pubky)
      setHomeserverURL(homeserverURL);
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (secret === null) {
        return
      }
      const keypair = Keypair.fromSecretKey(secret);
      await client.signout(keypair.publicKey());

      Utils.storage.remove('pubky');
      Utils.storage.remove('secret');
      Utils.storage.remove('homeserverURL');
      setSecret(null);
      setPubky(null);
      setHomeserverURL(null);
    } catch (error) {
      console.log(error);
    }
  };

  const client_put = async (path: string, content: Uint8Array): Promise<void> => {
    try {
      if (secret === null) {
        throw Error("Not logged in.");
      }

      await client.put(homeserverURL + path, content)
    } catch (error) {
      console.log(error);
    }
  };

  const client_get = async (path: string): Promise<Buffer | undefined> => {
    try {
      if (secret === null) {
        throw Error("Not logged in.");
      }
      const result = await client.get(path.startsWith('pubky://') ? path : homeserverURL + path);
      if (result === undefined) {
        throw Error("Not found.");
      }
      return Buffer.from(result);
    } catch (error) {
      console.log(error);
    }
  };

  const client_delete = async (path: string): Promise<void> => {
    try {
      if (secret === null) {
        throw Error("Not logged in.");
      }

      await client.delete(homeserverURL + path);
    } catch (error) {
      console.log(error);
    }
  };


  const randomBytes = (n: number = 32): Buffer => {
    const buf = Buffer.alloc(n)
    sodium.randombytes_buf(buf)
    return buf
  }

  const hash = async (message: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const sign = async (message: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      secret as Uint8Array,
      {
        name: 'Ed25519'
      },
      false,
      ['sign']
    );
    return await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      cryptoKey,
      data
    );
  }

  const verify = async (publicKey: Uint8Array, signature: ArrayBuffer, message: string): Promise<boolean> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      publicKey,
      {
        name: 'Ed25519'
      },
      false,
      ['verify']
    );
    return await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      cryptoKey,
      signature,
      data
    );
  }

  return (
    <ClientContext.Provider
      value={{
        secret,
        pubky,
        homeserverURL,
        signUp,
        signOut,
        isLoggedIn,
        client_put,
        client_get,
        client_delete,
        randomBytes,
        z32_encode: encode,
        z32_decode: decode,
        sign,
        verify,
        hash
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
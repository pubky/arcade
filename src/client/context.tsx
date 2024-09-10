'use client';

import { createContext, useState } from 'react';
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

  return (
    <ClientContext.Provider
      value={{
        client,
        secret,
        pubky,
        homeserverURL,
        signUp,
        signOut,
        isLoggedIn,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
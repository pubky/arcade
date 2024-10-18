'use client';

import { PubkyClient, PublicKey } from '@synonymdev/pubky';

export const client = new PubkyClient()

export const Homeserver = PublicKey.from(import.meta.env.VITE_HOMESERVER_PUBKY)
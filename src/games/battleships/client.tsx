'use client';

import { client } from '../../client';
import { Utils } from '../../utils';

const battleshipsStart = async (board: Record<string, number>) => {
  try {
    const pk = await isLoggedIn();

    if (!pk) throw new Error('Logged in failed : not logged in.');

    await client.ready();

    const seed = await client.crypto.generateSeed();
    const keypair = client.crypto.generateKeyPair(seed);
    const publicKey = client.z32.encode(keypair.publicKey);

    Utils.storage.set('b_public_key', keypair.publicKey);
    Utils.storage.set('b_secret_key', keypair.secretKey);
    setBPublicKey(keypair.publicKey);
    setBSecretKey(keypair.secretKey);
    
    const nonce = client.z32.encode(client.crypto.randomBytes());
    const id = client.z32.encode(client.crypto.randomBytes());

    const b3 = await client.crypto.blake3()
    const initialBoardHash = client.z32.encode(b3.hash(JSON.stringify(board)))
    const boardHash = client.z32.encode(b3.hash(initialBoardHash + nonce))

    await battleshipsEnsureRepo(pk)

    return {
      id,
      nonce,
      publicKey,
      pubky: pk,
      boardHash,
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

const battleshipsJoin = async (uri: string, board: Record<string, string>) => {
  try {
    const pk = await isLoggedIn();

    if (!pk) throw new Error('Logged in failed : not logged in.');

    await client.ready();

    const seed = await client.crypto.generateSeed();
    const keypair = client.crypto.generateKeyPair(seed);
    const publicKey = client.z32.encode(keypair.publicKey);

    Utils.storage.set('b_public_key', keypair.publicKey);
    Utils.storage.set('b_secret_key', keypair.secretKey);
    setBPublicKey(keypair.publicKey);
    setBSecretKey(keypair.secretKey);
    
    const nonce = client.z32.encode(client.crypto.randomBytes());

    const parts = uri.split('/')
    const id = parts[parts.length - 1]
    const enemyPubky = parts[0].replace('pk:', '')

    const b3 = await client.crypto.blake3()
    const initialBoardHash = client.z32.encode(b3.hash(JSON.stringify(board)))
    const boardHash = client.z32.encode(b3.hash(initialBoardHash + nonce))

    await battleshipsEnsureRepo(pk)

    return {
      id,
      nonce,
      publicKey,
      boardHash,
      pubky: pk,
      enemyPubky,
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

const battleshipsPut = async (input: {path: string, payload: Record<string, string>, preSig?: string}) => {
  const {path, payload, preSig} = input
  try {
    const pk = await isLoggedIn();

    if (!pk) throw new Error('Logged in failed : not logged in.');

    const [_, gameId, stage] = path.split('/')

    const getSig = async (payload, preSig = '') => {
      const b3 = await client.crypto.blake3()
      const payloadHash = client.z32.encode(b3.hash(JSON.stringify(payload)))
      const finalHash = client.z32.encode(b3.hash(payloadHash + preSig))
      return client.z32.encode(client.crypto.sign(new Uint8Array(Utils.storage.get('b_secret_key').data),
        new Uint8Array(Buffer.from(finalHash).buffer)));
    }

    await client.ready();

    const input = {
      data: payload,
      sig: await getSig(payload, preSig)
    }

    const result = await client.repos.put(pk, 'battleships.app', path, Buffer.from(JSON.stringify(input)))

    if (!result.ok)
      throw new Error(`Put failed: ${result.error.message}`);

    return result.value;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const battleshipsGet = async (userId: string, path: string) => {
  try {
    await client.ready();

    const targetUserId = userId.replace('pk:', '')
    const result = await client.repos.get(targetUserId, 'battleships.app', path)

    if (!result.ok)
      throw new Error(`Get failed: ${result.error.message}`);

    const body = JSON.parse(result.value.toString())
    // const {data, sig} = body

    // const verify = client.crypto.verify(sig, data, client.z32.decode(Utils.storage.get('b_enemy_public_key')))
    
    // if (!verify.ok)
    //   throw new Error(`failed to verify the signature`)

    return body;
  } catch (error) {
    console.log(error);
    return null;
  }
};


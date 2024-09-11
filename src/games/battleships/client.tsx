'use client';

import { TClientContext } from '../../client/types';

export class BattleshipsClient {
  constructor(private readonly context: TClientContext) { }

  async start(board: string) {
    try {
      const nonce = this.context.z32_encode(this.context.randomBytes());
      const id = this.context.z32_encode(this.context.randomBytes(8));

      const initialBoardHash = await this.context.hash(board);
      const currentBoardHash = await this.context.hash(initialBoardHash + "/" + nonce);

      return {
        id,
        nonce,
        boardHash: currentBoardHash,
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async join(board: string) {
    try {
      const nonce = this.context.z32_encode(this.context.randomBytes());

      const initialBoardHash = await this.context.hash(board);
      const boardHash = await this.context.hash(initialBoardHash + "/" + nonce)

      return {
        nonce,
        boardHash,
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async put(input: { path: string, payload: Record<string, string>, preSig?: string }) {
    const { path, payload, preSig } = input
    try {
      const getSig = async (payload: Record<string, string>, preSig = '') => {
        const payloadHash = await this.context.hash(JSON.stringify(payload));
        const finalHash = await this.context.hash(payloadHash + preSig);
        return this.context.sign(finalHash);
      }

      const input = {
        data: payload,
        sig: await getSig(payload, preSig)
      }

      await this.context.client_put('battleships.app/' + path, Buffer.from(JSON.stringify(input)))
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  async get(path: string, publicKey: Uint8Array) {
    try {
      const url = `pubky://${this.context.z32_encode(Buffer.from(publicKey))}/pub/battleships.app/`;
      const result = await this.context.client_get(url + path);

      if (!result) {
        throw new Error("not found.");
      }

      const body = JSON.parse(result.toString());
      const { data, sig } = body

      const encoder = new TextEncoder();
      const signatureBuffer = encoder.encode(sig).buffer;

      const verify = await this.context.verify(publicKey, signatureBuffer, data)

      if (!verify)
        throw new Error(`failed to verify the signature`)

      return body;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

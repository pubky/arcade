'use client';

import { Buffer } from 'buffer';

import { TClientContext } from '../../client/types';

export class BattleshipsClient {
  constructor(private readonly context: TClientContext) { }

  async start(board: string) {
    try {
      const nonce = await this.context.z32_encode(await this.context.randomBytes());

      const initialBoardHash = await this.context.hash(board);
      const boardHash = await this.context.hash(initialBoardHash + "/" + nonce);

      return {
        nonce,
        boardHash,
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async join(board: string) {
    try {
      const nonce = await this.context.z32_encode(await this.context.randomBytes());

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

  async getPayloadHash(payload: Record<string, string>, preSig = ''): Promise<string> {
    const payloadHash = await this.context.hash(JSON.stringify(payload));
    return this.context.hash(payloadHash + preSig);
  }

  async put(input: { path: string, payload: Record<string, string>, preSig?: string }) {
    const { path, payload, preSig } = input
    try {
      const payloadHash = await this.getPayloadHash(payload, preSig);
      const result = await this.context.sign(payloadHash);
      const sig = await this.context.z32_encode(result);
      const body = {
        data: payload,
        sig
      }

      await this.context.client_put('battleships.app/' + path, Buffer.from(JSON.stringify(body)))
      return { sig };
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  async get(path: string, publicKey: string, preSig: string) {
    try {
      const url = `pubky://${publicKey}/pub/battleships.app/`;
      const result = await this.context.client_get(url + path);

      if (!result) {
        throw new Error("not found.");
      }

      const body = JSON.parse(result.toString()) as { data: Record<string, string>, sig: string };
      const { data, sig } = body

      const payloadHash = await this.getPayloadHash(data, preSig);

      const verify = await this.context.verify(publicKey, sig, payloadHash)

      if (!verify)
        throw new Error(`failed to verify the signature`)

      return body;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

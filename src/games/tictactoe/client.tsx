'use client';

import { Buffer } from 'buffer';

import { TClientContext } from '../../client/types';
import { MatchState, TBoard, TRes } from '.';

export class TicTacToeClient {
  constructor(private readonly context: TClientContext) { }

  async start() {
    try {
      const random = await this.context.z32_encode(await this.context.randomBytes());
      const gameHash = await this.context.hash(random);

      return gameHash
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // async join(gameHash) {
  //   try {
  //     // const nonce = await this.context.z32_encode(await this.context.randomBytes());

  //     // const initialBoardHash = await this.context.hash(gameHash);

  //     return {
  //       nonce,
  //       boardHash,
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //   }
  // }

  // async getPayloadHash(payload: Record<string, string>, preSig = ''): Promise<string> {
  //   const payloadHash = await this.context.hash(JSON.stringify(payload));
  //   return this.context.hash(payloadHash + preSig);
  // }

  async put(input: { path: string, payload: TRes }) {
    const { path, payload } = input
    try {
      // const payloadHash = await this.getPayloadHash(payload, preSig);
      // const result = await this.context.sign(payloadHash);
      // const sig = await this.context.z32_encode(result);
      const body = {
        data: payload
      }

      await this.context.client_put('tictactoe.app/' + path, Buffer.from(JSON.stringify(body)))
      return true;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  async get(path: string, publicKey: string) : Promise<TRes> {
    try {
      const url = `pubky://${publicKey}/pub/tictactoe.app/`;
      const result = await this.context.client_get(url + path);

      if (!result) {
        throw new Error("not found.");
      }

      const body = JSON.parse(result.toString()) as TRes;

      // TODO: add tictactoe game state verification here?
      //const { data, currentPlayer } = body

      return body;
    } catch (error) {
      throw new Error("GET error: " + (error as Error).message);
    }
  }
}

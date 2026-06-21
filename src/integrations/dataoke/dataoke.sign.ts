import { createHash, randomInt } from "node:crypto";

type CreateDataokeSignRanParams = {
  appKey: string;
  appSecret: string;
  nonce: string;
  timer: string;
};

export function createDataokeNonce() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function createDataokeTimer() {
  return String(Date.now());
}

export function createDataokeSignRan({
  appKey,
  appSecret,
  nonce,
  timer,
}: CreateDataokeSignRanParams) {
  const signSource = `appKey=${appKey}&timer=${timer}&nonce=${nonce}&key=${appSecret}`;

  return createHash("md5").update(signSource).digest("hex").toUpperCase();
}

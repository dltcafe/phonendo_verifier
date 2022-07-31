import "dotenv/config";
import { start, stop } from "./libp2p-node.js";

import { toString } from "uint8arrays/to-string";
import { fromString } from "uint8arrays/from-string";

const { createSign, createPrivateKey, generateKeyPairSync } = await import(
  "node:crypto"
);

/* Dummy signature bcs crypto is broken and this initialize something... */
let { privateKey } = generateKeyPairSync("ec", {
  namedCurve: "sect239k1",
});
let sign = createSign("SHA256");
sign.write("");
sign.end();
sign.sign(privateKey, "hex");

// Import keys
const fs = await import("fs");
let keys = JSON.parse(fs.readFileSync("keys.json"));
privateKey = createPrivateKey({
  key: keys.privateKey,
  type: "pkcs8",
  format: "pem",
});

start({
  "/discover/1.0.0": () => fromString(process.env.SERVICE_NAME),
  "/pk/1.0.0": () => fromString(keys.publicKey),
  "/verify/1.0.0": async (source) => {
    source = toString(source);
    source = JSON.parse(source);
    let time = new Date().getTime();
    let signature = "";
    if (
      time > source.timestamp &&
      source.timestamp + process.env.EXPIRY_THRESHOLD_IN_SECONDS * 1000 >= time
    ) {
      const sign = createSign("SHA256");
      sign.write(JSON.stringify(source));
      sign.end();
      signature = sign.sign(privateKey, "hex");
    }
    return fromString(JSON.stringify({ source, signature }));
  },
})
  .then()
  .catch(console.error);

const exit = async () => {
  await stop();
  process.exit(0);
};

process.on("SIGTERM", exit);
process.on("SIGINT", exit);

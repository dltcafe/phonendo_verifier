import "dotenv/config";
import { start, stop } from "./libp2p-node.js";

import { toString } from "uint8arrays/to-string";
import { fromString } from "uint8arrays/from-string";

start({
  "/discover/1.0.0": () => fromString(process.env.SERVICE_NAME),
  "/verify/1.0.0": async (source) => {
    source = toString(source);
    source = JSON.parse(source);
    source.timestamp = new Date().getTime();
    return fromString(
      JSON.stringify({
        source,
        signature: "TODO",
      })
    );
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

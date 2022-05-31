import "dotenv/config";

import { createLibp2p } from "libp2p";
import { TCP } from "@libp2p/tcp";
import { Noise } from "@chainsafe/libp2p-noise";
import { Mplex } from "@libp2p/mplex";
import { MulticastDNS } from "@libp2p/mdns";

import { pipe } from "it-pipe";
import map from "it-map";

const node = await createLibp2p({
  addresses: {
    listen: [`/ip4/127.0.0.1/tcp/${process.env.PORT}`],
  },
  transports: [new TCP()],
  connectionEncryption: [new Noise()],
  streamMuxers: [new Mplex()],
  peerDiscovery: [
    new MulticastDNS({
      interval: 20e3,
    }),
  ],
});

const start = async (protocols) => {
  await node.start();

  node.getMultiaddrs().forEach((addr) => {
    console.log("Listening on", addr.toString());
  });

  node.handle(Object.keys(protocols), ({ protocol, stream }) => {
    pipe(
      stream.source,
      async (source) => map(source, protocols[protocol]),
      stream.sink
    );
  });
};

const stop = async () => {
  await node.stop();
  console.log(`${process.env.SERVICE_NAME} has stopped`);
};

export { start, stop };

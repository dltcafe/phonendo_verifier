const { generateKeyPairSync } = await import("node:crypto");
const fs = await import("fs");

const { publicKey, privateKey } = generateKeyPairSync("ec", {
  namedCurve: "sect239k1",
});

const keys = {
  privateKey: privateKey
    .export({ type: "pkcs8", format: "pem" })
    .toString("hex"),
  publicKey: publicKey
    .export({ type: "spki", format: "pem" })
    .toString("hex"),
};

fs.writeFileSync("keys.json", JSON.stringify(keys, null, 2), (err) => {
  if (err) throw err;
  console.log("File created successfully.");
});

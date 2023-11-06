const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

for (let i = 0; i < 3; i++) {
  const privateKey = toHex(secp256k1.utils.randomPrivateKey());
  const publicKey = toHex(secp256k1.getPublicKey(privateKey));
  console.log(`Private Key ${i + 1}: ${privateKey}`);
  console.log(`Public Key ${i + 1}: ${publicKey}`);
  console.log("=========================================================");
}

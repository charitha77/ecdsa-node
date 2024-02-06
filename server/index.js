const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "028d8866b7e5aa1c84de5577a010b662dfd4ee5e2043c235c4b198fa861684d20e": 100,
  "03f7935b9d1ff60e30f4e7e0f3ef76862dcf9bcc57fa7e5f084319df6b8404ecb4": 50,
  "0281c8c9483ab4ea4cd66805827148452cad12d0bc83e97592b33438314bb537b5": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signatureObj, messageHex, sender, recipient, amount } = req.body;

  //convert signature back to BigInt values
  for (const key in signatureObj) {
    if (typeof signatureObj[key] === "string") {
      signatureObj[key] = BigInt(signatureObj[key]);
    }
  }

  const { r, s, recovery } = signatureObj;

  //Recover public key from signature
  const signature = new secp256k1.Signature(r, s, recovery);

  //check if it corressponds to the sender's address
  const isValid = secp256k1.verify(signature, messageHex, sender);
  if (isValid) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

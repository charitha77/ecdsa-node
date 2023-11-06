import { useState } from "react";
import server from "./server";

import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      if (!privateKey) {
        alert("Enter your private key");
        return;
      }

      if (privateKey.length !== 64 || !/^[0-9A-Fa-f]+$/.test(privateKey)) {
        alert("Enter a valid private key");
        return;
      }

      if (!sendAmount) {
        alert("Enter an amount to transfer");
        return;
      }

      if (!parseInt(sendAmount)) {
        alert("Enter a valid amount");
        return;
      }

      if (!recipient) {
        alert("Enter an address to transfer funds to");
        return;
      }

      if (recipient.length !== 65 || !/^[0-9A-Fa-f]+$/.test(recipient)) {
        alert("Enter a valid address");
        return;
      }

      //Sign the message
      const message = `Transfer ${sendAmount} to ${recipient}`;
      const messageHash = keccak256(utf8ToBytes(message));
      const signature = secp256k1.sign(messageHash, hexToBytes(privateKey));

      //Serialize BigInt properties of signature
      for (const key in signature) {
        if (typeof signature[key] === "bigint") {
          signature[key] = signature[key].toString();
        }
      }

      //Send request
      const {
        data: { balance },
      } = await server.post(`send`, {
        signatureObj: signature,
        messageHex: toHex(messageHash),
        amount: parseInt(sendAmount),
        sender: address,
        recipient,
      });

      setBalance(balance);
    } catch (err) {
      if (err.response?.data?.message) alert(err.response.data.message);
    } finally {
      setSendAmount("");
      setRecipient("");
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 028d8866b...20e"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

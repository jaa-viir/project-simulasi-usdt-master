import { ethers } from "ethers";
import DummyABI from "./DummyUSDT_ABI.json";

const CONTRACT_ADDRESS = ""; // Ini nanti diisi ya bolo

let provider;
let signer;
let contract;

export const initBlockchain = async () => {
  if (window.ethereum) {
    // connect to MetaMask
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, DummyABI, signer);
  } else {
    console.error("MetaMask not found!");
  }
};

export const mintDummyUSDT = async (to, amount) => {
  if (!contract) await initBlockchain();
  const tx = await contract.mint(to, amount);
  await tx.wait();
  return tx;
};

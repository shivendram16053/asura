import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contractABI from "./abi.json";

const CONTRACT_ADDRESS = "0x5E00FDD224753e74B6d40ED1bCB0DE4295693d7F";

export const getWeb3 = () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const web3 = new Web3((window as any).ethereum);
    return web3;
  }
  throw new Error("No Ethereum browser extension detected");
};

export const getContract = (web3: Web3) => {
  const abi = contractABI.abi;
  return new web3.eth.Contract(abi as AbiItem[], CONTRACT_ADDRESS);
};

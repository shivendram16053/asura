import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contractABI from "../contracts/artifacts/contracts/asura.sol/Asura.json";

const CONTRACT_ADDRESS = "your_contract_address_here";

export const getWeb3 = () => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const web3 = new Web3((window as any).ethereum);
    return web3;
  }
  throw new Error("No Ethereum browser extension detected");
};

export const getContract = (web3: Web3) => {
  return new web3.eth.Contract(contractABI as unknown as AbiItem[], CONTRACT_ADDRESS);
};

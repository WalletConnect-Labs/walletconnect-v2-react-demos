import { JsonRpcRequest } from "@json-rpc-tools/utils";
import { config } from "caip-api";

import ethereumLogo from "../assets/ethereum.png";
import goerliLogo from "../assets/goerli.png";
import xdaiLogo from "../assets/xdai.png";

import {
  NamespaceMetadata,
  ChainMetadata,
  ChainRequestRender,
  convertHexToNumber,
  convertHexToUtf8,
} from "../helpers";

export const EIP155Metadata: NamespaceMetadata = {
  "1": {
    ...config.eip155["1"],
    name: "Ethereum", // overrides name from Ethereum Mainnet to Ethereum
    logo: ethereumLogo,
    color: "99, 125, 234",
  },
  "5": {
    ...config.eip155["5"],
    logo: goerliLogo,
    color: "189, 174, 155",
  },
  "100": {
    ...config.eip155["100"],
    logo: xdaiLogo,
    color: "73, 169, 166",
  },
};

export function getChainMetadata(chainId: string): ChainMetadata {
  const reference = chainId.split(":")[1];
  const metadata = EIP155Metadata[reference];
  if (typeof metadata === "undefined") {
    throw new Error(`No chain metadata found for chainId: ${chainId}`);
  }
  return metadata;
}

export function getChainRequestRender(request: JsonRpcRequest): ChainRequestRender[] {
  let params = [{ label: "Method", value: request.method }];

  switch (request.method) {
    case "eth_sendTransaction":
    case "eth_signTransaction":
      params = [
        ...params,
        { label: "From", value: request.params[0].from },
        { label: "To", value: request.params[0].to },
        {
          label: "Gas Limit",
          value: request.params[0].gas
            ? convertHexToNumber(request.params[0].gas)
            : request.params[0].gasLimit
            ? convertHexToNumber(request.params[0].gasLimit)
            : "",
        },
        {
          label: "Gas Price",
          value: convertHexToNumber(request.params[0].gasPrice),
        },
        {
          label: "Nonce",
          value: convertHexToNumber(request.params[0].nonce),
        },
        {
          label: "Value",
          value: request.params[0].value ? convertHexToNumber(request.params[0].value) : "",
        },
        { label: "Data", value: request.params[0].data },
      ];
      break;

    case "eth_sign":
      params = [
        ...params,
        { label: "Address", value: request.params[0] },
        { label: "Message", value: request.params[1] },
      ];
      break;
    case "personal_sign":
      params = [
        ...params,
        { label: "Address", value: request.params[1] },
        {
          label: "Message",
          value: convertHexToUtf8(request.params[0]),
        },
      ];
      break;
    default:
      params = [
        ...params,
        {
          label: "params",
          value: JSON.stringify(request.params, null, "\t"),
        },
      ];
      break;
  }
  return params;
}

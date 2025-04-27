import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { getAllowlistedKeyServers, SealClient } from "@mysten/seal";
const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageID: "0x2b5a2d26bdb21a94a4577f4590f742b886befc0ce586a6594260919ccfef57a4",
        module: "hackathon_qidian",
        stateID: "0x84678d6920e4ab09a08e9cdbd81020139c55328ca9c50d3c4acd53cd962d685a",
      },
    },
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageID: "",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });
const defaultNetwork = "testnet";
const suiClient = new SuiClient(networkConfig[defaultNetwork]);
const sealClient = new SealClient({
  suiClient,
  serverObjectIds: getAllowlistedKeyServers(defaultNetwork),
});
export {
  useNetworkVariable,
  useNetworkVariables,
  networkConfig,
  suiClient,
  sealClient,
  defaultNetwork,
};

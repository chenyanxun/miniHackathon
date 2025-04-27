"use client";
import {
  sealClient,
  suiClient,
  useNetworkVariables,
} from "@/app/networkconfig";
import { Button } from "@/components/ui/button";
import { IVaribales } from "@/type";
import {
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHEX } from "@mysten/sui/utils";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function Chapter() {
  const [isPay, setIsPay] = useState(false);
  const [content, setContent] = useState("");
  const params = useParams();
  const { id } = params; // 获取动态路由参数
  const searchParams = useSearchParams();
  const chapter = searchParams.get("chapter") as string;
  const blobId = searchParams.get("blobId") as string;
  const amount = searchParams.get("amount") as string;
  const encryptId = searchParams.get("encryptId") as string;
  const { packageID, module } = useNetworkVariables() as IVaribales;
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  useEffect(() => {
    if (Number(amount) === 0) {
      setIsPay(true);
      fetchData();
      async function fetchData() {
        const result = await fetch(
          `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
        );
        const data = await result.text();
        setContent(data);
      }
    } else {
      setIsPay(false);
    }
  }, [amount]);
  // 充值
  const payEvent = () => {
    const tx = new Transaction();
    tx.moveCall({
      package: packageID,
      module: module,
      function: "add_allowlist",
      arguments: [tx.object(id as string)],
    });
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (res) => {
          if (res.digest) {
            const result = await suiClient.waitForTransaction({
              digest: res.digest,
              options: { showEffects: true, showEvents: true },
            });
            if (result.effects?.status.status === "success") {
              getTxtContent();
              console.log("Transaction success:", result);
            }
          }
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  };
  const constructTxBytes = async () => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageID}::${module}::seal_approve`,
      arguments: [tx.pure.vector("u8", fromHEX(encryptId))],
    });
    return await tx.build({ client: suiClient, onlyTransactionKind: true });
  };
  // 解密
  const getTxtContent = async () => {
    const txBytes = await constructTxBytes();
    console.log("Constructed txBytes:", txBytes);
    const sessionKey = new SessionKey({
      address:
        "0x32497c80bdd176f501c76c0769d1815f842279698b233a01f32af0df323a8180",
      packageId: packageID,
      ttlMin: 10,
    });
    const result = await fetch(
      `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
    );
    console.log("Fetched result:", result);
    const dataBuffer = new Uint8Array(await result.arrayBuffer());
    console.log("Data buffer:", dataBuffer);
    signPersonalMessage(
      {
        message: sessionKey.getPersonalMessage(),
      },
      {
        onSuccess: async (res) => {
          sessionKey.setPersonalMessageSignature(res.signature);
          console.log("==sessionKey", sessionKey)
          try {
            const decryptedFile = await sealClient.decrypt({
              data: dataBuffer,
              sessionKey,
              txBytes,
            });
            console.log("====decryptedFile", decryptedFile);
          } catch (err) {
            if (err instanceof TypeError && err.message.includes("Unknown value")) {
              console.error("Unsupported encryption type:", err);
            } else {
              console.error("Decryption error:", err);
            }
          }
        },
      }
    );
  };
  const getContent = () => {
    return (
      <>
        <h1 className="text-2xl font-bold mt-4">{chapter}</h1>
        <div className="mt-10">
          {content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </>
    );
  };
  return (
    <div>
      {isPay ? (
        getContent()
      ) : (
        <Button variant="default" onClick={getTxtContent}>
          充值 {amount}MIST
        </Button>
      )}
    </div>
  );
}

export default Chapter;

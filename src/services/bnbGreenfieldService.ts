import { GREEN_CHAIN_ID, GRPC_URL } from '../config/env';
import { IReturnOffChainAuthKeyPairAndUpload } from '@bnb-chain/greenfield-js-sdk';

import { Client } from '@bnb-chain/greenfield-js-sdk';
import { Connector } from 'wagmi';
import { IStrategy } from '../components/StrategyControls/interface';

export const client = Client.create(GRPC_URL, String(GREEN_CHAIN_ID));

export const getSps = async () => {
  const sps = await client.sp.getStorageProviders();
  const finalSps = (sps ?? []).filter((v) => v.endpoint.includes('nodereal'));

  return finalSps;
};

export const getAllSps = async () => {
  const sps = await getSps();

  return sps.map((sp) => {
    return {
      address: sp.operatorAddress,
      endpoint: sp.endpoint,
      name: sp.description?.moniker,
    };
  });
};

export const selectSp = async () => {
  const finalSps = await getSps();

  const selectIndex = Math.floor(Math.random() * finalSps.length);

  const secondarySpAddresses = [
    ...finalSps.slice(0, selectIndex),
    ...finalSps.slice(selectIndex + 1),
  ].map((item) => item.operatorAddress);
  const selectSpInfo = {
    id: finalSps[selectIndex].id,
    endpoint: finalSps[selectIndex].endpoint,
    primarySpAddress: finalSps[selectIndex]?.operatorAddress,
    sealAddress: finalSps[selectIndex].sealAddress,
    secondarySpAddresses,
  };

  return selectSpInfo;
};

/**
 * generate off-chain auth key pair and upload public key to sp
 */
export const getOffchainAuthKeys = async (address: string, provider: any) => {
  const storageResStr = localStorage.getItem(address);

  if (storageResStr) {
    const storageRes = JSON.parse(storageResStr) as IReturnOffChainAuthKeyPairAndUpload;
    if (storageRes.expirationTime < Date.now()) {
      alert('Your auth key has expired, please generate a new one');
      localStorage.removeItem(address);
      return;
    }

    return storageRes;
  }

  const allSps = await getAllSps();
  const offchainAuthRes = await client.offchainauth.genOffChainAuthKeyPairAndUpload(
    {
      sps: allSps,
      chainId: GREEN_CHAIN_ID,
      expirationMs: 5 * 24 * 60 * 60 * 1000,
      domain: window.location.origin,
      address,
    },
    provider,
  );

  const { code, body: offChainData } = offchainAuthRes;
  if (code !== 0 || !offChainData) {
    throw offchainAuthRes;
  }

  localStorage.setItem(address, JSON.stringify(offChainData));
  return offChainData;
};

export const getStrategiesFromGreenfield = async (bucketName: string, objectName: string, address: string, connector: Connector): Promise<IStrategy[] | null> => {

  const provider = await connector.getProvider();
  const offChainData = await getOffchainAuthKeys(address, provider);
  if (!offChainData) throw new Error('No offchain, please create offchain pairs first');

  const res = await client.object.getObject(
    {
      bucketName,
      objectName,
    },
    {
      type: 'EDDSA',
      address,
      domain: window.location.origin,
      seed: offChainData.seedString,
    },
  );

  // transform blob in string and then parse it as json
  if (!res.body) {
    throw new Error('Response body is undefined');
  }
  const blob = await res.body.arrayBuffer();
  const text = new TextDecoder().decode(blob);
  const json = JSON.parse(text);

  return json;
};
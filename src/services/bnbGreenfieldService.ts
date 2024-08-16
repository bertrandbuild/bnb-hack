import { GREEN_CHAIN_ID, GRPC_URL } from '../config/env';
import { IReturnOffChainAuthKeyPairAndUpload, OnProgressEvent, SpResponse, VisibilityType, Long } from '@bnb-chain/greenfield-js-sdk';

import { Client } from '@bnb-chain/greenfield-js-sdk';
import { Connector } from 'wagmi';
import { IStrategy } from '../components/StrategyControls/interface';

export type NodeFile = {
  name: string;
  type: string;
  size: number;
  content: Buffer;
};

export const client = Client.create(GRPC_URL, String(GREEN_CHAIN_ID));

export const getSps = async () => {
  const sps = await client.sp.getStorageProviders();
  const finalSps = (sps ?? []).filter((v) => v.endpoint.includes('nodereal'));

  return finalSps;
};

/**
 * get all sps
 */
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

/**
 * select a sp (storage provider)
 */
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
export const getOffchainAuthKeys = async (address: string, provider: unknown) => {
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

export const listAllObjectsFromBucket = async (bucketName: string, address: string, connector: Connector): Promise<IStrategy[]> => {
  const { endpoint } = await selectSp();

  const res = await client.object.listObjects({
    bucketName,
    endpoint
  });

  console.log(res);
  if (!res.body) {
    console.error('Response body is undefined');
    throw new Error('Response body is undefined');
  }

  const strategies = await Promise.all(
    res.body.GfSpListObjectsByBucketNameResponse.Objects.map(async (objMeta) => {
      const name = objMeta.ObjectInfo.ObjectName;
      console.log(name);
      return downloadFromGreenfield(bucketName, name, address, connector);
    })
  );

  return strategies.filter((strategy): strategy is IStrategy => strategy !== null);
}

/**
 * download from greenfield
 */
export const downloadFromGreenfield = async (bucketName: string, objectName: string, address: string, connector: Connector): Promise<IStrategy | null> => {

  const provider = await connector.getProvider();
  if (!provider) throw new Error('No provider');
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
    console.error('Response body is undefined');
    throw new Error('Response body is undefined');
  }
  const blob = await res.body.arrayBuffer();
  const text = new TextDecoder().decode(blob);
  const json = JSON.parse(text);

  return json;
};

/**
 * create a bucket and retry if it does not exist
 */
export const createBucket = async (address: string, connector: Connector, bucketName: string): Promise<SpResponse<null>> => {
  if (!address) throw new Error('No address');
  if (!bucketName) throw new Error('No bucket name');

  const spInfo = await selectSp();

  const provider = await connector?.getProvider();
  const offChainData = await getOffchainAuthKeys(address, provider);
  if (!offChainData) {
    throw new Error('No offchain, please create offchain pairs first');
  }

  try {
    const createBucketTx = await client.bucket.createBucket(
      {
        bucketName,
        creator: address,
        primarySpAddress: spInfo.primarySpAddress,
        visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
        chargedReadQuota: Long.fromString('0'),
        paymentAddress: address,
      },
    );

    const simulateInfo = await createBucketTx.simulate({
      denom: 'BNB',
    });

    const res = await createBucketTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(simulateInfo?.gasLimit),
      gasPrice: simulateInfo?.gasPrice || '5000000000',
      payer: address,
      granter: '',
    });

    if (res.code === 0) {
      return res;
    }
  } catch (err) {
    console.log(typeof err)
    if (err instanceof Error) {
      console.error(err);
      throw err;
    }
    if (err && typeof err === 'object') {
      console.error(err);
      throw new Error(JSON.stringify(err))
    }
  }

  return { code: -1, message: 'Unhandled error' };
}

/**
 * upload to greenfield
 * create the bucket and retry if it does not exist
 */
export const uploadToGreenfield = async (address: string, connector: Connector, info: { bucketName: string, objectName: string, file: File | NodeFile }): Promise<SpResponse<null>> => {
  if (!address || !info.file) {
    throw new Error('No address or file');
  }

  const provider = await connector?.getProvider();
  const offChainData = await getOffchainAuthKeys(address, provider);
  if (!offChainData) {
    throw new Error('No offchain, please create offchain pairs first');
  }

  try {
    const res = await client.object.delegateUploadObject({
      bucketName: info.bucketName,
      objectName: info.objectName,
      body: info.file,
      delegatedOpts: {
        visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      },
      onProgress: (e: OnProgressEvent) => {
        console.log('progress: ', e.percent);
      },
    }, {
      type: 'EDDSA',
      address: address,
      domain: window.location.origin,
      seed: offChainData.seedString,
    })

    if (res.code === 0) {
      return res;
    }
    throw new Error(JSON.stringify(res))
  } catch (err) {
    let silentError = false;
    if (err instanceof Error) {
      // if bucket does not exist, create it and retry
      if (err.message.includes("No such bucket")) {
        silentError = true;
        await createBucket(address, connector, info.bucketName).then(async () => {
          await uploadToGreenfield(address, connector, info);
        })
      } else {
        console.error(err);
        throw err;
      }
    }
    if (err && typeof err === 'object' && !silentError) {
      console.error(err);
      throw new Error(JSON.stringify(err))
    }
  }
  return { code: -1, message: 'Unhandled error' };
}
import { useEffect, useState } from 'react';
import { Buckets, Client, PrivateKey, ThreadID } from '@textile/hub';


export default function useTextile (bucketName = 'nama') {
  const [identity, setIdentity] = useState(undefined);
  const [buckets, setBuckets] = useState(undefined);
  const [threadDBClient, setThreadDBClient] = useState(undefined);
  const [bucketKey, setBucketKey] = useState(undefined);
  const [threadId, setThreadId] = useState(undefined);

  useEffect(() => {
    if (!identity) {
      getIdentity(setIdentity)
    }

    if (identity && !buckets) {
      getBuckets(bucketName, identity, setBuckets, setThreadId, setBucketKey)
    }

    if (identity && !threadDBClient) {
      getThreadDBClient(identity, setThreadDBClient)
    }
  }, [identity, buckets, threadDBClient, bucketName]);

  return { identity, buckets, threadDBClient, threadID: threadId && ThreadID.fromString(threadId), bucketKey };
}

const getIdentity = async (setIdentity) => {
  const cached = localStorage.getItem('user-private-identity')
  if (cached) {
    setIdentity(PrivateKey.fromString(cached))
  }
  const identity = await PrivateKey.fromRandom()
  localStorage.setItem('user-private-identity', identity.toString())
  setIdentity(identity)
}

const getBuckets = async (bucketName, identity, setBuckets, setThreadId, setBucketKey) => {
  if (!identity) return

  const keyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY }

  const buckets = await Buckets.withKeyInfo(keyInfo)
  await buckets.getToken(identity)

  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) {
    throw new Error('Failed to open bucket')
  }

  setBuckets(buckets)
  setThreadId(threadID)
  setBucketKey(root.key)
}

const getThreadDBClient = async (identity, setThreadDBClient) => {
  if (!identity) return

  const keyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY }

  const client = await Client.withKeyInfo(keyInfo)
  await client.getToken(identity)

  setThreadDBClient(client)
}

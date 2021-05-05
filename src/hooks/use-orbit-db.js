import { useEffect, useState } from 'react';
const OrbitDB = require('orbit-db');

const dbConfig = {
  create: true,
  sync: false,
  accessController: {
    write: ['*'],
  }
}

export default function useOrbitDb (name, ipfs) {
  const [docStore, setDocStore] = useState(null);
  useEffect(() => {
    createDocStore(name, ipfs, setDocStore)
  }, [ipfs, name]);
  return docStore;
}

async function createDocStore (name, ipfs, setDocStore) {
  if (!ipfs || !name) return;

  const orbitdb = await OrbitDB.createInstance(ipfs);
  const docStore = await orbitdb.docstore(name, dbConfig);
  setDocStore(docStore);
}

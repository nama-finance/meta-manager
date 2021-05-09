import {useEffect, useState} from 'react';
import Nav from './components/nav';
import useIpfsFactory from './hooks/use-ipfs-factory';
import { IpfsContext, OrbitdbContext, TorusContext } from './context'
import useOrbitDb from './hooks/use-orbit-db';
import './App.css';
import MetaList from './components/meta-list';
import OpenLogin from '@toruslabs/openlogin';
import crypto from 'crypto';
import eccrypto from '@toruslabs/eccrypto';
import { CircularProgress, Center } from '@chakra-ui/react';
import { ethers } from 'ethers';

const VERIFIER = {
  loginProvider: 'google', // 'twitter'
  clientId: process.env.REACT_APP_TORUS_CLIENT_ID,
}

function App() {
  const [isLoading, setLoading] = useState(true);
  const [privKey, setPrivKey] = useState();
  const [pubKey, setPubKey] = useState();
  const [walletAddress, setWalletAddress] = useState('');
  const [openLogin, setOpenLogin] = useState();

  const { ipfs } = useIpfsFactory({ commands: ['id'] });
  const orbitdb = useOrbitDb(walletAddress, ipfs);

  const onTorusLogin = async () => {
    if (isLoading || privKey) return;

    try {
      await openLogin.login({
        loginProvider: VERIFIER.loginProvider,
        redirectUrl: `${window.origin}`,
      });
      setOpenLogin(openLogin);

      if (openLogin.privKey) {
        const publicKey = eccrypto.getPublic(Buffer.from(openLogin.privKey, 'hex')).toString('hex');
        setPubKey(publicKey);
        const wallet = new ethers.Wallet(openLogin.privKey, ethers.getDefaultProvider());
        const address = await wallet.getAddress();
        setWalletAddress(address);
        setPrivKey(openLogin.privKey);
      }
    } finally {
      setLoading(false);
    }
  };

  const onTorusLogout = async () => {
    setPrivKey('');
    setWalletAddress('');
    await openLogin.logout();
  }

  const onMount = async () => {
    if (openLogin) return;

    try {
      const openLogin = new OpenLogin({
        clientId: VERIFIER.clientId,
        network: 'testnet',
        iframeUrl: 'http://beta.openlogin.com',
      });

      await openLogin.init();
      setOpenLogin(openLogin);
      if (openLogin.privKey) {
        const publicKey = eccrypto.getPublic(Buffer.from(openLogin.privKey, 'hex')).toString('hex');
        setPubKey(publicKey);
        setPrivKey(openLogin.privKey);
        const wallet = new ethers.Wallet(openLogin.privKey, ethers.getDefaultProvider());
        const address = await wallet.getAddress();
        setWalletAddress(address);
        console.log('Torus is initialised')
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onMount();
  }, []);

  return (
    isLoading ? (
        <Center>
          <CircularProgress isIndeterminate color="green.300" />
          Loading...
        </Center>
      )
    : (
        <IpfsContext.Provider value={{ipfs}}>
          <TorusContext.Provider value={{walletAddress, pubKey, privKey, onTorusLogin, onTorusLogout}}>
            <OrbitdbContext.Provider value={{orbitdb}}>
              <div className="App">
                <Nav />

                <MetaList />
              </div>
            </OrbitdbContext.Provider>
          </TorusContext.Provider>
        </IpfsContext.Provider>
      )
  );
}

export default App;


// const privateKey = Buffer.from(openLogin.privKey, 'hex');
// const publicKey = eccrypto.getPublic(privateKey);
// const str = "message to sign";
// const msg = crypto.createHash("sha256").update(str).digest();
// eccrypto.sign(privateKey, msg).then(function(sig) {
//   console.log("Signature in DER format:", sig);
//
//   eccrypto.verify(publicKey, msg, sig).then(function() {
//     console.log("Signature is OK");
//   }).catch(function() {
//     console.log("Signature is BAD");
//   });
// });

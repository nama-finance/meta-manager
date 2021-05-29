import { useEffect, useState } from 'react';
import Nav from './components/nav';
import { WalletAddressContext, WalletProviderContext, TextileProviderContext } from './context'
import './App.css';
import MetaList from './components/meta-list';
import { CircularProgress, Center } from '@chakra-ui/react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import useTextile from './hooks/use-textile';


const providerOptions = {
  /* See Provider Options Section */
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "150728338e714d64b631df5642531275" // required
    }
  }
};

function App() {
  const [isLoading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState();
  const [web3, setWeb3] = useState(undefined);
  const [signer, setSigner] = useState(undefined);

  const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions
  });

// let identity, buckets, threadDBClient


  const onWeb3Connect = async () => {
    await onReset();

    const provider = await web3Modal.connect();
    await provider.enable();
    setProvider(provider);
    await subscribeProvider(provider);

    const web3 = new ethers.providers.Web3Provider(provider);
    setWeb3(web3);

    const signer = web3.getSigner();
    setSigner(signer);
    const address = await signer.getAddress();
    setWalletAddress(address);
  }

  useEffect(() => {
    if (!web3Modal.cachedProvider) {
      onWeb3Connect();
    }
    setLoading(false)
  }, [])


  // useEffect(() => {
  //   if (buckets) {
  //     console.log('identity:', identity, buckets)
  //     isLoading && setLoading(false)
  //   }
  //
  // }, [buckets])

  const subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }

    provider.on('close', () => onReset());
    provider.on('accountsChanged', async (accounts) => {
      setWalletAddress(accounts[0]);
    });
    provider.on('chainChanged', async (chainId) => {
      console.log('chain changed:', chainId);
    });

    provider.on('networkChanged', async (networkId) => {
      console.log('network changed:', networkId);
    });
  }

  const onReset = async () => {
    await web3Modal.clearCachedProvider();
    // await onWeb3Connect();
  }

  return (
    isLoading ? (
        <Center h={'100vh'}>
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      )
    : (
        // <TextileProviderContext.Provider value={{identity, buckets}}>
        <WalletProviderContext.Provider value={{provider, web3}}>
          <WalletAddressContext.Provider value={{walletAddress, onWeb3Connect, onReset, signer}}>

              <div className="App">
                <Nav />

                <MetaList />
              </div>

          </WalletAddressContext.Provider>
        </WalletProviderContext.Provider>
        // </TextileProviderContext.Provider>
      )
  );
}

export default App;

import { createContext } from 'react'

const IpfsContext = createContext();

const OrbitdbContext = createContext();

const TorusContext = createContext({
  walletAddress: '',
  pubKey: '',
  privKey: '',
  setPubKey: () => {},
  onTorusLogin: () => {},
  onTorusLogout: () => {}
})

const WalletAddressContext = createContext({});

const WalletProviderContext = createContext({});

const TextileProviderContext = createContext({});

export {
  IpfsContext,
  OrbitdbContext,
  TorusContext,
  WalletAddressContext,
  WalletProviderContext,
  TextileProviderContext,
}

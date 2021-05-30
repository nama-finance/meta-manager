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

const TextileContext = createContext({});

export {
  IpfsContext,
  OrbitdbContext,
  TorusContext,
  WalletAddressContext,
  WalletProviderContext,
  TextileContext,
}

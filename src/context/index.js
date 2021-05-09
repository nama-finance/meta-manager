import React from 'react'

const IpfsContext = React.createContext();

const OrbitdbContext = React.createContext();

const TorusContext = React.createContext({
  walletAddress: '',
  pubKey: '',
  privKey: '',
  setPubKey: () => {},
  onTorusLogin: () => {},
  onTorusLogout: () => {}
})

export {
  IpfsContext,
  OrbitdbContext,
  TorusContext,
}

import React from 'react';
import { Button, Flex } from '@chakra-ui/react';
import {useEffect, useState} from 'react';
import OpenLogin from '@toruslabs/openlogin';
import eccrypto from '@toruslabs/eccrypto';

const VERIFIER = {
  loginProvider: 'google', // 'twitter'
  clientId: process.env.REACT_APP_TORUS_CLIENT_ID,
}

const Nav = () => {
  const [isLoading, setLoading] = useState(true);

  const [openLogin, setOpenLogin] = useState();
  const [privKey, setPrivKey] = useState();

  const onMount = async () => {
    setLoading(true);

    try {
      const openLogin = new OpenLogin({
        clientId: VERIFIER.clientId,
        network: 'testnet',
        iframeUrl: 'http://beta.openlogin.com',
      });
      setOpenLogin(openLogin);

      await openLogin.init();
      setPrivKey(openLogin.privKey);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    if (isLoading || privKey) return;

    setLoading(true);
    try {
      await openLogin.login({
        loginProvider: VERIFIER.loginProvider,
        redirectUrl: 'http://localhost:3000',
      });
      // console.log('==>', eccrypto.getPublic(openLogin.privKey))
      setPrivKey(openLogin.privKey);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onMount();
  }, []);

  if(isLoading) return <div>Loading...</div>;

  return (
    <Flex
      justifyContent="flex-end"
      padding={'1rem'}
      style={{'borderBottom': '1px solid lightblue'}}
    >
      {
        privKey ? (<div>Logged in: { `${privKey.substr(0, 4)}...${privKey.substr(-4)}` }</div>) :
        (<Button
          colorScheme="blue"
          _hover={{bg: "#0c6ff9"}}
          onClick={onLogin}
        >Connect Wallet</Button>)
      }
    </Flex>
  )
}

export default Nav;

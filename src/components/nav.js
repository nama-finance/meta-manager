import React, { useContext } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { TorusContext } from '../context';


const cursor = {
  cursor: 'pointer'
};

const Nav = () => {
  const { walletAddress, onTorusLogin, onTorusLogout } = useContext(TorusContext);

  return (
    <>
      <Flex
        justifyContent={'space-between'}
        padding={'1rem'}
        style={{'borderBottom': '1px solid lightblue'}}
      >
        <span>Meta Manager</span>
        {
          walletAddress ? (
            <div onClick={() => onTorusLogout()} style={cursor} title={'Click to logout'}>
              Logged in: { `${walletAddress.substr(0, 8)}...${walletAddress.substr(-4)}` }
            </div>
            ) :
          (<Button
            colorScheme="blue"
            _hover={{bg: "#0c6ff9"}}
            onClick={onTorusLogin}
          >Connect Wallet</Button>)
        }
      </Flex>
    </>
  )
}

export default Nav;

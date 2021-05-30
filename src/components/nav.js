import React, { useContext } from 'react';
import { Button, Flex, Wrap, Box, WrapItem } from '@chakra-ui/react';
import { WalletAddressContext } from '../context';
import { Link } from 'react-router-dom';


const cursor = {
  cursor: 'pointer'
};

const Nav = () => {
  const { walletAddress, onWeb3Connect, onReset } = useContext(WalletAddressContext);

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
            <Wrap spacing="30px">
              <WrapItem>
                <Link to="/">Meta List</Link>
              </WrapItem>
              <WrapItem>
                <Link to="/bucket">Media Bucket</Link>
              </WrapItem>
              <WrapItem>
                <div onClick={() => onReset()} style={cursor} title={'Click to logout'}>
                  Logged in: { `${walletAddress.substr(0, 8)}...${walletAddress.substr(-4)}` }
                </div>
              </WrapItem>

            </Wrap>
            ) :
          (<Button
            colorScheme="blue"
            _hover={{bg: "#0c6ff9"}}
            onClick={() => onWeb3Connect()}
          >Connect Wallet</Button>)
        }
      </Flex>
    </>
  )
}

export default Nav;

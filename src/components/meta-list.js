import React, { useContext, useState, useEffect, useRef } from 'react';
import { TextileContext, WalletAddressContext, WalletProviderContext } from '../context';
import {
  Drawer,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Link,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  Container,
  Spinner,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useToast,
  useClipboard,
  Tag,
  WrapItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  Box, Center, CircularProgress, Image, Tooltip
} from '@chakra-ui/react';
import {
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
} from '@chakra-ui/icons';
import MetaForm from './meta-form';
import { format } from 'date-fns';
import useTextile from '../hooks/use-textile';
import { Where } from '@textile/hub';
import { NFTStorage } from 'nft.storage';
import { ethers } from 'ethers';

const cursor = {
  cursor: 'pointer'
};

const nftStorageClient = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })

const metaManagerAbi = [
  'function mint(string memory _cid)'
]

const MetaList = () => {
  const [isLoading, setLoading] = useState(false);
  const [isDeleting, seDeleting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [isDataLoading, setDataLoading] = useState(false);
  const [metaList, setMetaList] = useState([]);
  const [selectedMetaId, setSelectedMetaId] = useState('');
  const [metadata, setMetadata] = useState();
  const [closer, setCloser] = useState(undefined);
  const [mintName, setMintName] = useState('')
  const [nftCid, setNftCid] = useState(undefined)
  const [transactionHash, setTransactionHash] = useState(undefined);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure();

  const cancelRef = useRef();

  const { walletAddress, signer } = useContext(WalletAddressContext);
  const { web3 } = useContext(WalletProviderContext);

  const { identity, buckets, threadDBClient, bucketKey, threadID } = useTextile()

  const toast = useToast();

  useEffect(() => {
    setLoading(true)
  }, [])

  useEffect(() => {
    if (threadDBClient && threadID) {
      loadData()

      if (!closer) {
        setupListener()
      }
    }
  }, [threadDBClient, buckets])

  const loadData = async () => {
    const query = new Where('_id')
    const metadata = await threadDBClient.find(threadID, 'nama', query)
    setMetaList(metadata)
    setLoading(false)
  }

  const setupListener = () => {
    const callback = (update) => {
      if (!update || !update.instance) return
      console.log('New update:', update.instance.name, update)
      loadData()
    }
    const closer = threadDBClient.listen(threadID, [], callback)
    setCloser(closer)
  }

  const deleteMetadata = async () => {
    if (selectedMetaId) {
      seDeleting(true)
      await threadDBClient.delete(threadID, 'nama', [selectedMetaId])
      onMetaAlertClose();
      toast({
        title: `Metadata deleted`,
        description: `We've deleted the metadata for you.`,
        status: 'success',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
      })
      await loadData()
      seDeleting(false)
    }
  }

  const removeMeta = (id) => {
    setSelectedMetaId(id);
    onAlertOpen();
  }

  const onMetaAlertClose = () => {
    setSelectedMetaId('');
    onAlertClose();
  }

  const onEditMetadata = (meta) => {
    setMetadata(meta);
    onOpen();
  }

  const onDrawerClose = () => {
    loadData()
    onClose();
  }

  const onMinting = async (meta) => {
    setIsMinted(false)
    setNftCid(undefined)
    setTransactionHash(undefined)
    setDataLoading(true)
    setMintName(meta.name);
    onMintOpen();

    const ret = await threadDBClient.findByID(threadID, 'nama', meta._id)
    setDataLoading(false)
    if (ret.mintedHash && ret.txHash) {
      setNftCid(ret.mintedHash)
      setTransactionHash(ret.txHash)
      setIsMinted(true)
      return
    }

    const { _id, name, description, tags, animation_hash, animation_path, image_hash, image_path } = ret
    const mintableData = {
      name,
      description,
      tags,
      animationHash: animation_hash && `ipfs://${animation_hash}`,
      animationPath: animation_path && `${animation_path}`,
      imageHash: image_hash && `ipfs://${image_hash}`,
      imagePath: image_path && `${image_path}`,
      image: new Blob([`ipfs://${image_hash}`], { type: 'image/*' }),
      createdBy: walletAddress,
      createdYear: new Date().getFullYear(),
      did: _id,
    }
    const metadata = await nftStorageClient.store(mintableData)
    const cid = metadata.url
    // console.log('IPFS URL for the metadata:', metadata.url)
    // console.log('metadata.json contents:\n', metadata.data)
    // console.log('metadata.json with IPFS gateway URLs:\n', metadata.embed())
    setNftCid(cid);

    const metaManagerContract = new ethers.Contract('0x36d588F3Aa4A28C7130046720F810f858d7e1D92', metaManagerAbi, web3);
    const metaWithSigner = metaManagerContract.connect(signer);
    const options = { gasPrice: 10000000000 };
    const tx = await metaWithSigner.mint(cid, options);

    await threadDBClient.save(threadID, 'nama', [{...ret, mintedHash: cid, txHash: tx.hash}])

    setTransactionHash(tx.hash)
    setIsMinted(true)

    toast({
      title: `NFT was minted to Meta Manger.`,
      description: `Yay! the NFT of ${name} is minted for you.`,
      status: 'success',
      variant: 'left-accent',
      position: 'top-right',
      isClosable: true,
    });
  }

  const getFormattedHash = (hash) => {
    if (hash) {
      return `${hash.substr(0, 8)}...${hash.substr(-4)}`
    }
    return ''
  }

  const metaTable = () => {
    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>NFT DID</Th>
            <Th>Image Hash</Th>
            <Th>Version</Th>
            <Th>Created At</Th>
            <Th>Tags</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {
            metaList.map((meta) => (
              <Tr key={meta._id}>
                <Td>{meta.name}</Td>
                <Td>{meta._id}</Td>
                <Td>
                  <Link href={`https://ipfs.io/ipfs/${meta.image_hash}`} isExternal title={meta.image_hash}>
                    {getFormattedHash(meta.image_hash)} {meta.image_hash ? <ExternalLinkIcon mx={1}/> : ''}
                  </Link>
                </Td>
                <Td>{meta.version ? meta.version : 0}</Td>
                <Td>{meta.timestamp && format(new Date(meta.timestamp), 'yyyy-MM-dd HH:mm:ss')}</Td>
                <Td>
                  {
                    meta.tags.map(tag => (
                      <Tag size={'sm'} key={tag} variant="solid" ml={'0.2rem'} colorScheme="teal">
                        {tag}
                      </Tag>
                    ))
                  }
                </Td>
                <Td>
                  <Box>
                    <Tooltip hasArrow gutter={15} label="modify" bg="gray.300" color="black">
                      <EditIcon style={cursor} onClick={() => onEditMetadata(meta)} />
                    </Tooltip>
                    <Tooltip hasArrow gutter={15} label="delete" bg="gray.300" color="black">
                      <DeleteIcon ml={'1rem'} style={cursor} onClick={() => removeMeta(meta._id)}/>
                    </Tooltip>
                    <Tooltip hasArrow gutter={15} label="mint" bg="gray.300" color="black">
                      <Image
                        ml={'1rem'}
                        width={'1.3rem'}
                        objectFit="cover"
                        src="/mint.png"
                        alt="mint"
                        style={{cursor: 'pointer', display: 'inline'}}
                        onClick={() => onMinting(meta)}
                      />
                    </Tooltip>
                  </Box>
                </Td>
              </Tr>
            ))
          }
        </Tbody>
      </Table>
    )
  }

  return (
    <>
      {
        isLoading ? (
          <Center h={'100vh'}>
            <CircularProgress isIndeterminate color="green.300"/>
          </Center>
        ) : (
          <>
            <Flex justify="flex-end">
              {
                walletAddress ?
                  (
                    <Box m={4}>
                      <Menu>
                        <MenuButton as={Button} onClick={() => onOpen()} colorScheme="teal">
                          Add a New Metadata
                        </MenuButton>
                        {/*<MenuList>*/}
                        {/*  <MenuItem onClick={() => onOpen()}>Collection</MenuItem>*/}
                        {/*  <MenuItem onClick={() => onOpen()}>NFT</MenuItem>*/}
                        {/*</MenuList>*/}
                      </Menu>
                    </Box>
                  )
                  : ''
              }
            </Flex>

            {!walletAddress ? '' : metaTable()}
          </>
        )
      }

      <TextileContext.Provider value={{identity, buckets, bucketKey, threadID, threadDBClient}}>
        <Drawer onClose={onDrawerClose} isOpen={isOpen} size={'full'} closeOnOverlayClick={false} closeOnEsc={false}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Add New NFT Metadata</DrawerHeader>

            <MetaForm onClose={onDrawerClose} data={metadata} />

          </DrawerContent>
        </Drawer>
      </TextileContext.Provider>

      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onMetaAlertClose}
        isOpen={isAlertOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader fontSize={'lg'} fontWeight="bold">Delete Metadata?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this metadata? You cannot undo this action afterwards.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} disabled={isDeleting} onClick={() => onMetaAlertClose()}>
              No
            </Button>
            <Button colorScheme="red" ml={3} isLoading={isDeleting} loadingText="Deleting" onClick={deleteMetadata}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={() => {}}
        isOpen={isMintOpen}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        isCentered
        size={'xl'}
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>NFT Minting - {mintName}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Box d="flex" alignItems="center" justifyContent={'center'}>
              {
                !isMinted ? (
                  <>
                    <WrapItem>
                      <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="green.300"
                        size="xl"
                      />
                    </WrapItem>
                    <Box ml="2">
                      {
                        isDataLoading ? 'Loading data' :
                          !nftCid ? `Saving your ${mintName}'s metadata to Filecoin network via the nft.storage's API to make it persistent.`
                            : 'Minting NFT for you'
                      }
                    </Box>
                  </>
                ) : <CheckIcon w={8} h={8} color={'green.500'} />
              }
            </Box>

            <Center ml="2" mt={5}>
              {
                nftCid ? (
                  <Link d="flex" alignItems="center" href={`https://ipfs.io/ipfs/${nftCid.replace('ipfs:/', '')}`} isExternal title={nftCid}>
                    Metadata CID <ExternalLinkIcon ml={2} />
                  </Link>
                ) : ''
              }
            </Center>

            <Center ml="2" mt={5}>
              {
                transactionHash ? (
                  <Link d="flex" alignItems="center" href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} isExternal title={transactionHash}>
                    Transaction Hash <ExternalLinkIcon ml={2} />
                  </Link>
                ) : ''
              }
            </Center>

            <Center mt={5}>
              <Box
                color="gray.500"
                fontWeight="extrabold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
              >
                Please do not close this window until the minting job is done.
              </Box>
            </Center>
          </AlertDialogBody>
          <AlertDialogFooter d="flex" alignItems="center" justifyContent={'center'}>
            <Button colorScheme="teal" ref={cancelRef} onClick={onMintClose} isDisabled={!isMinted}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MetaList;

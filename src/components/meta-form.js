import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Box,
  Input,
  Container,
  HStack,
  FormControl,
  FormLabel,
  Center,
  SimpleGrid,
  InputGroup,
  InputLeftAddon,
  Textarea,
  Select,
  DrawerBody,
  DrawerFooter,
  Flex,
  InputRightAddon,
  Spinner,
  Image,
  useToast, CircularProgress
} from '@chakra-ui/react';
import { customAlphabet } from 'nanoid';
import NftResolver from 'nft-did-resolver';
import { Resolver } from 'did-resolver';
import Ceramic from '@ceramicnetwork/http-client';
import { TextileContext, TextileProviderContext, WalletAddressContext, WalletProviderContext } from '../context';
import IpfsUploader from './ipfs-uploader';
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids';
import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect';
import { Where } from '@textile/hub';
import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';
const Ed25519Provider = require('key-did-provider-ed25519');


// createdBy, yearCreated, media{uri, dimensions, size, memeType}, tags

const config = {
  // ceramic,
  // subGraphUrls: { // optional, there are defaults for ethereum mainnet (erc721 and erc1155)
  //   // CAIP2 ChainID (below is ETH mainnet)
  //   'eip155:1': {
  //     // Asset namespace
  //     erc721: 'https://api.thegraph.com/subgraphs/name/xxx/yyy',
  //     // erc721: 'http://localhost:8000/subgraphs/name/aoeu/qjkx' // also works!
  //     erc1155: 'https://api.thegraph.com/subgraphs/name/abc/xyz'
  //   },
  //   // Fake cosmos example
  //   'cosmos:nft-token-chainid': {
  //     erc721: 'https://api.thegraph.com/subgraphs/name/aaa/ooo'
  //   }
  // }
}
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 28)

const MetaForm = ({ onClose, data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [tags, setTags] = useState([])

  const { register, handleSubmit, setValue } = useForm();

  const { walletAddress } = useContext(WalletAddressContext);
  const { web3 } = useContext(WalletProviderContext);

  const { buckets, threadDBClient, bucketKey, threadID } = useContext(TextileContext)

  const toast = useToast();

  useEffect(() => {
    // ceramicConnection()
    setIsLoading(true);
  }, [])


  useEffect(() => {
    if (threadID && threadDBClient && bucketKey) {
      if (data && data._id) {
        retrieveHashData(data._id)
      } else {
        setIsLoading(false);
      }
    }
  }, [buckets, threadDBClient])

  const callAbc = async () => {
    console.log(bucketKey, buckets, threadID)
    await threadDBClient.deleteCollection(threadID, 'nama')

    // await buckets.removePath(bucketKey, 'pregnancy-week-10-fingernails_square.png.pagespeed.ce.6Z8OiD1KDm.png')
    const links = await buckets.links(bucketKey)
    console.log('links:', links)
    const buzz = {
      namea: 'Buzzaa',
      missions: 22,
      _id: '',
    }
    // await threadDBClient.newCollectionFromObject(threadID, buzz)
    try {
      const info = await threadDBClient.getCollectionInfo(threadID, 'collectionaaa')
      console.log('info:', info)
    } catch (e) {
      console.log(e.code)
    }
    // Store the buzz object in the new collection
    // await threadDBClient.create(threadID, 'collection', [buzz])

    const coll = await threadDBClient.listCollections(threadID)
    console.log('coll:', coll.filter(c => c.name === 'collection'))

    const query = new Where('')
    const astronaut = await threadDBClient.find(threadID, 'collection', query)
    console.log('astronaut', astronaut)
  }

  const ceramicConnection = async () => {
    const ceramic = new Ceramic() // connects to localhost:7007 by default

    const addresses = await window.ethereum.enable()
    console.log('addresses:', addresses)
    console.log('rpcUrl:', web3.jsonrpc)
    const threeIdConnect = new ThreeIdConnect();
    console.log('===>', window.ethereum)
    const authProvider = new EthereumAuthProvider(web3, walletAddress)
    await threeIdConnect.connect(authProvider)
    const provider = await threeIdConnect.getDidProvider()

    const resolver = new Resolver({ ...ThreeIdResolver.getResolver(ceramic) });
    const did = new DID({ provider, resolver })

    await did.authenticate()
    await ceramic.setDID(did)

    ceramic.did.setProvider(provider)


    // await did.authenticate();
    // console.log('did:', did.id)
    // getResolver will return an object with a key/value pair of { 'nft': resolver }
    // where resolver is a function used by the generic did resolver.
    // const nftResolver = NftResolver.getResolver(config)
    // const didResolver = new Resolver(nftResolver)
    //
    // const erc721result = await didResolver.resolve('did:nft:eip155.1_erc721.0x06012c8cf97BEaD5deAe237070F9587f8E7A266d_771769')
    // const erc1155result = await didResolver.resolve('did:nft:eip155.1_erc1155.0x06eb48572a2ef9a3b230d69ca731330793b65bdc_1')
    // console.log(erc721result, erc1155result)
  }

  const removeBlankValues = obj => {
    if (Array.isArray(obj)) {
      return obj
        .map(v => (v && typeof v === 'object') ? removeBlankValues(v) : v)
        .filter(v => v);
    } else {
      return Object.entries(obj)
        .map(([k, v]) => [k, v && typeof v === 'object' ? removeBlankValues(v) : v])
        .reduce((a, [k, v]) => (v ? (a[k]=v, a) : a), {});
    }
  }

  const onSubmit = async metaValue => {
    setIsSaving(true);
    const metaData = removeBlankValues({...metaValue});

    // const links = await buckets.links(bucketKey)
    // console.log('links:', links)

    const formData = {
      ...metaData,
      _id: data && data._id ? data._id : `did:nft:${nanoid()}`,
      version: data && data._id ? data.version + 1 : 1,
      tags,
      timestamp: Date.now()
    }

    const collName = 'nama'
    if (data && data._id) {
      await threadDBClient.save(threadID, collName, [formData])
    } else {
      const collections = await threadDBClient.listCollections(threadID)
      const coll = collections.find(c => c.name === collName)
      if (!coll) {
        await threadDBClient.newCollection(threadID, { name: collName })
      }

      // Store the buzz object in the new collection
      await threadDBClient.create(threadID, collName, [formData])
    }

    toast({
      title: `Metadata ${data && data._id ? 'updated.' : 'created.'}`,
      description: `We've ${data && data._id ? 'updated' : 'created'} the metadata for you.`,
      status: 'success',
      variant: 'left-accent',
      position: 'top-right',
      isClosable: true,
    });

    setIsSaving(false)
    onClose();
  };

  const retrieveHashData = async (id) => {
    const ret = await threadDBClient.findByID(threadID, 'nama', id)
    const meta = {...data, ...ret};
    console.log(meta.tags, 'modify id:', id)
    setValue('name', meta.name, { shouldValidate: true });
    setValue('image_hash', meta.image_hash, { shouldValidate: true });
    setValue('image_path', meta.image_path, { shouldValidate: true });
    setValue('animation_hash', meta.animation_hash, { shouldValidate: true });
    setValue('animation_path', meta.animation_path, { shouldValidate: true });
    setValue('description', meta.description, { shouldValidate: true });
    setTags(meta.tags)
    setIsLoading(false);
  }

  const onUploaded = (pro, path, data) => {
    const hash = data && data.path && data.path.path
    const propPath = pro.replace('hash', 'path')
    const cid = hash.split('/')[2]
    setValue(`${pro}`, cid, { shouldValidate: true })
    setValue(propPath, path, { shouldValidate: true })
    setIsFileLoading(false)
  }

  const onLoading = () => {
    setIsFileLoading(true)
  }

  return (
    <>
      {
        isLoading ? (
          <Center h={'100vh'}>
            <CircularProgress isIndeterminate color="green.300" />
          </Center>
        ) : ''
      }
        <DrawerBody>
          <Container maxW={"6xl"}>
            <SimpleGrid columns={[2, null, 2]} marginY={5} spacing="40px">
              <Box>
                <FormControl as="fieldset" isRequired={true}>
                  <FormLabel as="legend">Name:</FormLabel>
                  <Input
                    placeholder="Name"
                    size="lg"
                    name={`name`}
                    {...register(`name`)}
                    autoComplete={'off'}
                    disabled={isLoading || isSaving}
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl as="fieldset" isRequired={true}>
                  <FormLabel as="legend">Tags:</FormLabel>
                  <ReactTagInput
                    tags={tags}
                    onChange={(newTags) => setTags(newTags)}
                    readOnly={isSaving}
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl as="fieldset">
                  <FormLabel as="legend">Image Hash:</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon children="ipfs://"/>
                    <Input
                      placeholder="Image Hash"
                      size="lg"
                      name={`image_hash`}
                      {...register(`image_hash`)}
                      autoComplete={'off'}
                      isReadOnly={true}
                    />
                    <InputRightAddon>
                      <IpfsUploader
                        bucketKey={bucketKey}
                        buckets={buckets}
                        onUploaded={onUploaded}
                        onLoading={onLoading}
                        prop={'image_hash'}
                        isFileLoading={isFileLoading || isSaving}
                      />
                    </InputRightAddon>
                  </InputGroup>
                </FormControl>
              </Box>

              <Box>
                <FormControl as="fieldset">
                  <FormLabel as="legend">Animation Hash:</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon children="ipfs://"/>
                    <Input
                      placeholder="Animation Hash"
                      size="lg"
                      name={`animation_hash`}
                      {...register(`animation_hash`)}
                      autoComplete={'off'}
                      isReadOnly={true}
                    />
                    <InputRightAddon>
                      <IpfsUploader
                        bucketKey={bucketKey}
                        buckets={buckets}
                        onUploaded={onUploaded}
                        onLoading={onLoading}
                        isFileLoading={isFileLoading || isSaving}
                        prop={'animation_hash'}
                      />
                    </InputRightAddon>
                  </InputGroup>
                </FormControl>
              </Box>

            </SimpleGrid>

            <FormControl as="fieldset" mt={'3rem'}>
              <FormLabel as="legend">Description:</FormLabel>
              <Textarea
                placeholder="Description"
                size="lg"
                name={`description`}
                {...register(`description`)}
                autoComplete={'description_off'}
                isReadOnly={isSaving}
              />
            </FormControl>
          </Container>
        </DrawerBody>

      <Flex align="center" justify="center">
          <DrawerFooter textAlign={'center'}>
            <Button
              variant="outline"
              width={'15rem'}
              mr={'2rem'}
              onClick={onClose}
              disabled={(isLoading || isFileLoading || isSaving)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              width={'15rem'}
              size="md"
              isLoading={isSaving}
              disabled={(isLoading || isFileLoading || isSaving)}
              loadingText="Saving"
              spinnerPlacement="end"
              onClick={handleSubmit(onSubmit)}
            >
              Save
            </Button>
          </DrawerFooter>
        </Flex>
    </>
  )
}

export default MetaForm;

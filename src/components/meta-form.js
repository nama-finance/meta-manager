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
  useToast, CircularProgress
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import NftResolver from 'nft-did-resolver';
import { Resolver } from 'did-resolver';
import Ceramic from '@ceramicnetwork/http-client';
import { TextileProviderContext, WalletAddressContext, WalletProviderContext } from '../context';
import IpfsUploader from './ipfs-uploader';
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids';
import { ThreeIdConnect,  EthereumAuthProvider } from '@3id/connect';
import useTextile from '../hooks/use-textile';
import { ThreadID, Where } from '@textile/hub';
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

const MetaForm = ({ onClose, data }) => {
  const [indexes, setIndexes] = useState([]);
  const [counter, setCounter] = useState(0);
  const [imageUrl, setImageUrl] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  const { walletAddress } = useContext(WalletAddressContext);
  const { web3 } = useContext(WalletProviderContext);

  // const { identity, buckets } = useContext(TextileProviderContext);
  const { identity, buckets, threadDBClient, bucketKey, threadID } = useTextile()

  const toast = useToast();

  useEffect(() => {
    // ceramicConnection()
    setIsLoading(true);
  }, [])


  useEffect(() => {
    if (threadID && threadDBClient && bucketKey) {
      callAbc()
    }
  }, [threadID, threadDBClient, bucketKey])

  const callAbc = async () => {
    console.log(bucketKey, buckets, threadID)

    const links = await buckets.links(bucketKey)
    console.log('links:', links)
    const buzz = {
      name: 'Buzzaa',
      missions: 22,
      _id: '',
    }
    // await threadDBClient.newCollectionFromObject(threadID, buzz)

    // Store the buzz object in the new collection
    // await threadDBClient.create(threadID, 'collection', [buzz])

    const coll = await threadDBClient.listCollections(threadID)
    console.log('coll:', coll)

    const query = new Where('name')
    const astronaut = await threadDBClient.find(threadID, 'collection', query)
    console.log('astronaut', astronaut)
  }

  const ceramicConnection = async () => {
    const ceramic = new Ceramic() // connects to localhost:7007 by default

    const addresses = await window.ethereum.enable()
    console.log('addresses:', addresses)

    const threeIdConnect = new ThreeIdConnect();
    const authProvider = new EthereumAuthProvider(window.ethereum, walletAddress)
    await threeIdConnect.connect(authProvider)
    const provider = await threeIdConnect.getDidProvider()

    const resolver = { ...ThreeIdResolver.getResolver(ceramic) };
    const did = new DID({ provider, resolver })

    await ceramic.setDID(did)
    await ceramic.did.authenticate()

    // ceramic.did.setProvider(provider)


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

  const saveData = async () => {
    console.log('===>', identity) //'identity=>', Buffer.from(identity.pubKey, 'hex').toString('hex')

    // const links = await buckets.links(bucketKey)
    // console.log('links:', links)

    // Create a json model for the index
    const index = {
      author: identity.public.toString(),
      date: (new Date()).getTime(),
      paths: [],
    }
    // Store the index in the Bucket (or in the Thread later)
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(JSON.stringify(index, null, 2))
      const patha = `index.json`
      buckets.pushPath(bucketKey, patha, buf).then((raw) => {
        resolve(raw)
      })
    })
  }

  const onSubmit = async metaValue => {
    // setIsLoading(true);
    // const metaData = removeBlankValues({...metaValue, ...imageUrl});
    //
    // let controller = `did:ether:${walletAddress}`;
    // let history = [];
    // if (data && data._id) {
    // }
    //
    // let dataTobeSaved = {...data, ...metaData, controller, history, msg, timestamp: Date.now()};
    // delete dataTobeSaved.version;
    // delete dataTobeSaved.encrypted;
    // const { path } = await ipfs.add(JSON.stringify(dataTobeSaved));

    // const addr = `/ipfs/${path}`
    // ipfs.name.publish(addr).then(function (res) {
    //   console.log('res:', res)
    //   console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
    // })

      // await orbitdb.put({
      //   _id: id,
      //   name: metaData.name,
      //   version: version,
      //   ipfsHash: path,
      //   encrypted: encrypted,
      //   timestamp: Date.now(),
      // }); // , { pin: true }
      //
      // toast({
      //   title: `Metadata ${data && data._id ? 'updated.' : 'created.'}`,
      //   description: `We've ${data && data._id ? 'updated' : 'created'} the metadata for you.`,
      //   status: 'success',
      //   variant: 'left-accent',
      //   position: 'top-right',
      //   isClosable: true,
      // });
      //
      // onClose();
  };

  useEffect(()=> {
    if (data && data.ipfsHash) {
      retrieveHashData(data.ipfsHash)
    }
  }, [data])

  const retrieveHashData = async (cid) => {
    // for await (const file of ipfs.get(cid)) {
    //   if (!file.content) continue;
    //
    //   const content = []
    //
    //   for await (const chunk of file.content) {
    //     content.push(chunk)
    //   }
    //
    //   const retMeta = {...JSON.parse(content.toString('utf8')), ...data};
    //   setValue('name', retMeta.name, { shouldValidate: true });
    //   setValue('external_url', retMeta.external_url, { shouldValidate: true });
    //   setValue('background_color', retMeta.background_color, { shouldValidate: true });
    //   setValue('animation_url', retMeta.animation_url, { shouldValidate: true });
    //   setValue('youtube_url', retMeta.youtube_url, { shouldValidate: true });
    //   setValue('description', retMeta.description, { shouldValidate: true });
    //   return retMeta;
    // }
  }

  const addAttribute = () => {
    setIndexes(prevIndexes => [...prevIndexes, counter]);
    setCounter(prevCounter => prevCounter + 1);
  };

  const removeAttribute = index => () => {
    setIndexes(prevIndexes => [...prevIndexes.filter(item => item !== index)]);
    setCounter(prevCounter => prevCounter - 1);
  };

  const clearAttributes = () => {
    setIndexes([]);
    register.attributes = []
    register.attributes.length = 0
  };

  return (
    <>
      {
        isLoading ? (
          <Center h={'100vh'}>
            <CircularProgress isIndeterminate color="green.300"/>
          </Center>
        ) :
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
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl as="fieldset" isRequired={true}>
                  <FormLabel as="legend">External Link:</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon children="https://"/>
                    <Input
                      placeholder="External link"
                      size="lg"
                      name={`external_url`}
                      {...register(`external_url`)}
                      autoComplete={'off'}
                    />
                  </InputGroup>
                </FormControl>
              </Box>

              <Box>
                <FormControl as="fieldset">
                  <FormLabel as="legend">Animation URL:</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon children="https://"/>
                    <Input
                      placeholder="Animation URL"
                      size="lg"
                      name={`animation_url`}
                      {...register(`animation_url`)}
                      autoComplete={'off'}
                    />
                  </InputGroup>
                </FormControl>
              </Box>

              <Box>
                <FormControl as="fieldset">
                  <FormLabel as="legend">Youtube URL:</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftAddon children="https://"/>
                    <Input
                      placeholder="Youtube URL"
                      size="lg"
                      name={`youtube_url`}
                      {...register(`youtube_url`)}
                      autoComplete={'off'}
                    />
                  </InputGroup>
                </FormControl>
              </Box>

              <IpfsUploader bucketKey={bucketKey} buckets={buckets}/>

            </SimpleGrid>

            <FormControl as="fieldset">
              <FormLabel as="legend">Description:</FormLabel>
              <Textarea
                placeholder="Description"
                size="lg"
                name={`description`}
                {...register(`description`)}
                autoComplete={'description_off'}
              />
            </FormControl>
          </Container>
        </DrawerBody>
      }

      <Flex align="center" justify="center">
          <DrawerFooter textAlign={'center'}>
            <Button
              variant="outline"
              width={'15rem'}
              mr={'2rem'}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              width={'15rem'}
              size="md"
              isLoading={buckets && bucketKey && isLoading}
              disabled={isLoading}
              loadingText="Publishing"
              spinnerPlacement="end"
              onClick={handleSubmit(onSubmit)}
            >
              Publish
            </Button>
          </DrawerFooter>
        </Flex>
    </>
  )
}

export default MetaForm;

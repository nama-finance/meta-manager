import React, {useContext, useEffect, useState} from 'react';
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
  useToast
} from '@chakra-ui/react';
import IpfsUploader from './ipfs-uploader';
import {IpfsContext, OrbitdbContext, TorusContext} from '../context';
import { nanoid } from 'nanoid';


const MetaForm = ({ onClose, data }) => {
  const [indexes, setIndexes] = useState([]);
  const [counter, setCounter] = useState(0);
  const [imageUrl, setImageUrl] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  const { orbitdb } = useContext(OrbitdbContext);
  const { ipfs } = useContext(IpfsContext);

  const { walletAddress } = useContext(TorusContext);

  const toast = useToast();

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
    setIsLoading(true);
    const metaData = removeBlankValues({...metaValue, ...imageUrl});

    let controller = `did:ether:${walletAddress}`;
    let history = [];
    if (data && data._id) {
      const prevData = await retrieveHashData(data.ipfsHash);
      if (prevData.history) {
        history = history.concat(prevData.history);
        history.unshift(data.ipfsHash);
      }
    }

    const dataTobeSaved = JSON.stringify({...data, ...metaData, controller, history, timestamp: Date.now()})
    const { path } = await ipfs.add(dataTobeSaved);

    // const addr = `/ipfs/${path}`
    // ipfs.name.publish(addr).then(function (res) {
    //   console.log('res:', res)
    //   console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
    // })

    if (orbitdb) {
      let id = `did:nama:${nanoid()}`;
      let version = 0;
      if (data) {
        id = data._id ? data._id : id;
        version = !isNaN(Number(data.version)) ? data.version + 1 : version;
      }

      await orbitdb.put({ _id: id, name: metaData.name, version: version, ipfsHash: path, timestamp: Date.now() }); // , { pin: true }
      onClose();
      toast({
        title: `Metadata ${data._id ? 'updated.' : 'created.'}`,
        description: `We've ${data._id ? 'updated' : 'created'} the metadata for you.`,
        status: 'success',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
      })
    } else {
      console.error('orbitdb is not initialised!');
    }
  };

  useEffect(()=> {
    if (data && data.ipfsHash) {
      retrieveHashData(data.ipfsHash)
    }
  }, [data])

  const retrieveHashData = async (cid) => {
    for await (const file of ipfs.get(cid)) {
      if (!file.content) continue;

      const content = []

      for await (const chunk of file.content) {
        content.push(chunk)
      }

      const retMeta = {...JSON.parse(content.toString('utf8')), ...data};
      setValue('name', retMeta.name, { shouldValidate: true });
      setValue('external_url', retMeta.external_url, { shouldValidate: true });
      setValue('background_color', retMeta.background_color, { shouldValidate: true });
      setValue('animation_url', retMeta.animation_url, { shouldValidate: true });
      setValue('youtube_url', retMeta.youtube_url, { shouldValidate: true });
      setValue('description', retMeta.description, { shouldValidate: true });
      return retMeta;
    }
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

  const addImageURI = async (uri) => {
    setImageUrl({image: `ipfs://${uri}`})
  }

  return (
    <>
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
                  <InputLeftAddon children="https://" />
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
                <FormLabel as="legend">Background Color:</FormLabel>
                <InputGroup size="lg">
                  <InputLeftAddon children="#" />
                  <Input
                    placeholder="Background Color, e.g. #fffff"
                    size="lg"
                    name={`background_color`}
                    {...register(`background_color`)}
                    autoComplete={'off'}
                  />
                </InputGroup>
              </FormControl>
            </Box>

            <Box>
              <FormControl as="fieldset">
                <FormLabel as="legend">Animation URL:</FormLabel>
                <InputGroup size="lg">
                  <InputLeftAddon children="https://" />
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
                  <InputLeftAddon children="https://" />
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

            <IpfsUploader addImageURI={addImageURI}/>

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

          <Box bg={'gray.50'} p={5}>
            <SimpleGrid columns={[2, null, 3]} spacing="40px">
              {
                indexes.map(index => {
                  const fieldName = `attributes[${index}]`;
                  return (
                    <Box key={fieldName} maxW={'xl'} marginTop={2} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
                      <FormControl as="fieldset">
                        <FormLabel as="legend">Display Type:</FormLabel>
                        <Select
                          name={`${fieldName}.display_type`}
                          {...register(`${fieldName}.display_type`)}
                        >
                          <option value="string">String</option>
                          <option value="boost_number">Boost Number</option>
                          <option value="boost_percentage">Boost Percentage</option>
                          <option value="number">Number</option>
                        </Select>
                      </FormControl>

                      <FormControl as="fieldset" mt={2}>
                        <FormLabel as="legend">Trait Type:</FormLabel>
                        <Input
                          placeholder="Trait type"
                          size="lg"
                          autoComplete={`${fieldName}.trait_type`}
                          name={`${fieldName}.trait_type`}
                          {...register(`${fieldName}.trait_type`)}
                        />
                      </FormControl>

                      <FormControl as="fieldset" mt={2}>
                        <FormLabel as="legend">Value:</FormLabel>
                        <Input
                          placeholder="The trait value"
                          size="lg"
                          autoComplete={`${fieldName}.value`}
                          name={`${fieldName}.value`}
                          {...register(`${fieldName}.value`)}
                        />
                      </FormControl>

                      <Center>
                        <Button colorScheme="teal" variant="outline" marginTop={2} size="md" onClick={removeAttribute(index)}>
                          Remove
                        </Button>
                      </Center>
                    </Box>
                  );
                })}
            </SimpleGrid>

            <Center>
              <HStack marginTop={5} spacing="24px">
                <Button
                  colorScheme="teal"
                  size="md"
                  variant="outline"
                  onClick={addAttribute}
                  disabled={isLoading}
                >
                  Add Attribute
                </Button>

                <Button
                  colorScheme="teal"
                  size="md"
                  variant="outline"
                  onClick={clearAttributes}
                  disabled={isLoading}
                >
                  Clear Attributes
                </Button>
              </HStack>
            </Center>
          </Box>
        </Container>
      </DrawerBody>

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
              isLoading={isLoading}
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

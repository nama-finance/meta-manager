import React, { useContext, useState, useEffect, useRef } from 'react';
import {OrbitdbContext, TorusContext} from '../context';
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
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useToast,
  useClipboard,
} from '@chakra-ui/react';
import {
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import MetaForm from './meta-form';
import { format } from 'date-fns';

const cursor = {
  cursor: 'pointer'
};

const MetaList = () => {
  const { orbitdb } = useContext(OrbitdbContext);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();

  const [metaList, setMetaList] = useState([]);
  const [selectedMetaId, setSelectedMetaId] = useState('');
  const [metadata, setMetadata] = useState();

  const { walletAddress } = useContext(TorusContext);

  const toast = useToast();
  const [value, setValue] = useState('')
  const { hasCopied, onCopy } = useClipboard(value)

  useEffect(() => {
    loadData()
  }, [orbitdb])

  // useEffect(() => {
  //   if (hasCopied) {
  //     setValue('');
  //   }
  // }, [hasCopied])

  const loadData = async () => {
    if (orbitdb) {
      await orbitdb.load();
      dbQuery();

      orbitdb.events.on('write', () => {
        dbQuery();
      })
    }
  }

  const dbQuery = () => {
    const metadata = orbitdb.query((e) => true)
    setMetaList(metadata)
  }

  const deleteMetadata = async () => {
    if (selectedMetaId) {
      await orbitdb.del(selectedMetaId);
      onMetaAlertClose();
      toast({
        title: `Metadata deleted`,
        description: `We've deleted the metadata for you.`,
        status: 'success',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
      })
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
    setMetadata('')
    onClose();
  }

  const onCopyValue = (val) => {
    setValue(val);
    onCopy();
  }

  const metaTable = () => {
    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>NFT DID</Th>
            <Th>IPFS Hash</Th>
            <Th>Version</Th>
            <Th>Created At</Th>
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
                  <Link href={`https://ipfs.io/ipfs/${meta.ipfsHash}`} isExternal title={meta.ipfsHash}>
                    {`${meta.ipfsHash.substr(0, 8)}...${meta.ipfsHash.substr(-4)}`} <ExternalLinkIcon mx={1} />
                  </Link>
                  <CopyIcon ml={2} style={cursor} onClick={() => onCopyValue(meta.ipfsHash)} />
                </Td>
                <Td>{meta.version ? meta.version : 0}</Td>
                <Td>{meta.timestamp && format(new Date(meta.timestamp), 'yyyy-MM-dd HH:mm:ss')}</Td>
                <Td>
                  <EditIcon style={cursor} onClick={() => onEditMetadata(meta)} />
                  <DeleteIcon ml={'1rem'} style={cursor} onClick={() => removeMeta(meta._id)}/>
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
      <Flex justify="flex-end">
        {
          walletAddress ?
          <Button
            colorScheme="teal"
            onClick={() => onOpen()}
            m={4}
          >Add New Metadata</Button>
            : ''
        }
      </Flex>

      { !walletAddress ? '' : metaTable() }

      <Drawer onClose={onDrawerClose} isOpen={isOpen} size={'full'} closeOnOverlayClick={false} closeOnEsc={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add New NFT Metadata</DrawerHeader>

          <MetaForm onClose={onDrawerClose} data={metadata} />

        </DrawerContent>
      </Drawer>

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
            <Button ref={cancelRef} onClick={onMetaAlertClose}>
              No
            </Button>
            <Button colorScheme="red" ml={3} onClick={deleteMetadata}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MetaList;

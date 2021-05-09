import React, {useContext, useEffect, useState} from 'react';
import { useDropzone } from 'react-dropzone';
import { SimpleGrid } from '@chakra-ui/react';
import './ipfs-uploader.css';
import { IpfsContext } from '../context';
const Buffer = require('buffer').Buffer;

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16,
  marginLeft: 5,
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

export default function IpfsUploader({addImageURI}) {
  const { ipfs } = useContext(IpfsContext)

  const [files, setFiles] = useState([]);

  useEffect(() => {
    files.forEach(file => {
      let reader = new FileReader()
      reader.onloadend = async () => await saveToIpfs(ipfs, reader)
      reader.readAsArrayBuffer(file)
    })
  }, [files])

  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      }));
    }
  });

  const saveToIpfs = async (ipfs, reader) => {
    const buffer = Buffer.from(reader.result)
    const { path } = await ipfs.add(buffer)
    // await ipfs.name.publish(`/ipfs/${path}`)
    await addImageURI(path)
  }

  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
         alt={'preview'}/>
      </div>
    </div>
  ));

  useEffect(() => () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const Title = ({ children }) => {
    return (
      <h2 className='f5 ma0 pb2 tracked aqua fw4 montserrat'>{children}</h2>
    )
  }

  // eslint-disable-next-line
  const IpfsId = (props) => {
    if (!props) return null
    return (
      <section className='bg-snow mw7 center mt5'>
        <h1 className='f3 fw4 ma0 pv3 aqua montserrat tc' data-test='title'>Connected to IPFS</h1>
        <div className='pa4'>
          {['id', 'agentVersion'].map((key) => (
            <div className='mb4' key={key}>
              <Title>{key}</Title>
              <div className='bg-white pa2 br2 truncate monospace' data-test={key}>{props[key]}</div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <SimpleGrid columns={[2, null, 2]}>
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <p>
            Drag 'n' drop a file here
          </p>
          <p>
            or
          </p>
          <p>click to select a file</p>
        </div>
        <aside style={thumbsContainer}>
          {thumbs}
        </aside>
      </SimpleGrid>

      {/*{ipfsInitError && (*/}
      {/*  <div className='bg-yellow pa4 mw7 center mv4 white'>*/}
      {/*    Error: {ipfsInitError.message || ipfsInitError}*/}
      {/*  </div>*/}
      {/*)}*/}
      {/*{id && <IpfsId {...id} />}*/}
    </>
  );
}

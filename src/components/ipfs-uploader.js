import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { SimpleGrid } from '@chakra-ui/react';
import './ipfs-uploader.css';
import useTextile from '../hooks/use-textile';
import { TextileProviderContext } from '../context';


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

export default function IpfsUploader({bucketKey, buckets}) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    files.forEach(file => {
      saveFileToBuckets(file, file.name)
      URL.revokeObjectURL(file.preview)
    })
  }, [files])

  const saveFileToBuckets = (file, path) => {
    const reader = new FileReader()
    // reader.onabort = () => throw Error('file reading was aborted')
    // reader.onerror = () => throw Error('file reading has failed')
    reader.onloadend = async () => {
      const ret = await buckets.pushPath(bucketKey, path, reader.result)
      console.log('loaded:', ret)
    }
    reader.readAsArrayBuffer(file)
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      }));
    }
  });

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
    </>
  );
}

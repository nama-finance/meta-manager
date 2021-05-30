import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, SimpleGrid } from '@chakra-ui/react';
import './ipfs-uploader.css';


const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 2,
  marginLeft: 5,
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  width: 100,
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

export default function IpfsUploader({bucketKey, buckets, onLoading, onUploaded, prop, isFileLoading = false}) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    files.forEach(file => {
      saveFileToBuckets(file, file.name)
      URL.revokeObjectURL(file.preview)
    })
  }, [files])

  const saveFileToBuckets = (file, path) => {
    onLoading(true)
    const reader = new FileReader()
    // reader.onabort = () => throw Error('file reading was aborted')
    // reader.onerror = () => throw Error('file reading has failed')
    reader.onloadend = async () => {
      const ret = await buckets.pushPath(bucketKey, path, reader.result)
      console.log('loaded:', ret)
      onUploaded(prop, path, ret)
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
      <div {...getRootProps()}>
        <input {...getInputProps()} disabled={isFileLoading} />
        <Image
          width={'3rem'}
          objectFit="cover"
          src="/upload.svg"
          alt="upload svg"
          style={{cursor: isFileLoading ? 'not-allowed' : 'pointer'}}
        />
      </div>
    </>
  );
}

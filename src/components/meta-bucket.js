import React, { useEffect, useState } from 'react';
import {
  Center, CircularProgress,
} from '@chakra-ui/react'
import useTextile from '../hooks/use-textile';


const MetaBucket = () => {
  const [isLoading, setLoading] = useState(false);
  const [link, setLink] = useState();

  const { buckets, bucketKey, threadID } = useTextile()

  useEffect(() => {
    setLoading(true)
  }, [])

  useEffect(() => {
    if (threadID) {
      loadData()
    }
  }, [buckets])

  const loadData = async () => {
    const links = await buckets.links(bucketKey)
    setLink(links.url)
    setLoading(false)
  }

  return (
    isLoading ? (
        <Center h={'100vh'}>
          <CircularProgress isIndeterminate color="green.300"/>
        </Center>
      ) :
    <div dangerouslySetInnerHTML={{ __html: `<iframe style="width:100vw; height: 100vh; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;" src=${link} />`}} />
  )
}

export default MetaBucket;

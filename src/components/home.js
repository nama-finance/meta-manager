import { Box, SimpleGrid } from '@chakra-ui/react'

function Home() {
  return (
    <div className="App">
      <h2>Home</h2>
      <SimpleGrid columns={2} spacing={10}>
        <Box bg="tomato" height="80px"/>
        <Box bg="tomato" height="80px"/>
        <Box bg="tomato" height="80px"/>
        <Box bg="tomato" height="80px"/>
        <Box bg="tomato" height="80px"/>
      </SimpleGrid>
    </div>
  )
}

export default Home

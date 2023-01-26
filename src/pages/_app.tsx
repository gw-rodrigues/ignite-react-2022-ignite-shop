import type { AppProps } from 'next/app'
import Image from 'next/image'
import { Container, Header } from '../styles/pages/app'
import { globalStyles } from '../styles/global'
import LogoImg from '../assets/logo.svg'

globalStyles()
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Container>
      <Header>
        <Image src={LogoImg} alt="Ignite Shop Logo" />
      </Header>
      <Component {...pageProps} />
    </Container>
  )
}

import Image from 'next/image'
import { stripe } from '../lib/stripe'
import Stripe from 'stripe'
import { useKeenSlider } from 'keen-slider/react'
import { GetServerSideProps, GetStaticProps } from 'next'
import Link from 'next/link'

import { HomeContainer, Product } from '../styles/pages/home'
import 'keen-slider/keen-slider.min.css'
import Head from 'next/head'

export type ProductProps = {
  id: string
  name: string
  imageUrl: string
  price: string
}

interface HomeProps {
  products: ProductProps[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: { perView: 3, spacing: 48 },
  })

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products &&
          products.map((product) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              prefetch={false}
            >
              <Product className="keen-slider__slide">
                <Image src={product.imageUrl} alt="" width={520} height={480} />

                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          ))}
      </HomeContainer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
    limit: 4,
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price
    const priceAmount = price.unit_amount ? price.unit_amount / 100 : 0

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(priceAmount),
    }
  })

  return { props: { products }, revalidate: 60 * 60 * 2 }
}

// export const getServerSideProps: GetServerSideProps = async () => {
//   const response = await stripe.products.list({
//     expand: ['data.default_price'],
//     limit: 4,
//   })

//   const products = response.data.map((product) => {
//     const price = product.default_price as Stripe.Price

//     return {
//       id: product.id,
//       name: product.name,
//       imageUrl: product.images[0],
//       price: price.unit_amount ? price.unit_amount / 100 : 0,
//     }
//   })

//   return { props: { products } }
// }

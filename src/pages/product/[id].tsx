import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Stripe from 'stripe'
import { stripe } from '../../lib/stripe'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/src/styles/pages/product'
import { ProductProps } from '..'
import Image from 'next/image'
import { useState } from 'react'
import axios from 'axios'
import Head from 'next/head'

interface ProductDescriptionProps {
  product: {
    description: string
    defaultPriceId: string
  } & ProductProps
}

export default function Product({ product }: ProductDescriptionProps) {
  // - Fallback is true, you can show a loader to user
  // const { isFallback } = useRouter()

  // if (isFallback) {
  //   return <p>Loading...</p>
  // }

  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false)

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true)

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })
      const { checkoutUrl } = response.data

      //ROTAS EXTERNAS USAR
      window.location.href = checkoutUrl

      //PARA ROTAS INTERNAR
      //router.push("/checkoutUrl")
    } catch (error) {
      //Conectar com uma ferramenta de observabilidade (Datadog / Sentry)
      setIsCreatingCheckoutSession(false)
      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>
        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
          <p>{product.description}</p>
          <button
            disabled={isCreatingCheckoutSession}
            onClick={handleBuyProduct}
          >
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  //paths list relevant items, *shop
  //fallback: false, true and blocking
  return {
    paths: [{ params: { id: 'prod_NFm07sNj4Le8Zy' } }],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params?.id

  if (!productId) {
    return { props: { product: null } }
  }

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price
  const priceAmount = price.unit_amount ? price.unit_amount / 100 : 0

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(priceAmount),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1,
  }
}

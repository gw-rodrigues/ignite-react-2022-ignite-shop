import { useRouter } from 'next/router'

export default function Product() {
  const { query } = useRouter()
  return <div>{JSON.stringify(query)}</div>
}

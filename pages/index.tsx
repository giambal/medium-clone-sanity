import type { NextPage } from 'next'
import Head from 'next/head'
import Header from '../components/Header'
import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typings'

interface Props {
  posts: [Post]
}

export const getServerSideProps = async () => {
  const query = `*[_type=="post"]{
                    _id,
                    title,
                    author->{
                        name,
                        image
                    },
                    description,
                    mainImage,
                    slug,
                  }`

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    },
  }
}

export default function Home({ posts }: Props) {
  return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>medium blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <div className="flex items-center justify-between border-y border-black bg-yellow-400 py-10 lg:py-0">
        <div className="space-y-5 px-10">
          <h1 className="max-w-xl font-serif text-6xl">
            <span className="underline decoration-black decoration-4">
              Medium
            </span>{' '}
            is a place to write, read, and connect
          </h1>
          <h2>
            It's easy and free to post your thinking on any topic and connect
            with millions of readers.
          </h2>
        </div>
        <div>
          <img
            className="hidden h-32 md:inline-flex lg:h-full"
            src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"
            alt=""
          />
        </div>
      </div>
    </div>
  )
}

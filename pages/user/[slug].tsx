import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { GetStaticProps } from 'next'
import { Author } from '../../typings'
import PortableText from 'react-portable-text'

interface Props {
  author: [Author]
}

function User({ author }: Props) {
  const user = author[0]
  return (
    <main>
      <Header />
      <img
        className="h-40 w-full object-cover"
        src={urlFor(user.image).url()!}
        alt=""
      />
      <article className="mx-auto max-w-3xl p-5">
        <h1 className="text-3xl font-bold">{user.name}</h1>

        <PortableText
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={user.bio}
        />
      </article>
    </main>
  )
}

export default User

export const getStaticPaths = async () => {
  const query = `*[_type == "author"]{
      _id,
      slug
    }`

  const authors = await sanityClient.fetch(query)
  const paths = authors.map((author: Author) => ({
    params: {
      slug: author?.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "author" && slug.current == $slug]{
    _id,
    slug,
    name,
    image,
    bio
  }`

  const author = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  // if post not found return not found,
  // and with getStaticPaths fallback blocking it will return 404
  if (!author) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      author,
    },
  }
}

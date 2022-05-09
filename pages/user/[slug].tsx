import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { GetStaticProps } from 'next'
import { Author } from '../../typings'
import PortableText from 'react-portable-text'
import Link from 'next/link'

interface Props {
  author: [Author]
}

function User({ author }: Props) {
  const user = author[0]
  console.log(user)
  return (
    <main>
      <Header />
      <div className="mx-auto flex max-w-7xl items-center justify-start p-5">
        <img
          className="h-40 rounded-full object-cover"
          src={urlFor(user.image).url()!}
          alt=""
        />
        <div className="ml-5 p-5">
          <h1 className="text-3xl font-bold">{user.name}</h1>

          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={user.bio}
          />
        </div>
      </div>

      <hr className="my-5 mx-auto max-w-3xl border border-yellow-500" />

      {/* posts */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 p-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:p-6">
        {user.posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="group cursor-pointer rounded-lg border">
              <div className="overflow-hidden">
                <img
                  className="h-60 w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
                  src={urlFor(post.mainImage).url()!}
                  alt=""
                />
              </div>
              <div className="flex items-center justify-between bg-white p-5">
                <div>
                  <p className="text-lg font-bold">{post.title}</p>
                  <p className="text-xs font-light">
                    {post.description} by {post.author.name}
                  </p>
                </div>
                <img
                  className="h-12 w-12 rounded-full"
                  src={urlFor(user.image).url()!}
                  alt=""
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
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
    bio,
    'posts': *[
      _type == "post" &&
      author._ref == ^._id
    ],
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

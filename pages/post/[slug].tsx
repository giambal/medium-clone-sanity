import { sanityClient, urlFor } from '../../sanity'
import Header from '../../components/Header'
import { Post } from '../../typings'
import { GetStaticProps } from 'next'
import PortableText from 'react-portable-text'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'

interface Props {
  post: [Post]
}

interface FormInput {
  _id: string
  name: string
  email: string
  comment: string
}

function Post({ post }: Props) {
  const [submitted, setSubmitted] = useState(false)

  const currentPost = post[0]
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>()

  const onSubmitHandler: SubmitHandler<FormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
      })
      .catch((err) => {
        setSubmitted(false)
      })
  }

  return (
    <main>
      <Header />
      <img
        className="h-40 w-full object-cover"
        src={urlFor(currentPost.mainImage).url()!}
        alt=""
      />
      <article className="mx-auto max-w-3xl p-5">
        <h1 className="text-3xl font-bold">{currentPost.title}</h1>
        <h2 className="text-md mb-5 text-gray-500">
          {currentPost.description}
        </h2>
        <div className="flex items-center">
          <img
            className="mr-4 h-10 w-10 rounded-full"
            src={urlFor(currentPost.author.image).url()!}
            alt=""
          />
          <p className="text-xs text-gray-400">
            Blog post by:{' '}
            <span className="text-green-500 hover:underline">
              <Link href={`/user/${currentPost.author.slug.current}`}>
                {currentPost.author.name}
              </Link>
            </span>{' '}
            Published at {new Date(currentPost._createdAt).toLocaleString()}
          </p>
        </div>

        <PortableText
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={currentPost.body}
          serializers={{
            h1: (props: any) => (
              <h1 className="my-5 text-2xl font-bold" {...props}></h1>
            ),
            h2: (props: any) => (
              <h2 className="my-5 text-xl font-bold" {...props}></h2>
            ),
          }}
        />
      </article>

      <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />

      {submitted ? (
        <div className="my-10 mx-auto flex max-w-2xl flex-col items-center justify-center rounded-sm bg-green-500 py-10 text-white">
          <h3 className="text-lg font-bold">
            Thanks for submitting your comment
          </h3>
          <p className="text-md">
            Once approved, your comment will appear below
          </p>
        </div>
      ) : (
        <form
          className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <h3 className="text-md mb-2 text-yellow-500">
            Enjoyed this article?
          </h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>
          <hr className="mt-2 py-3" />

          <input
            {...register('_id')}
            type="hidden"
            name="_id"
            value={currentPost._id}
          />

          <label className="mb-5 block">
            <span className="text-grey-700 py-5">Name</span>
            <input
              {...register('name', { required: true })}
              className="block w-full rounded border border-gray-500 py-2 px-3 shadow focus:border focus:border-yellow-500 focus:outline-none"
              type="text"
              placeholder="Jonh Doe..."
            />
          </label>
          <label className="mb-5 block">
            <span className="text-grey-700 py-5">Email</span>
            <input
              {...register('email', { required: true })}
              className="block w-full rounded border border-gray-500 py-2 px-3 shadow focus:border focus:border-yellow-500 focus:outline-none"
              type="email"
              placeholder="Jonh Doe..."
            />
          </label>
          <label className="mb-5 block">
            <span className="text-grey-700 py-5">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="block w-full rounded border border-gray-500 py-2 px-3 shadow focus:border focus:border-yellow-500 focus:outline-none"
              rows={8}
            ></textarea>
          </label>

          {/* errors will return when field validation fails */}
          <div className="mb-3">
            {errors.name && (
              <span className="block text-red-500">
                ❗The Name Field is required
              </span>
            )}
            {errors.comment && (
              <span className=" block text-red-500">
                ❗The Comment Field is required
              </span>
            )}
            {errors.email && (
              <span className="block text-red-500">
                ❗The Email Field is required
              </span>
            )}
          </div>

          <input
            type="submit"
            value="Submit"
            className="hover:text-yellow w-full cursor-pointer rounded-sm border border-yellow-500 bg-yellow-500 py-1 text-center text-lg text-white transition duration-300 hover:bg-white hover:text-yellow-500"
          />
        </form>
      )}

      {/* comments */}
      <div className="mx-auto max-w-2xl p-5">
        <h3 className="text-3xl font-bold">Comments</h3>
        <hr className="mt-2 py-3" />
        {currentPost.comments.map((comment) => (
          <div
            key={comment._id}
            className="my-5 rounded-md border border-gray-200 p-5 shadow"
          >
            <h4 className="text-2xl font-semibold text-yellow-500">
              {comment.name}
            </h4>
            <p className="text-gray-500">{comment.comment}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug
  }`

  const posts = await sanityClient.fetch(query)
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug]{
      _id,
      _createdAt,
      slug,
      description,
      title,
      body,
      mainImage,
      author->{
        name,
        image,
        slug
      },
      'comments': *[
        _type == "comment" &&
        post._ref == ^._id &&
        approved == true
      ],
  }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  // if post not found return not found,
  // and with getStaticPaths fallback blocking it will return 404
  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
  }
}

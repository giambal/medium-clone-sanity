export interface Post {
  _id: string
  _createdAt: string
  title: string
  author: {
    name: string
    image: string
    slug: {
      current: string
    }
  }
  description: string
  mainImage: {
    asset: {
      url: string
    }
  }
  slug: {
    current: string
  }
  body: [object]
  comments: [Comment]
}

export interface Author {
  _id: string
  name: string
  slug: {
    current: string
  }
  image: string
  bio: [object]
}

export interface Comment {
  approved: boolean
  comment: string
  email: string
  name: string
  post: {
    ref: string
    _type: string
  }
  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string
}

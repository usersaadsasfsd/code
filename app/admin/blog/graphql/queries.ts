import { gql } from "@apollo/client"

export const GET_BLOG_POST = gql`
  query GetBlogPost($id: ID!) {
    getBlogPost(id: $id) {
      _id
      title
      slug
      excerpt
      content
      category
      author
      tags
      readTime
      cover_image
      banner_image
      meta_title
      meta_description
      meta_keywords
      og_title
      og_description
      og_image
      is_published
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost(
    $id: ID!
    $title: String!
    $slug: String
    $excerpt: String!
    $content: String!
    $category: String
    $author: String
    $tags: [String]
    $readTime: String
    $cover_image: String
    $banner_image: String
    $meta_title: String
    $meta_description: String
    $meta_keywords: String
    $og_title: String
    $og_description: String
    $og_image: String
    $is_published: Boolean
  ) {
    updateBlogPost(
      id: $id
      title: $title
      slug: $slug
      excerpt: $excerpt
      content: $content
      category: $category
      author: $author
      tags: $tags
      readTime: $readTime
      cover_image: $cover_image
      banner_image: $banner_image
      meta_title: $meta_title
      meta_description: $meta_description
      meta_keywords: $meta_keywords
      og_title: $og_title
      og_description: $og_description
      og_image: $og_image
      is_published: $is_published
    ) {
      _id
      title
      slug
      is_published
    }
  }
`

export const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id) {
      _id
    }
  }
`

export const GET_ALL_BLOG_POSTS = gql`
  query GetAllBlogPosts {
    getAllBlogPosts {
      _id
      title
      slug
      excerpt
      category
      author
      is_published
      createdAt
      updatedAt
    }
  }
`

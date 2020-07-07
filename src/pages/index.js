import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allBlog.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />
      {posts.map(({ node }) => {
        const title = node.title_en 
        return (
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
              </h3>
              <small>{node.date}</small>
            </header>
            <section>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.description_en || node.excerpt,
                }}
              />
            </section>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql(`
    query {
      allBlog {
        edges {
          node {
            title_en
            title_zh
            description_en
            description_zh
            detail_en
            detail_zh
            date
          }
        }
      }
    }
  `

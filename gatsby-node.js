const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const fetch = require("node-fetch")
const csv2json = require("csvtojson")

// new
const googleSheet = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQOQRLgLGVryieIwB7HKJbEATt_G9SfkbFX_H7mNC1x3i9D3ZhQpzfRBQTqfdt4954lgET6vpuxJrXd/pub?gid=0'
const isDebug = process.env.DEBUG_MODE === "true"
const LANGUAGES = ["zh", "en"]
const GOOGLE_SPREADSHEET_ID = "14kreo2vRo1XCUXqFLcMApVtYmvkEzWBDm6b8fzJNKEc"


const createPublishedGoogleSpreadsheetNode = async (
  { actions: { createNode }, createNodeId, createContentDigest },
  publishedURL,
  type,
  { skipFirstLine = false, alwaysEnabled = false, subtype = null }
) => {
  // All table has first row reserved
  const result = await fetch(
    `${publishedURL}&single=true&output=csv&headers=0${
      skipFirstLine ? "&range=A2:ZZ" : ""
    }`
  )
  const data = await result.text()
  const records = await csv2json().fromString(data)
  records
    .filter(
        
      r => alwaysEnabled || (isDebug && r.enabled === "N") || r.enabled === "Y"
    )
    .forEach((p, i) => {
      // create node for build time data example in the docs
      const meta = {
        // required fields
        id: createNodeId(
          `${type.toLowerCase()}${subtype ? `-${subtype}` : ""}-${i}`
        ),
        parent: null,
        children: [],
        internal: {
          type,
          contentDigest: createContentDigest(p),
        },
      }
      const node = Object.assign({}, { ...p, subtype }, meta)
      createNode(node)
    })
}

exports.sourceNodes = async props => {
  await Promise.all([
    createPublishedGoogleSpreadsheetNode(
      props,
      googleSheet,
      "Blog",
      { skipFirstLine: true }
    ),
    ])
}

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions
  return new Promise(resolve => {
    // If it is already eng path we skip to re-generate the locale
    if (!page.path.match(/^\/en/)) {
      deletePage(page)
      LANGUAGES.forEach(lang => {
        createPage({
          ...page,
          path: getPath(lang, page.path),
          context: {
            ...page.context,
            locale: lang,
          },
        })
      })
    }

    resolve()
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
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
  `)

  if (result.errors) {
    throw result.errors
  }

  exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
    }
  return Promise.resolve(null)
}





/* old
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
*/
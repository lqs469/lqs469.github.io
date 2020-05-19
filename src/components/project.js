import React from "react"
import { StaticQuery, Link, graphql } from "gatsby"
import { rhythm } from "../utils/typography"

function Project() {
  return (
    <StaticQuery
      query={projectQuery}
      render={data => {
        const projects = data.allMarkdownRemark.edges
        const TitleStyle = {
          fontWeight: "bold",
          boxShadow: `none`,
        }

        return (
          <div style={{}}>
            {projects.map(({ node }) => {
              const title = node.frontmatter.title || node.fields.slug

              return (
                <div
                  key={node.fields.slug}
                  style={{
                    marginBottom: rhythm(1),
                  }}
                >
                  <span>
                    {node.frontmatter.link ? (
                      <a
                        style={TitleStyle}
                        href={node.frontmatter.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {title}
                      </a>
                    ) : (
                      <Link style={TitleStyle} to={node.fields.slug}>
                        {title}
                      </Link>
                    )}
                  </span>
                  <br />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description,
                    }}
                  />
                </div>
              )
            })}
          </div>
        )
      }}
    />
  )
}

const projectQuery = graphql`
  query projectQuery {
    allMarkdownRemark(
      sort: { order: ASC, fields: [frontmatter___index] }
      filter: { frontmatter: { categories: { regex: "/stuff/" } } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 100)
          fields {
            slug
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            categories
            description
            link
            index
          }
        }
      }
    }
  }
`

export default Project

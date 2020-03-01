/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import { StaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(2.5),
            }}
          >
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              style={{
                marginRight: rhythm(1 / 2),
                marginBottom: 0,
                minWidth: 50,
                borderRadius: `100%`,
              }}
              imgStyle={{
                borderRadius: `50%`,
              }}
            />
            <p>
              {author}
              <br />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://twitter.com/${social.twitter}`}
              >
                Twitter
              </a>
              {" • "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/${social.github}`}
              >
                Github
              </a>
              {" • "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://instagram.com/${social.ins}`}
              >
                Ins
              </a>
              {" • "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://weibo.com/${social.weibo}`}
              >
                Weibo
              </a>
              {" • "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.zhihu.com/people/${social.zhihu}`}
              >
                Zhihu
              </a>
            </p>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/portrait-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 50, height: 50) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
          twitter
          github
          weibo
          ins
          zhihu
        }
      }
    }
  }
`

export default Bio

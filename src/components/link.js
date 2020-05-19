import React from "react"
import { StaticQuery, graphql } from "gatsby"
import { rhythm } from "../utils/typography"

function Link({ noMargin }) {
  return (
    <StaticQuery
      query={linkQuery}
      render={data => {
        const { social } = data.site.siteMetadata
        return (
          <div
            style={{
              display: `flex`,
              marginTop: noMargin ? 0 : rhythm(3),
              marginBottom: noMargin ? 0 : rhythm(2),
            }}
          >
            <p>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://twitter.com/${social.twitter}`}
              >
                Twitter
              </a>
              {"  "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/${social.github}`}
              >
                Github
              </a>
              {"  "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://instagram.com/${social.ins}`}
              >
                Ins
              </a>
              {"  "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://weibo.com/${social.weibo}`}
              >
                Weibo
              </a>
              {"  "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.zhihu.com/people/${social.zhihu}`}
              >
                Zhihu
              </a>{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.linkedin.com/in/liqinshuo"
              >
                Linkedin
              </a>{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="mailto:liqinshuo469@gmail.com"
              >
                Contact
              </a>
            </p>
          </div>
        )
      }}
    />
  )
}

const linkQuery = graphql`
  query LinkQuery {
    site {
      siteMetadata {
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

export default Link

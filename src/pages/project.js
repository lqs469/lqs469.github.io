import React from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Project from "../components/project"
import { rhythm } from "../utils/typography"

export default props => {
  const { data } = props
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title="About me" keywords={[`lqs469`, `blog`, `all project`]} />

      <h2>Projects</h2>
      <div style={{ marginBottom: rhythm(4) }}>
        <Project />
      </div>

      <Bio />
    </Layout>
  )
}

export const projectQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

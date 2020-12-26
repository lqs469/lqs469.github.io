import React from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import LINK from "../components/link"

export default props => (
  <Layout location={props.location} title={"lqs469"}>
    <SEO title="About me" keywords={[`lqs469`, `blog`, `about me`]} />
    <Bio />
    <p>Hi! I'm Allen Lee(Lqs469).</p>
    <p>
      Software Engineer, currently working at Microsoft on developing web and mobile apps on Edge and Bing.
    </p>
    <LINK noMargin />
  </Layout>
)

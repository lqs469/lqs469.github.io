import React from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

export default props => (
  <Layout location={props.location} title={"lqs469"}>
    <SEO title="About me" keywords={[`lqs469`, `blog`, `about me`]} />
    <Bio />
    <p>勤硕(Allen)</p>
    <a href="https://www.linkedin.com/in/liqinshuo">Linkedin</a>
    <p>liqinshuo469@gmail.com</p>
  </Layout>
)

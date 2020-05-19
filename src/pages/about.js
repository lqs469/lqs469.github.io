import React from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import LINK from "../components/link"

export default props => (
  <Layout location={props.location} title={"lqs469"}>
    <SEO title="About me" keywords={[`lqs469`, `blog`, `about me`]} />
    <Bio />
    <p>Hello, there</p>
    <p>
      I'm Allen (AKA. Lqs469). Now I am working as a Frontend Engineer in the
      Alibaba Amap team, Focusing on frontend tech and Node.js. I have a good
      knowledge of full-stack development and have experience of development in
      both mobile and PC. in addition to this, I've also developed with WebGL,
      3D Map, Data visualization and Socket, etc
    </p>
    <LINK noMargin />
  </Layout>
)

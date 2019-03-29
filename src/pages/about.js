import React from "react"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

export default props => (
  <Layout location={props.location} title={"lqs469"}>
    <SEO title="About me" keywords={[`lqs469`, `blog`, `about me`]} />
    <Bio />
    <p>
      勤硕(lqs)，来自西南小城，早年 OIer,
      现在在帝都给一位姓马的爸爸打工。本人属于不务正业型搬砖码畜，倒腾 Web,
      Mobile, NodeJs 等，喜欢折腾(自己)，除了前端技能树，还点过
      Java，Python，ios，Docker 的奇葩技能树。
    </p>
    ✉️ liqinshuo469@gmail.com
  </Layout>
)

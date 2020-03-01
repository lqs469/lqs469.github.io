import React from "react"

export default class HTML extends React.Component {
  render() {
    const hour = new Date().getHours()
    const theme = hour >= 18 || hour <= 8 ? "dark" : "light"

    return (
      <html {...this.props.htmlAttributes}>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          {this.props.headComponents}
        </head>
        <body {...this.props.bodyAttributes} className={theme}>
          {this.props.preBodyComponents}
          <div
            key={`body`}
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
          <div style={{ display: "none" }}>
            <script
              dangerouslySetInnerHTML={{
                __html: `
              console.log('Halo 😉');
              var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");
              document.write(unescape("%3Cspan id='cnzz_stat_icon_1264607064'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s19.cnzz.com/z_stat.php%3Fid%3D1264607064' type='text/javascript'%3E%3C/script%3E"));
              `,
              }}
            />
          </div>
        </body>
      </html>
    )
  }
}

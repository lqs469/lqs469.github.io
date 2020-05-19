import React from "react"

export default props => {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes} className="light">
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{
            __html: `
            ${props.body}
          `,
          }}
        />
        {props.postBodyComponents}
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

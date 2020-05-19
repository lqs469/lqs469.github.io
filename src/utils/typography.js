import Typography from "typography"
import Wordpress2016 from "typography-theme-wordpress-2016"
import "./global.css"

const fontFamily = [
  "PingFang SC",
  "Helvetica Neue",
  "Microsoft YaHei",
  "Source Han Sans SC",
  "serif",
]

Wordpress2016.headerFontFamily = fontFamily
Wordpress2016.bodyFontFamily = fontFamily

Wordpress2016.overrideThemeStyles = () => {
  return {
    h1: {
      fontFamily: fontFamily.join(","),
    },
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
  }
}

delete Wordpress2016.googleFonts

const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale

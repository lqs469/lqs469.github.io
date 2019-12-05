import Typography from "typography"
import Wordpress2016 from "typography-theme-wordpress-2016"
import "./global.css"

Wordpress2016.baseFontSize = '14px'
Wordpress2016.headerWeight = 600
Wordpress2016.boldWeight = 500
Wordpress2016.bodyWeight = 400
Wordpress2016.bodyFontFamily = Wordpress2016.headerFontFamily = ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', 'serif'];

Wordpress2016.overrideThemeStyles = () => {
  return {
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

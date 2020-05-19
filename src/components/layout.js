import React, { useCallback, useState, useMemo, useEffect } from "react"
import { Link } from "gatsby"
import { rhythm, scale } from "../utils/typography"

const Layout = props => {
  const {
    // location,
    title,
    children,
  } = props
  // const rootPath = `${__PATH_PREFIX__}/`

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    document.body.className =
      localStorage.getItem("__THEME__") === "dark" ? "dark" : "light"
  }, [])

  const isBrowser = useMemo(
    () => typeof window !== "undefined" && window.localStorage,
    []
  )

  const [theme, setTheme] = useState(
    isBrowser && localStorage.getItem("__THEME__") === "dark" ? "dark" : "light"
  )

  const toggleTheme = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    const newTheme = theme === "dark" ? "light" : "dark"
    localStorage.setItem("__THEME__", newTheme)
    document.body.className = newTheme
    setTheme(newTheme)
  }, [theme])

  const linkStyle = {
    ...scale(1 / 4),
    boxShadow: `none`,
    textDecoration: `none`,
    color: `var(--textNormal)`,
    fontWeight: "bolder",
    marginRight: rhythm(1),
  }

  const activeStyle = {
    textDecoration: "underline",
  }

  const header = (
    <header
      style={{
        marginTop: rhythm(1),
        marginBottom: rhythm(2),
      }}
    >
      <Link
        style={{
          ...scale(1 / 3),
          ...linkStyle,
          color: "rgb(255, 10, 120)",
          marginRight: rhythm(1.5),
          textTransform: "capitalize",
        }}
        to={`/`}
      >
        {title}
      </Link>

      <Link style={linkStyle} to="/post" activeStyle={activeStyle}>
        Posts
      </Link>

      <Link style={linkStyle} to="/project" activeStyle={activeStyle}>
        Projects
      </Link>
      <span onClick={toggleTheme} style={{ cursor: "pointer", float: "right" }}>
        {theme === "light" ? "🌙" : "🌞"}
      </span>
    </header>
  )

  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(25),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      {header}
      <main>{children}</main>
    </div>
  )
}

export default Layout

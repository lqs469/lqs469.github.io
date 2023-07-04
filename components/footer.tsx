import Container from "./container";

const social = {
  twitter: `lqs469`,
  github: `lqs469`,
  weibo: `lqs469`,
  ins: `lqs469`,
  zhihu: `li-qin-shuo`
};

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="py-20">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://twitter.com/${social.twitter}`}
        >
          Twitter
        </a>
        {" · "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://github.com/${social.github}`}
        >
          Github
        </a>
        {" · "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://weibo.com/${social.weibo}`}
        >
          Weibo
        </a>
        {" · "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.zhihu.com/people/${social.zhihu}`}
        >
          Zhihu
        </a>
        {" · "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.linkedin.com/in/qinshuoli"
        >
          Linkedin
        </a>
        {" · "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="mailto:liqinshuo469@gmail.com"
        >
          hi@lqs469.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;

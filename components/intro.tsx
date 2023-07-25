import { Nav } from "./nav";
import styles from "./intro.module.css";
import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";

const Intro = () => {
  const introRef = useRef(null);

  const setIntroAxis = useCallback((e) => {
    introRef.current.style.setProperty("--x", `${e.clientX}px`);
    introRef.current.style.setProperty("--y", `${e.clientY}px`);
  }, []);

  const setItemAxis = useCallback(() => {
    introRef.current.querySelectorAll("b").forEach((e) => {
      const bounding = e.getBoundingClientRect();

      e.style.setProperty("--position-x", `${bounding.x}px`);
      e.style.setProperty("--position-y", `${bounding.y}px`);
    });
  }, []);

  useEffect(() => {
    document.querySelector("body").addEventListener("mousemove", setIntroAxis);
    setItemAxis();
    window.addEventListener("resize", setItemAxis);

    return () => {
      document
        .querySelector("body")
        .removeEventListener("mousemove", setIntroAxis);
      window.removeEventListener("resize", setItemAxis);
    };
  }, []);

  return (
    <section
      ref={introRef}
      className={classNames(
        "flex-col flex md:justify-between pt-16 pb-16 md:pb-12",
        styles.intro
      )}
    >
      <h1 className="text-7xl md:text-[10em] font-[MHTIROGLA]">
        <b>Lqs469.</b>
      </h1>
      <Nav />
      <h4 className=" mt-5">
        <p className="mb-5">
          Hi! I am <b>lqs / Allen / lqs469</b>, a <b>Software Engineer</b>,
          currently all-in engaging in my <b>startup</b> project about GameFi
          and Web3 (Not that one you know). I always enjoy in building stuff and
          solving problems (The premise is that I can). With a strong passion
          for software development, gaming design, computer vision, and creative
          products or thoughts (only if interesting enough).
        </p>
        <p className="mb-5">
          I've spent years as <b>SDE</b> on several top level company like&nbsp;
          <b>Microsoft</b>, <b>Alibaba</b> (boring but beneficial). Since 2022,
          I joined my own startup to build the next generation of GameFi and
          Web3 Dapp.
        </p>
        <p className="mb-5">
          You can gain further insights and info about me throught this site or
          my social media profiles. Also, feel free to <b>contact me</b> via
          email or other social media.
        </p>
      </h4>
    </section>
  );
};

export default Intro;

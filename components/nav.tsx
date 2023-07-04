import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const Nav = () => {
  const router = useRouter();

  const actived = useCallback((path: string) => {
    return (router.asPath === path ? "no-underline opacity-40" : "") + " mr-4";
  }, []);

  return (
    <div className="py-8 flex items-center justify-start">
      <Link className={actived("/posts")} href={"/posts"}>
        Posts
      </Link>
      <Link className={actived("/projects")} href={"/projects"}>
        Projects
      </Link>
      <Link className={actived("/")} href={"/"}>
        About
      </Link>
    </div>
  );
};

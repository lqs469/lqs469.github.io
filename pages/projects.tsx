import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../components/container";
import Header from "../components/header";
import Layout from "../components/layout";
import Head from "next/head";
import { Nav } from "../components/nav";
import { projects } from "../_projects/projects";
import githubIcon from "../public/img/github.svg";
import { useCallback } from "react";

type Props = {
  projects: {
    name: string;
    description: string;
    url: string;
    github: string;
  }[];
};

const title = "Projects";

export default function Projects({ projects }: Props) {
  return (
    <Container>
      <Layout>
        <Header />
        <article className="mb-32">
          <Head>
            <title>{title}</title>
            {/* <meta property="og:image" content={post.ogImage.url} /> */}
          </Head>
          <Nav />
          <section className="">
            {projects.map((project, index) => (
              <li
                key={project.name}
                className="flex justify-between items-center leading-10 border-b"
              >
                <a
                  className="font-semibold no-underline"
                  href={project.url}
                  target="_blank"
                >
                  {project.name}
                </a>
                <p className="opacity-70 inline-flex items-center">
                  <a
                    className="no-underline"
                    href={project.url}
                    target="_blank"
                  >
                    {project.description}
                  </a>
                  <a className="ml-2" href={project.github} target="_blank">
                    <img
                      className="h-4"
                      src={"/assets/github.svg"}
                      alt={project.github}
                    />
                  </a>
                </p>
              </li>
            ))}
          </section>
        </article>
      </Layout>
    </Container>
  );
}

export async function getStaticProps() {
  return {
    props: {
      projects
    }
  };
}

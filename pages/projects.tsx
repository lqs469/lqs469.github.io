import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../components/container";
import Header from "../components/header";
import Layout from "../components/layout";
import Head from "next/head";
import { Nav } from "../components/nav";
import { projects } from "../_projects/projects";
import { products } from "../_projects/products";
import { demos } from "../_projects/demos";

type Props = {
  projects: {
    name: string;
    description: string;
    url: string;
    github: string;
  }[];
  products: {
    name: string;
    description: string;
    url: string;
  }[];
  demos: {
    name: string;
    description: string;
    url: string;
  }[];
};

const title = "Projects";

export default function Projects({ projects, products }: Props) {
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
          <section>
            <p className="font-semibold leading-10">Product</p>
            {products.map((product, index) => (
              <li
                key={product.name}
                className="flex justify-between border-b py-2"
              >
                <a className="no-underline" href={product.url} target="_blank">
                  {product.name}
                </a>
                <p className="opacity-70 inline-flex items-center text-right">
                  <a
                    className="no-underline"
                    href={product.url}
                    target="_blank"
                  >
                    {product.description}
                  </a>
                </p>
              </li>
            ))}
          </section>
          <section className="mt-10">
            <p className="font-semibold leading-10">Project</p>
            {projects.map((project, index) => (
              <li
                key={project.name}
                className="flex justify-between py-2 border-b"
              >
                <a className="no-underline" href={project.url} target="_blank">
                  {project.name}
                </a>
                <p className="opacity-70 inline-flex items-center text-right">
                  <a
                    className="no-underline"
                    href={project.url}
                    target="_blank"
                  >
                    {project.description}
                  </a>
                  <a className="ml-2 shrink-0" href={project.github} target="_blank">
                    <img
                      className="h-4 w-4"
                      src={"/assets/github.svg"}
                      alt={project.github}
                    />
                  </a>
                </p>
              </li>
            ))}
          </section>
          <section className="mt-10">
            <p className="font-semibold leading-10">Demo</p>
            {demos.map((demo, index) => (
              <li
                key={demo.name}
                className="flex justify-between py-2 border-b"
              >
                <a className="no-underline" href={demo.url} target="_blank">
                  {demo.name}
                </a>
                <p className="opacity-70 inline-flex text-right">
                  <a className="no-underline" href={demo.url} target="_blank">
                    {demo.description}
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
      projects,
      products,
      demos
    }
  };
}

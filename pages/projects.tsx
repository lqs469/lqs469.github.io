import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../components/container";
import Header from "../components/header";
import Layout from "../components/layout";
import Head from "next/head";
import { Nav } from "../components/nav";

type Props = {
  projects: any[];
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
          <section className=""></section>
        </article>
      </Layout>
    </Container>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const projects = [];

  return {
    props: {
      projects
    }
  };
}

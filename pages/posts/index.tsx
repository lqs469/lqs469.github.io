import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import Layout from "../../components/layout";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import PostTitle from "../../components/post-title";
import Head from "next/head";
import { TITLE } from "../../lib/constants";
import markdownToHtml from "../../lib/markdownToHtml";
import type PostType from "../../interfaces/post";
import { Nav } from "../../components/nav";

type Props = {
  posts: PostType[];
};

const title = "Posts";

export default function Post({ posts }: Props) {
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
            {posts.map((post) => (
              <div
                className="py-1 flex justify-between"
                key={post.slug}
              >
                <a
                  href={`/posts/${post.slug}`}
                  className="text-black no-underline font-medium"
                >
                  {post.title}
                </a>
                <span className="opacity-50 text-sm text-right">
                  {post.date.slice(0, 4)}/{post.date.slice(5, 7)}
                </span>
              </div>
            ))}
          </section>
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
  const posts = getAllPosts(["title", "date", "slug"]);

  return {
    props: {
      posts
    }
  };
}

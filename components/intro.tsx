import { Nav } from "./nav";

const Intro = () => {
  return (
    <section className="flex-col flex md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        lqs469.
      </h1>
      <Nav />
      <h4 className=" mt-5">
        <p className="mb-5">
          Hi! I am lqs/Allen/lqs469, a Software Engineer, currently all-in
          engaging in my startup project about GameFi and Web3 (Not that one you
          know). I always enjoy in building stuff and solving problems (The
          premise is that I can). With a strong passion for software
          development, gaming design, computer vision, and creative products or
          thoughts (only if interesting enough).
        </p>
        <p className="mb-5">
          I've spent years as SDE on several top level company like Microsoft,
          Alibaba (boring but beneficial). Since 2022, I joined my own startup
          to build the next generation of GameFi and Web3 Dapp.
        </p>
        <p className="mb-5">
          You can gain further insights and info about me throught this site or
          my social media profiles. Also, feel free to contact me via email or
          other social media.
        </p>
      </h4>
    </section>
  );
};

export default Intro;

---
title: React Server Components, Better SPA powered by backend
date: "2020-12-25 11:30:10"
---

> **React Server Component -- "RSC"**
>
> Server Components are an experimental feature and are not ready for adoption.

**Recommend read this article firstly: [Introducing Zero-Bundle-Size React Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html)**

## Background

In the frontend development, we will meet some pain points, all We want:

1. Fast(Performance)
2. Cheap(Maintenance)
3. Good(User experience)

But for sure we can't get all. Here is an example:

Component usually exchanges data with the server by:

1. Fetch data in the parent node and dispatch to all children components(waiting until dispatching)
2. Fetch data in every respective children component (data maybe exists duplicated part)

The first way needs to wait and maintain easily-- Cheap but no fast. Second-way waste resource and hard to maintain but fast -- Good, fast but no cheap

## Under the hood

One word, React Server Component is: **Asynchronously dispatch react component by serialized JSON from server-side.**

This is serialized JSON data looks like:
![](/posts/React-Server-Components/RSC.png)

Actually, We already have GraphQL, it also can fetch the data that component needs just enough. why we need RSC?

Actually not every team welcome GraphQL, it needs a special frontend and backend API, it's pretty complex, many teams don’t like such high costs on learning and maintaining.

Server-Side Rendering(SSR), RSC is basically different from SSR. SSR responds with the whole HTML and refreshes the page when the user triggers some action, but RSC still keeps the way of asynchronous interaction and refreshing partial.

of course, you can use RSC with all of the technologies above, you can use RSC in SSR and communicate between client and server by GraphQL If you like and god bless you.

**RSC can bring us:**

1. Less bundle size, load the code that is necessary(Both app itself and imported libraries)
2. Speed up data grab process, from server to server side
3. No need to consider the possible bandwidth waste through data API
4. No need to consider components should be imported asynchronously or packaged in advance
5. Less SPA's white screen time

**What kind of component suits RSC (for now):**

1. No much interaction
2. Do have some data rely on
3. Flexible content components

In my opinion, If RSC production-ready, we can use it as a normal way to develop react applications (like hooks).

**More interesting concepts:**

1. Client and server component looks the same
2. "Shared Component"
3. Transfer data from server to server in RSC, That's way fast and it has many approaches
4. Get rid of some libraries which just be used few times in the corner
5. Server mental model
6. A mixed component tree

## For now

React Server Components are still in **research** and **development**. But this concept is pretty inspired, we can develop at server side, reduce the SPA's white screen time, lighten bundle size and we have a new approach to improve user experience.

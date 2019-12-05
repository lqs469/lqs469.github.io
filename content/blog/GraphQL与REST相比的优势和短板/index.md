---
title: GraphQL 与 REST 相比的优势和短板
date: 2019-12-05 18:44:06
categories: 弱鸡之路
---

[GraphQL](https://graphql.org/) 是 Facebook 发布的 API 查询语言，自2015年向公众发布以来，一直在改进 Web 和原生应用程序的用户体验。它的“走红”非常迅速，但也有所局限，这篇文章不会介绍他的实现原理和相关概念，而是来看一看它与传统的 [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) 相比，它具有的多种优势和局限。

## 优势1：数据更少
这一点很好理解，也是 GraphQL 最大的亮点。在数据请求过程中，用户使用的数据从数据库某处取出，如果您直接使用 SQL 操作数据库，那么您知道只请求所需的几个字段而不是所有字段都拿出来会更有效、更快速，同时造成更少的资源浪费。

在 REST 请求中，几乎不可能仅仅指定所需的几个字段。结果就是您通常会拿到冗余数据。如果遇到需要一次请求多个数据、查询多个表的情况，那将面临的是指数级增长的麻烦。

比如一种常见的情况，先请求一个 `userList` 列表，然后在请求每一个 user 的某个字段，比如 `user.name`，一般获取 user 接口设计为获取个人的全部数据，那么对于前端而言，除 name 之外的数据无处可用，造成了浪费。

## 优势2：合并请求
GraphQL 的另一个显着优势是能够合并多个请求。举一个 REST 中常见的情况：

我们需要展示一个小组。我们称之为 `/team_by_id/:team_id`。
该小组有一个用户 ID 列表。我们需要获取每个用户信息，所以为每个 ID 分别调用 `/user/:user_id`, 每个用户调一次。
但是我们还想显示该用户所在的其他小组情况。现在，我们再次调用 `/team_by_user_id/:user_id`，每个团队每个用户调一次。
总计一下：

```
/team/:id 1 
/user/:id n（n: 小组中的用户数）
/team/:id n×t（t: 每位用户的小组数）
```

如果这是一个由 30 个用户组成的团队，并且每个用户都是 3 个团队，那么我们只获取一次 REST 完整数据需要请求执行 1 + 30 + 30*3 = 121 次。

当然，您可以找到优化 REST 方法，但是必须手动进行，各种数据缓存来减少请求次数，但是同时也引入了数据缓存和更新的新问题，复杂度维护成本直线提升。

而它们如果在 GraphQL 中执行。可以按照以下方法将所有这些 REST 请求合并到一个 GraphQL 查询中：

```
query TEAM_USERS_DATA {
  team(*id*: $team_id) {
    users {
      userName
      avatar      
      teams {
        teamName
      }
    }
  }
}
```

使用 GraphQL 就可以在单个请求中完成相同的操作。不仅可以提高性能，还仅通过一次调用就完成了原来的递归或循环实现的个不同的查询，降低代码复杂性。

**查询复杂度的注意事项**

由于 GraphQL 可以自由地关联模型，并且您可以从另一查询中查询一件事，因此会有“复杂度”的问题，它与 GraphQL 服务器有关。这种复杂度会影响性能。类似于 SQL 查询中的 JOIN 多个表并不会“免费”，GraphQL 解析器也是如此。当我们通过在 GraphQL 中嵌套获取远程模型时，我们称其为“解析”。例如，之前的用户/小组例子中，您可能会注意到，从用户中查询团队或团队中的用户都是快速的。但是，如果您不停地将用户，团队，用户，团队……一遍又一遍地链接在一起，您会发现在某个时间点存在延迟。根据您的特定 GraphQL 服务器，中间件和数据库体系结构，延迟多少以及在什么级别变得明显将有所不同。但是无论您采用何种逻辑设计，最好将查询深度控制在一定水平，减少重复昂贵的查询，同时为您提供应用程序所需的灵活性。

除此之外，GraphQL 生态本身提供了成熟的缓存中间件，可以让我们快速低门槛的使用 cache，更多详情可以查看 [dataloader](https://github.com/graphql/dataloader)。

其实上面 GraphQL 的两个优势就是弥补了 REST 在获取数据中：“过多”（Over-fetching）或“过少”（Under-fetching）的问题，”过多“就会带宽浪费，过少就会重复请求，同样造成浪费。在传统的 REST 请求方式中，即使极为优秀的 API 设计者也无法完美解决这些问题，因此 GraphQL 的思路应运而生。

## 优势3：订阅
GraphQL 的另一个好处是“订阅”——进行查询并自动更新的功能。通常，这是使用 [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 在 GraphQL 服务器端实现的。假设我们要使用 GraphQL 创建一个聊天应用。我们可能会执行以下操作：

```
subscription MESSAGES() {
  messagesSubscribe(last: 200) {
    msg    author {
      avatar
      userName
    }
  }
}
```

在应用中，`messagesSubscribe` 将是一系列消息，每次发送新消息时都会自动更新。否则的话，我们就得轮训发送请求，短时间内产生数百个请求。

对于订阅，打开连接后唯一传输的数据是发送或接收消息的时间。要充分利用订阅，您必须使用支持该订阅的客户端，大多数流行的客户端（例如 [Apollo Client](https://www.apollographql.com/docs/react/)）都是内置的。

有关 GraphQL 订阅可以看这个有趣的示例，Eve Porcello 在 React Rally 2018 上的演讲，其中五名与会者使用 Subscribe 创建了即兴音乐。（视频自带 YouTube 机翻的字幕）

<div style="height: 0; padding-bottom: calc(56.25% + 35px); position:relative; width: 100%;">
  <iframe allow="autoplay; gyroscope;" allowfullscreen height="100%" referrerpolicy="strict-origin" src="https://www.kapwing.com/e/5de8b6e0b736e20013e89084" style="border:0; height:100%; left:0; overflow:hidden; position:absolute; top:0; width:100%" title="Embedded content made with Kapwing" width="100%"></iframe>
</div>

[Eve Porcello - Everything You Need 0to Know About GraphQL in 3 Components - YouTube](https://www.youtube.com/watch?v=F_M8v6MK0Sc)

[视频中提及的相关资料可以点这里](https://github.com/eveporcello/react-rally)

**那么，GraphQL 有什么局限吗？**

我们在前面都在讨论 GraphQL 的优点。 那么与 GraphQL 相比，REST 是否有什么优势呢？公平地说，GraphQL 是在 REST 的基础上构建的，因此其设计是向前的迭代。 REST 一直是现代网络中最有影响力的基础构建块之一，没有它，GraphQL 就不会存在。因此，可以说 GraphQL 在几乎所有方面都比 REST 有了明显的改进。但 GraphQL 也是有其短板：

## 局限1：HTTP 缓存
一个非常明显的问题，因为无法使用固定规范的 HTTP 请求，也就无法把数据缓存在 HTTP 层，即使做再多的 GraphQL 服务端缓存，也无法解决网络级别的通信量拥堵问题，目前社区提供了一些客户端级别的缓存方案来解决一部分问题，比如使用 [Apollo Client](https://www.apollographql.com/docs/react/) 、[Relay](https://relay.dev/)，但是这些当然也不是免费的，需要开发者持续投入精力，增加了不少成本。

## 局限2：HTTP Status
正常情况下 GraphQL 只会返回 Status Code `200`，无论当前数据请求是成功或失败，这样传统方法的通讯状态判断和逻辑就无法使用，虽然开发者可以自定义一套错误处理逻辑，但也增加了复杂度。

## 局限3：复杂度陡升
面对一个传统有效的解决方案（REST），除非有非做不可的痛点，否则我们一般不会对他下手。在现实中这也体现了出来，GraphQL 虽然已经面世了几年时间，更新迭代几版逐渐趋于稳定状态，但是市场接受度只能说不温不火。一方面 GraphQL 方式涉及了客户端和服务端的传统开发模式，代码入侵较大；另一方面，它对前后端开发人员都有一定的门槛，各种 scheme、query、type、resolver 又增加了复杂度，在情况千差万别的业务场景下，很难说对于整体性能是提升还是下降；同时由于客户端需要有 GraphQL Client 才能使用 API，这也导致 API 的复用和扩展有所受限。

# 结论
REST 和 GraphQL 都是基于 HTTP 的数据传输解决方案，GraphQL 可以显著的节省网络传输资源，在带宽紧张的环境中（例如移动端），这将发挥巨大的作用。尽管 GraphQL 相比 REST 有很多显著的优点和升级，但在真实场景中，它并不一定是最适合你的实现。总结来说，如果你希望做的应用追求简单而敏捷，且没有什么特殊考量，那就没什么必要使用 GraphQL，REST 可靠、经济、不易出错；反而言之，如果应用的关键点在于组织复杂数据逻辑，请求存在较多 `Over-fetching`、`Under-fetching` 的情况，或者对于网络环境敏感，那么 GraphQL 会是一发银弹。


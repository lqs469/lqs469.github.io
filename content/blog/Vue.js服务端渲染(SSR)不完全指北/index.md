---
title: Vue.js服务端渲染(SSR)不完全指北
date: 2019-09-30 14:46:40
categories: 弱鸡之路
---

### What’s this?
**SSR(Server-Side Rendering) -- 服务端渲染**

服务端渲染是相对于客户端渲染而言的(Client Side Render), 它的渲染行为发生在服务器端, 渲染完成之后再将完整页面以HTML字符串的形式交给浏览器, 最后经过”注水”`hydrate`过程将一些事件绑定和Vue状态等注入到输出的静态的页面中, 由同步下发给浏览器的的Vue bundle接管状态, 继续处理接下来的交互逻辑. 这也是一种同构应用的实现(代码可以运行在客户端和服务端中).

### When SSR?
那么 **什么情况下该使用SSR方案呢** , 其实一句话总结下来就是展示型应用:

1. 对SEO有需求. CSR无法直接满足SEO, 他需要切换成SSR或者借助Prerendering方案. Prerendering: 一种在服务端使用无头浏览器渲染出页面, 再输出静态页面的解决方案, 也能实现SEO需求, 好处是比较简单(通过webpack插件就可以实现)可以保持前端模块不需要SSR改造, 但是性能比SSR差不少.
2. 对首屏渲染速度和性能有需求. 如果需要更早的将页面展现给用户而不是白屏的话, 最好的方案还是把渲染工作交给服务端, CSR(SPA)应用的更适合场景应该是中后台web应用, 一般有较多的交互逻辑和页面数据处理, 同时CSR会使用更多的内存, 对浏览器造成较大的压力.
3. 过多依赖客户端环境的场景. 直接将渲染工作全部交给客户端和JavaScript来处理其实对于web应用来说是很脆弱的, 浏览器的情况千差万别, 网络环境也是无法预测, 即使做了再多的兼容工作, 也无法保证任何情况下都能完美展示. 有时候即使框架本身也不足以(不愿意)支持所有情况.
4. 安全性考量. 对于有权限控制和内容限制的应用, 使用SPA的时候就要考虑很多安全性限制的问题, 对于应用结构的设计增加了不少复杂度.

### Why SSR ?
在早期的web开发技术栈中, 实际上都是服务端渲染, 像是Java, PHP, ROR, ASP.NET. 当前端MVC出现之后, 浏览器端渲染模型开始出现并且流行 — “开局一块HTML模板, 元素全靠JS加载”. 这种方式带来了比较快速的页面切换体验和极好的开发效率, 以及丰富的技术生态.
但是CSR也不是没有缺点, **缺点很明显**而且不改变其核心思路的话没办法克服:

1. SEO不友好
首先因为开局服务器丢给浏览器的是一块空白(有标记)的HTML模板和一坨打包好的JS代码, 所以做SEO时候普通的爬虫没办法实抓取到真实的web内容, 虽然现代爬虫号称已经能够处理CSR页面, 但是处理成本过高等问题还是让CSR的SEO结果不尽如人意.

2. 首屏加载速度
同样因为浏览器会在接受到完整的一坨JS代码之后才能执行他, 导致了首屏加载经历了: 
解析HTML(渲染HTML模板) -> 获取JS -> 执行JS -> JS渲染页面 -> JS处理数据相关逻辑 -> 页面加载完成. 这样一个过程之后才能完整呈献给用户, 速度自然就下来了, 更不用说网络因素和客户端环境因素对体验的影响. 即使有前端缓存的存在, 但是页面渲染过程仍然不会轻松.

3. 鉴权等安全性功能实现起来较复杂
其次, 因为是服务端一股脑把打包好的JS代码交给用户, 所以如果在应用中有鉴权的逻辑, 就会牵扯到鉴权逻辑的设计. 这时候就要前后端合作来保证安全性, 复杂度增加.



其实在大多数场景下, 你都没必要使用SPA的方案(可以看看[这篇文章](https://journal.plausible.io/you-probably-dont-need-a-single-page-app) ). 那么既然某些场景下不适合使用CSR方案, 我们直接退回到以前的web开发方式就好了, 干嘛要去踩SSR新的坑呢?  那么**对比传统的web应用, 使用框架SSR的好处**有哪些呢:

1. 对比传统方式, 首先最大的好处当然就是技术栈生态, Vue, React等前端MVC给开发带来很大便利, 相应的生态也蓬勃发展, 配套的UI套件, 框架组件, 设计语言, API设计很多程度上已经改变了如今的开发方式. 换句话说, 使用jQuery纯手撸的人原来越少了.

2. 其次是同构带来的便利. 一套代码由两边的执行环境使用, 可以同时支持SSR和CSR的渲染, 当SSR失效的时候还可以降级为CSR, 或者当服务器压力过大的时候主动降级以增强鲁棒性.

3. 对技术人员的技术栈统一. SSR还是使用的前端工程师常规熟悉的技术栈, 没有过大的技术门槛, 也没有太多的技术债, 更适合项目的可持续维护和前端团队的技术发展.


### 构建逻辑

在Vue-SSR构建过程中, 会将代码打包分成两个部分: 服务端bundle; 客户端bundle.
Node.js会处理服务端bundle用于SSR, 客户端bundle会在用户请求时和已经由SSR渲染出的页面一起返回给用户, 然后在浏览器执行”注水”(`hydrate`), 接管Vue接下来的业务逻辑. 这里就会有一个问题, 服务端是如何将store状态交给客户端的呢, 因为整个构建流程是彼此独立的, 数据预取(在进入渲染页面之前获取到页面所需要的数据)之后交给了store, 而注水过程怎么接收store数据? 其实中间有一个特殊的状态保存: `window.__INITIAL_STATE__`, 这个state会在服务端渲染执行`context.state = store.state;`的时候自动写入`window`中, 所以在客户端代码中就就可以直接通过`store.replaceState()`接收服务端预取的数据了.

构建逻辑示意图很经典, 如下:

![SSR构建逻辑.png](./1.png)

所以webpack需要两个入口(服务端, 客户端):

**entry-client.js**:
客户端 entry 只需创建应用程序, 并且将其挂载到DOM, 然后将Store状态同步给客户端bundle：
```js
import { createApp } from '../main';
let { app, store, router } = createApp();

// 同步store
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

router.onReady(() => {
	router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);
    let diffed = false;
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c);
    });

    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _);
    if (!asyncDataHooks.length) {
      return next();
    }

    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        console.log('client entry asyncData function emit');
        next();
      })
      .catch(next);
  });

	app.$mount('#app');
})
```

**entry-server.js**:
服务端入口需要处理路由, 并触发数据预取逻辑
```js
import { createApp } from '../main';

export default context => {
  return new Promise((resolve, reject) => {
    let { app, router, store } = createApp();

    router.push(context.url);

	  router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();

      // 对所有匹配的路由组件调用 `asyncData()`
      Promise.all(
        matchedComponents.map(Component => {
          if (Component.asyncData) {
            return Component.asyncData({ store, route: router.currentRoute });
          }
        })
      ).then(() => {
          context.state = store.state;
          resolve(app);
        })
        .catch(reject);
    }, reject);
	})
}
```

### 具体实现
<!-- > VueSSR + Begg 的实现已经集成进了脚手架工具[K2](http://gitlab.alibaba-inc.com/qinshuo.lqs/k2)中.
>
> 感兴趣的同学可以尝试一下, 一键搭建, 即开即用😃 -->

明确了选型原因和框架特性, 我们就要开始着手搭建一个Vue-SSR框架, 推荐文档: 官方出品的SSR指南 [https://ssr.vuejs.org/](https://ssr.vuejs.org/) . 里面讲解了你所需要知道的全部名词解释和API介绍, 基本不需要再单独查资料了. 同时他给出了一个官方出品的 [Demo](https://github.com/vuejs/vue-hackernews-2.0/), demo的作者就是尤雨溪, 你想要参考的内容里面也基本都实现了一遍, 不过这个Demo是基于Express的, 改造成Egg还需要一些工作. 

Vue-SSR + Egg.js, 在结构上跟普通的Vue服务端渲染也是一样的. 首次请求到达时, 由Egg.js处理, 在服务端执行渲染器逻辑并输出静态页面, 一共输出的还有客户端bundle, 然后客户端bundle接管应用, 继续接下来的任务, 变成一个”普通”的Vue应用. 同时Egg.js还会处理来自页面的异步请求, 处理正常服务端的工作. 下面是应用整体结构的示意:

![SSR应用整体结构.png](./2.png)

具体来说, SSR的核心思路就是使用`vue-server-renderer`创建一个渲染器(renderer), 然后给这个渲染器传入Vue实例, 渲染器会得到HTML页面, 最后由Egg.js将HTML返回, 实现代码有些繁杂这里就不一一放出来了, 核心流程可以简化成:
```js
// 第 1 步：创建一个 Vue 实例
const app = new Vue({ template: `<div>Hello World</div>` })

// 第 2 步：创建一个 renderer
const renderer = require('vue-server-renderer').createRenderer()

// 第 3 步：将 Vue 实例渲染为 HTML
const html = await renderer.renderToString(app)

// 第 4 步, 返回 HTML
this.ctx.body = await this.ctx.renderString(html)
```

具体的实现代码可以在k2搭建的SSR框架中的`app/controller/template.js`文件中找到.

### 开发环境
SSR + Egg 的生产实现并不难, 但是支持HMR的开发环境搭建就稍麻烦些, 主要是`devMiddleware`, `hotMiddleware`和Egg.js配合使用. 原理是使用这些开发中间件监听并构建Vue文件后放在内存中, 再响应用户的请求.

具体来说, 在开发环境下, dev renderer中会执行dev-server并监听Vue代码, 当Vue代码发生变化时更新渲染renderer, 并返回给Egg, Egg会等待dev-server的返回后去执行输出. 因为egg的是基于koa, 所以dev Middleware简单封装一下直接挂载egg中的app上就可以, 具体实现代码可以查看k2搭建的SSR框架中的`build/setup-dev-server.js`文件.

这里有个值得注意的地方就是`hotMiddleware`中间键在注册之后就会接管所有请求, 这时候本希望走到Egg的请求就会被指向Vue,  这是不希望看到的, 所以需要在`hotMiddleware`中过滤一下:
```js
// setup-dev-server.js
...
function hotFn(ctx, next) {
  // 过滤 HMR
  if (ctx.url.indexOf('webpack_hmr') < 0) {
    return next();
  }

  const stream = new PassThrough();
  ctx.body = stream;

  return hotMiddleware(
    ctx.req,
    {
      end: () => {},
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        ctx.state = state;
        ctx.set(headers);
        console.log('hotMiddleware headers', state, headers);
      },
    },
    next
  );
}
app.use(hotFn);
...
```


### SSR优化
通过服务端渲染, 我们将应用从IO密集型转为了CPU密集型, CPU的压力会在QPS爆发时剧增, 这时候就需要针对SSR进行一些优化, 常见的优化方式有:

#### 缓存
一般分为页面级别缓存和组件级别缓存.
  * 页面级别缓存: 对于相同的页面的请求, 其内容也相同(不考虑个性化页面情况), 所以将路由与对应页面缓存下来可以很有效命中缓存, 降低性能开销.
    ```js
    // 使用 LRU 
    const microCache = LRU({
      max: 100,
      maxAge: 1000 // 重要提示：条目在 1 秒后过期。
    })

    ...
    // 命中缓存
    const hit = microCache.get(req.url)
    if (hit) {
      return res.end(hit)
    }
    ...

    // 缓存下来
    microCache.set(req.url, html)
    ```

  * 组件级别缓存: 组件缓存在组件渲染过程进行命中判断, 所以会影响组件渲染结果, 所以要确保组件不依赖上下文状态且无副作用, 换句话说缓存的是不会改变内容的展示型组件. 实现方法是使用`vue-server-renderer`内置的组件级别缓存配置参数, 在创建 renderer 时传入. 更多参数可以参考 [具体缓存实现方式](https://ssr.vuejs.org/zh/api/#cache) .
    ```js
    const renderer = createRenderer({
      cache: LRU({
        max: 10000,
        maxAge: ...
      })
    })
    ```

####  降级方案
核心思路就是当CPU使用率过高的时候即使切换到CSR模式.
  可以结合Egg提供的schedule能力, 在启动时执行一个定时任务, 监控CPU使用率, 当大于阈值时切换到CSR模式. 而Egg也提供了单核schedule能力, 这样可以将定时任务的性能损耗降到很小; 或者在渲染执行时计时, 如果超时则自动返回CSR bundle, 降级为CSR应用, 这样虽然能临时解决CPU高开销无法及时响应的问题, 但用户体验并没有什么实质性改良.

### 要注意的坑
Vue-SSR的坑还是不少的, 特别是和Egg.js结合时, 经过了一段比较蛋疼的踩坑阶段,  现在终于稳定下来支撑业务. 这里把开发期间**遇到的问题**总结一下:

1. 生命周期不同. 这个问题最为明显, 在CSR和SSR中生命周期钩子是不同的. SSR中只有`beforeCreate`和`created`会被执行. 而在CSR中所有周期都会再执行一遍. 另外需要注意的是, 在服务端代码中不要写有全局副作用的代码, 例如写了 `setInterval`而不清除它. 因为在SSR周期没有`beforeDestory`阶段, 所以以往CSR中销毁页面前清除副作用的方法就没法继续使用了, 而此时的`setInterval `就会被永远不会清除了!

2. 因为我们采用同构的目的是写一份尽量通用的代码, 让它运行在两端. 所以我们需要对不同端的运行环境特别熟悉才行, Node.js端是没有浏览器对象的, 所以`window`, `document`, DOM操作都没法执行. 同理, 浏览器端是没有`process`对象的. 他们各自的API实现也有差别, 这点需要特别留意. 比较麻烦的就是第三方库的引入, 有时候你并不知道引入的库能不能完全运行在Node端/浏览器端. 如果它只能运行在纯浏览器环境, 那可以在`created`阶段之后引入和执行来避开Node.js下执行.

3. 避免单例. 在CSR中, 每次我们打开页面都是从服务端下载代码(或缓存), 然后创建一个全局的根Vue实例. 但在SSR中情况有所变化, 因为服务端会一直运行, 如果一直用同一个全局的Vue实例, 就会导致每次客户端的请求到指向了同一个根Vue实例, 就有可能造成状态污染. 所以这里要使用工厂函数在每次请求到来时, 新建一个Vue实例, 执行逻辑返回结果. 同样的, `Store`和`Router`也要这样处理:
    ```js
    // main.js
    import Vue from 'vue';
    import App from './App.vue';
    import { createStore } from './store';
    import { createRouter } from './router';

    export function createApp() {
      const store = createStore();
      const router = createRouter();

      const app = new Vue({
        router,
        store,
        render: /h/ => h(App),
      });

      return { app, router, store };
    }

    // router.js
    import Vue from 'vue';
    import Router from 'vue-router';
    import Home from './views/Home';
    import About from './views/About';

    Vue.use(Router);

    export function createRouter() {
      return new Router({
        mode: 'history',
        routes: [
          {
            path: '/',
            component: Home,
          },
          {
            path: '/about',
            component: About,
          },
        ],
      });
    }
    ```

4. 数据预取问题. 在业务中经常会遇到需要我们输出的页面是带有动态数据的, 也就是在渲染页面的时候先异步取一次数据, 然后将返回的数据放入页面中, 最后输出给用户. 其实处理这个逻辑的原理很简单, 就是在服务端整个请求周期中预取数据再注入最后页面就行. 为了尽早的发出请求, 可以在路由模块中执行数据预取逻辑, 在实例化之前就执行异步请求, 然后放入`Vuex`, 然后交给Vue页面去渲染. 这块的代码比较分散, 可以[看这里的实现](https://ssr.vuejs.org/zh/guide/data.html#%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E6%95%B0%E6%8D%AE%E9%A2%84%E5%8F%96-server-data-fetching)

    值得注意的是使用`v-html`注入动态获取的HTML内容的时候. 如果HTML内容有`<script>`所包含的JS代码, 会发现`script`中的事件绑定失效. 其实在这里页面被渲染了两次, 第一次是发生在SSR直接交给浏览器的时候: 此时`<script>`完整被渲染在浏览器里, 其内容正常执行, 事件绑定也正常的绑定在了当时的DOM元素上. 而第二次渲染时, 走的是CSR: 在这时由于是以`v-html`的方式来渲染替换HTML, 但是`v-html`实质上是`innerHTML`操作, 这样	`<script>`虽然会被替换上去, 但是其中的内容不会执行(`innerHTML`为安全性考虑而设计). 所以经过这样两次渲染之后, 此时的DOM元素是第二次渲染时得到的, 而正常执行过的JS的事件绑定是绑在在第一次渲染出来的DOM元素上, 这样就出现了虽然DOM存在. 但是无法触发该DOM上的事件的情况.

    解决方法:
    将获取到的HTML内容进行匹配, 剔出`<script>`内容, 无论第一次或第二次渲染, 只将<HTML>内容交给`v-html`页面, 然后单独在生命周期`updated`(页面已将HTML内容渲染完成)中将`<script>`创建出来, 添加到页面里自动执行, 实现绑定.
    并在下一次页面重渲染(可能是页面跳转来到)时判断`<script>`是否存在, 如果真则先删去再添加, 这样避免添加多余的`<script>`块.

    **而页面为什么会渲染两次呢?**

    这是由于Vue SSR在初始页面渲染完成后会有一次`hydration`过程, 在这个过程中会照常执行流程`mounted`等生命周期. 此时会有一个自动判定, 判定是否此时的组件渲染出的内容与SSR渲染得到的内容一致, 如果出现不一致就会单独执行一次额外的CSR, 以达到页面被能正确地渲染. 而因为我们使用了`v-html`, 这个过程只有在CSR时才会被执行, 所以导致了两次渲染出来的内容不一致, 触发了Vue SSR的”补偿渲染机制”, 进而执行了第二次渲染.
    ![image.png](./3.png)

5. Cookie传递. 用户的请求会先在服务端被处理, 此时会带客户端的cookie, 但如果在服务端中Egg.js发出异步请求, 这个异步请求中并不带客户端的cookie, 所以如果异步请求需要带携带用户信息的cookie, 此时需要将上下文中的cookie加入Egg的异步请求headers中. 同时返回给客户端时如果涉及到有关cookie的操作也要同步处理一下, 例如用户注销: 
    ```js
    const res = await this.ctx.curl('/logout', {
      method: 'POST',
      dataType: 'json',
      headers: {
        // 传递 cookie
        cookie: this.ctx.request.header.cookie,
      },
    });

    if (res) {
      // 处理客户端 cookie
      this.ctx.cookies.set('passport_login', null, {
        domain: '.XXX.com',
      });
    }
    ```

### 总结
在实现一个展示型web应用, 或者对首屏性能要求较高的场景(例如官网, 技术文档). SSR都是一个很有效且值得投入的技术方案, 一方面享受了框架带来的便利和生态福利, 一方面也兼顾了性能和可扩展性, 对团队的横向探索和技术栈统一也很有好处. 得益于Vue(或React)和Egg.js生态的优势, 丰富的第三方库和繁荣生态支持, 让开发者有更多的选择和优化空间. 同时开发效率也更适合现代web应用的开发节奏, 不需要很高的技术门槛,  就可以上手开发并且支撑大部分的业务场景. 同时Egg.js框架的成熟也让服务端的能力更为强大, 对于安全性和稳定性的设计让我们在处理复杂场景中更加得心应手.

当然SSR中的坑也不少, 主要是服务端环境下的API规则的不同和一些数据和逻辑处理的约定(例如生命周期, 环境变量, 数据预取), 但只要注意规避这些问题, 在SSR的开发中还是比较顺滑的. 以目前的API设计来说, SPA的代码无法直接放到服务端就能跑(除非实现CSR应用时就考虑了SSR), 其中想改造的话成本可能还不小. 但是一个新应用想要设计为SSR方案, 基本上开发与维护成本和一个SPA应用差不多, 所以在业务开发中是一个较为可靠的技术方案.

<!-- 目前我们实现的[k2](http://gitlab.alibaba-inc.com/qinshuo.lqs/k2)脚手架已经集成了 Begg + Vue SSR 解决方案, 一键部署, 即开即用, 欢迎大家尝试. -->
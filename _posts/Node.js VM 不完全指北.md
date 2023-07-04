---
title: Node.js VM 不完全指北
date: "2020-04-09 16:27:40"
categories: 弱鸡之路
---

## 前言

[`vm`](https://nodejs.org/api/vm.html#vm_vm_executing_javascript) 是 Node.js 顶级模块之一，你可以直接在 Node.js 中使用 `require` 引入，`vm` 的功能是可以在 V8 虚拟机的上下文中编译和执行 JavaScript 代码。

> The vm module enables compiling and running code within V8 Virtual Machine contexts.
> ——来自 Node.js 文档

它比 `eval`、`Function` 更安全，而且同样很简单。

## 入门

那么我们可以用它来做什么呢？假设你有一段可执行的 js 代码，最简单的两种方法让它 run 起来：

1. 打开浏览器 console，回车执行。
2. 打开一个 terminal，使用 node 来执行它。

这两种都是手动、主动的执行。如果想把这个过程自动化，把目标代码放入到我的程序里呢？方法也有：

1. [`eval`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)
2. [`Function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function)
3. [`vm`](https://nodejs.org/api/vm.html#vm_vm_executing_javascript)

下面是 eval 和 Function 实现 runtime 的语法最基本实现，vm 我们会在后面详细介绍：

```js
// eval(string)

console.log(eval("2 + 2"));
// expected output: 4

console.log(eval(new String("2 + 2")));
// expected output: 2 + 2
```

```js
const sum = new Function("a", "b", "return a + b");

console.log(sum(2, 6));
// expected output: 8
```

我们可以用它们实现一个 javascript 的 runtime 来执行目标代码。比如这样一个场景，我的产品是一个 SDK Playground，我的客户是开发者，它写了一段测试代码想放进我提供的产品里看看运行结果如何，我想要做成一个自动化的服务，那么用上面语法写这样的 JS runtime 是一个不错的选择。

上面提到了 `eval`、`Function`，他们语法和功能我们这里不做介绍了，他也能执行目标代码，但是却带来一些问题：首先最大的是安全性，无论如何目标代码不能影响我正常的服务，也就是说，这个执行环节得是一个沙盒环境，而`eval`显然并不具备这个能力。如果需要一段不信任的代码放任它执行，那么不光服务，整个服务器的文件系统、数据库都暴露了。甚至目标代码会修改`eval`函数原型，埋入陷阱等等。

`eval` 的安全性问题我们就不做更多解释了，其实在生产中，我们应该尽量避免使用它（甚至很多 lint 规则发现它存在都会报错）。总结来说，作为 js 的一个全局对象，它并没有任何沙盒的设计，这显然是无法在生产中使用的。而 `Funtion` 也有同样的安全问题，他们俩的差异可以查阅 MDN 文档，这里按下不表。

## 进阶

那么，既然说到了沙盒属性，vm 具备怎么的特性呢？

首先你可以使用`vm.Script`方法构建一个脚本对象：`new vm.Script(code[, options])`，他的 API 可以总结为下面三个：

- `script.runInThisContext(opts)` - 在当前作用域中运行脚本，也就是说，脚本可以访问当前脚本的全局变量，而不是局部作用域。

- `script.runInContext(context, opts)` - 在提供的作用域中运行脚本，作用域是某个 `vm.createContext` 的结果。 在 `script.runInContext` 中，您可以提供一个自定义可控 sandbox。

- `script.runInNewContext(sandbox, opts)` - 在一个新的 sandbox 的作用域范围内运行脚本。即 `runInNewContext` 会为您自动调用 `vm.createContext`。

当然也可以直接用`vm`上的方法：

```js
const vm = require("vm");
vm.runInThisContext(code, opts);
vm.runInNewContext(code, sandbox, opts);
vm.runInContext(code, context, opts);
```

从上面可以看出，`vm`始终提供了一个可选的作用域来实现沙盒特性，以此来隔绝沙盒内外的影响。
更多 API 细节查看官网文档：[https://nodejs.org/api/vm.html#vm_vm_executing_javascript](https://nodejs.org/api/vm.html#vm_vm_executing_javascript)

## 性能对比

比起其他实现 runtime 的方案，vm 的速度会慢一些，因为他建立了封闭而完整的上下文环境。下面来个小实验：

```
var code = `
var fn = () => {}
I = 100; while(I--) { fn(); }
`;

const vm = require('vm');
const context = vm.createContext();
const script = new vm.Script(code);

console.time('vm');
script.runInContext(context);
console.timeEnd('vm');

console.time('eval');
eval(code);
console.timeEnd('eval');


// Results:
vm: 1.122ms
eval: 0.156ms
```

可以明显看出，vm 比 eval 还是慢了不少。

## 安全性

使用 vm 的模块会比 eval 更为安全，因为 vm 模块运行的脚本完全无权访问外部作用域（或自行设置一个有限的作用域）。 脚本仍在同一进程中运行，因此为了获得最佳安全性。当然你可以给上下文传入一些通用的 API 方便开发：

```
vm.runInNewContext(`
  const util = require(‘util’);
  console.log(util);
`, {
  require: require,
  console: console
});
```

此外，另一个开源库 vm2 针对 vm 的安全性等方面做了更多的提升，[vm2](https://github.com/patriksimek/vm2)。避免了一些运行脚本有可能“逃出”沙盒运行的边缘情况，语法也跟易于上手，很推荐使用。

## 实战 Demo（我能用它来干什么？）

前短时间我用 VM + Midway 做了一个自用的 FaaS 服务，跟其他大型 FaaS 服务基本功能一样，你可以在上面运行、开发和管理你的 serverless 函数，而无需考虑构建和部署基础框架，也不用写任何框架相关的代码，只专注于业务。项目地址：[lqs469/micro-serverless: A micro serverless service based on Node.js VM](https://github.com/lqs469/micro-serverless)

搭建一些简单的个人助理服务，例如天气提示，新闻推送或单纯提醒我不要错过比赛直播。 而这些小需求并没有必要用完整的框架来搭建几个复杂完整的应用程序来解决。 而 serverless 显然很合适。 所以，我做了这个能满足我需求且简易，灵活的 serverless 服务。

**做一个 Github Trending**

```js
async function main() {
  const url = "https://github-trending-api.now.sh/repositories";

  const res = await ctx.curl(
    "https://github-trending-api.now.sh/repositories",
    { dataType: "json" }
  );

  return res.data.map((item) => ({
    title: `${item.name} | 👨‍💻${item.author} | ⭐️${item.stars} | ${item.language}`,
    url: item.url,
    desc: item.description
  }));
}
```

GET `//127.0.0.1:7001/vm/github_trending`

**根据传入的地理位置查询天气**

你可以给函数加入参数，方法时通过请求 URL 的 query，然后在函数中通过 `ctx.query` 取到。比下面的例子可以请求：`//127.0.0.1:7001/vm/weather?location=Tokyo`。

```js
// weather.js
async function main() {
  const { location = 'New York’ } = ctx.query;
  const url = `http://api.weatherstack.com/current?access_key=95f5ee664befefc1c49fa0dac0da19c7&query=${location}`;

  const res = await ctx.curl(url, { dataType: ‘json’ });

  return res.data;
}
```

GET `//127.0.0.1:7001/vm/weather?location=Tokyo`

具体实现细节和函数规则可以看[Readme](https://github.com/lqs469/micro-serverless)。

## 总结

Vm 是一个很有用的 API，但是在生产中运用却很少，原因其实也很明显——安全性，没有人愿意开着飞机时引擎暴露给别人，下面总结一下 vm：

- 足够实现一些 runtime 场景，让你可以开着飞机修飞机。
- 避免了使用极度不安全的 `eval` 或者 `Function` 。
- Vm 模块似乎提供了比较安全的实现，以及精心设计的沙盒模型，但是攻击者仍然可以利用它（是的，有兴趣的同学可以查看这篇[文章](https://pwnisher.gitlab.io/nodejs/sandbox/2019/02/21/sandboxing-nodejs-is-hard.html)。
- Vm2 似乎提供了一个更坚固的沙箱，代码无法“逃脱”，但是安全性问题也可能潜伏其中。

总而言之，我仍然认为运行第三方代码的唯一安全方法是“物理地”将应用程序与该代码分离，例如，通过虚拟机、docker、容器中运行它才是让你更放心的方案，至少在生产中采用绝对安全的方案可以让你睡个好觉。但是如果是对于安全要求没有那么高的场景（比如上面的个人服务），vm 不失为一个简单有效的 runtime 方案，基于此可以设计出很多有趣的东西。

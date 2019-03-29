---
title: 记一个history.push的参数问题
date: 2017-10-01 00:21:56
categories: 弱鸡之路
---

对于使用react的开发者来说，react-router自然不陌生，而从熟悉的人们都知道，在react-router2.0到3.0的版本升级中，API有了很大的改变，可以说几乎变成了另一种用法，这里对版本变化啥的不啰嗦什么，网上的文章也有很多，虽然很杂乱，但也不乏有比较好的出现。追其根本，最好的上手方式还是要熟读官方文档，But，这里就是对官方文档写一点吐槽。。。

在单页面应用中，对于router的操控是必不可少的一部分，而其中对浏览器history的操作都是由history.js完成的。在[官方文档](https://github.com/ReactTraining/history#navigation)中的这里：使用react-router的history.push 或者replace控制URL跳转的时候，正常来说传递state如下：
```JS
history.push(path, [state])
history.replace(path, [state])
```
官方给的🌰也很简单：
```JS
// Push a new entry onto the history stack.
history.push('/home')

// Push a new entry onto the history stack with a query string
// and some state. Location state does not appear in the URL.
history.push('/home?the=query', { some: 'state' })

// If you prefer, use a single location-like object to specify both
// the URL and state. This is equivalent to the example above.
history.push({
  pathname: '/home',
  search: '?the=query',
  state: { some: 'state' }
})
```

说明使用push的参数为字符串加[state]对象的时候使用，或者传一个类location形的对象即可，但是问题来了：
当我使用第一种方法，即 `history.push('/', { some: 'state' })`  时炸了。

{% asset_img 1.png error %}

文字越少，事情越大，一行字说的也很清楚，Hash history中不能push state，被。。忽略了？所以开始实验，换成replace试试看：

{% asset_img 2.png error %}

然而并没有没什么卵用，于是开始google寻求帮助，出乎我意料的是，居然没有人提出过或者议论过这个问题，这么直白报错居然没有答案，难道是太简单了不屑于记录？再仔细看看报错，啥叫被忽略？文档明明说的是这么用呀，于是换一种理解，是不是不能传递因为会被忽略？
于是改用传单个对象参数的方式试一试，果然。改为：
```
history.push({
  pathname,
  search,
  state: { some: 'state' }
})
```

就管用了。。很诡异，难道官方文档也有问题？好吧我开始注意到版本的问题。文档的版本是最新的v4.7.2，我在工程中使用的是react-router-dom的v4.1.1版本下的history，发现版本是v4.5.1。莫非是版本更新后改写了函数？查询最新的react-router-dom v4.2.2中使用的history版本是v4.7.2，即最新的版本。然后查看了官方文档的commit log，发现相关的内容是一年以前就写上的，而且是将原本的单参数改为了双参数，看来是在这一版本加入了传递state的功能。

{% asset_img 3.png version compare %}

时间是 2016-9-10

{% asset_img 4.png add push/replace %}

好的，再看react-router那边的版本时间，v4.1.1的发布时间是2017-4-13

{% asset_img 5.png relase time %}

那么就可以确定不是版本过早而修改功能的原因，那么到底是啥呢，俗话说：源码看不少， 装逼装到老。于是还是去源码找找问题吧。果然，在 history 源码的 createHashHistory 中的push函数是这样子：

{% asset_img 6.png source code %}

第二个参数若不为空则报错，并且在之后的执行过程中也只会对第一个参数进行操作，转化为location之后就返回继续做跳转操作了。这么看官方文档是有问题的。

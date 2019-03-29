---
title: JavaScript ES2018/ES9 新增标准
date: 2018-06-29 22:14:06
categories: 弱鸡之路
---

6 月 27 号, TC39 正式完成了[ES2018/ES9 的语言规范](https://tc39.github.io/ecma262/) 开始进入 ES2019 阶段.
最终阶段详情: [finished-proposals](https://github.com/tc39/proposals/blob/master/finished-proposals.md)
来看看 ES2018 比之前的 ES2017 新增了哪些规范.

## Object Rest/Spread Properties

对于对象的 Rest/Spread, 而之前标准只有数组是支持的. 说出来你可能不信, 这是 ES9 的特性, 我感觉都已经用了很久了…

```js
const obj = {x: 1, y: 2, z: 3}
const {x, ...rest} = obj
// x = 1, rest = { y: 2, z: 3 }
```

很实用的一点比如 React props 可以这样写

```js
render () {
	const { x, ...props } = this.props
	return <div {...props} />
}
```

## Asynchronous Iteration 异步迭代器

神奇的异步迭代器, 如果你之前这样写, 循环会依旧保持同步, 而异步独立于循环外, 为什么会导致这个情况想明白这个机制的同学可以去了解一下 js 事件循环.

```js
async function () {
  for await (const line of readLines(file)) {
  	// line by line
  }
}
```

## Promise.prototype.finally()

又一个以为早就有的特性, 当`promise`结束时稳定被触发(无论`resolve`, `reject`), 几乎是扫尾工作专用方法.

```js
fetch()
  .then(() => {
    // ...
  })
  .finally(Fn)
```

## 一系列正则优化

### `s` 标志和 `dotAll` 模式

之前 `.` 用于匹配任何单字符, 但有两个例外:

1.  无法匹配行结束符
  ```js
  ;/foo.bar/.test('foo\nbar')
  // → false
  ```
  行终结符:
  - U+000A LINE FEED (LF) (\n) - 换行
  - U+000D CARRIAGE RETURN (CR) (\r) - 回车
  - U+2028 LINE SEPARATOR - 行分隔符
  - U+2029 PARAGRAPH SEPARATOR - 段分隔符
    以及:
  - U+000B VERTICAL TAB (\v)
  - U+000C FORM FEED (\f)
  - U+0085 NEXT LINE
2.  多字节字符(非 BMP), 比如 Emoji:
  ```js
  ;/^.$/.test('😀')
  // → false
  ```
  曾经可以通过 `/u` 解决:
  ```js
  ;/^.$/u.test('😀')
  // → true
  ```

而在 ES9 中，新增加了一个新的标志 `s`, 让 `.` 可以匹配任意单字符.

```js
const re = /foo.bar/s // Or, `const re = new RegExp('foo.bar', 's');`.
re.test('foo\nbar')
// → true
re.dotAll
// → true
re.flags
// → 's'
```

### 命名捕获组(RegExp Named Capture Groups)

以前:

```js
const regex = /(\d{4})-(\d{2})-(\d{2})/
const matchers = regex.exec('2015-01-02')
matchers[0] // 2015-01-02
matchers[1] // 2015
matchers[2] // 01
matchers[3] // 02
```

现在:

```js
let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u
let result = re.exec('2015-01-02')
// result.groups.year === '2015';
// result.groups.month === '01';
// result.groups.day === '02';

// result[0] === '2015-01-02';
// result[1] === '2015';
// result[2] === '01';
// result[3] === '02';
```

解构一起用:
```js
let {
  groups: {one, two},
} = /^(?<one>.*):(?<two>.*)$/u.exec('foo:bar')
console.log(`one: ${one}, two: ${two}`) // prints one: foo, two: bar
```

反向引用:

```
let duplicate = /^(?<half>.*).\k<half>$/u;
duplicate.test('a*b'); // false
duplicate.test('a*a'); // true
```

跟数字捕获组一起使用:

```
let triplicate = /^(?<part>.*).\k<part>.\1$/u;
triplicate.test('a*a*a'); // true
triplicate.test('a*a*b'); // false
```

替换字符

```
let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;
let result = '2015-01-02'.replace(re, '$<day>/$<month>/$<year>');
// result === '02/01/2015'
```

### 反向断言(RegExp Lookbehind Assertions)

以往只支持正向断言, 现在支持了反向断言, 语法是 `(?<=...)`.

```js
/(?<=\$)\d+(\.\d*)?/
```

这个例子会匹配 `'$10.53'` 捕获返回 `'10.53'`, 但不会匹配 `€10.53`.

### Unicode转义(RegExp Unicode Property Escapes)

设置`\p{Script_Extensions}` 或 `\P{Script_Extensions}`, 使得在 JS 的正则中使用 Unicode 字符, 包括一些奇奇怪怪的字符. 举个例子比如希腊字母:

```js
const regexGreekSymbol = /\p{Script_Extensions=Greek}/u
regexGreekSymbol.test('π')
// → true
```

## 最后

目前大部分特性已经应用于主流浏览器了, 甚至有的早早就有, 也有一些正在实现过程中的. 但如果遇到要解决兼容性的问题还是得老老实实查 MDN, caniuse. 而 Node 端依然落后于标准设计, 这个有历史原因也有稳定性的要求. 新的标准出来的速度快其实大家也不用捉急, 原因在于生产中大部分时候我们其实用不到最新的标准, 或者已有其他的途径或老方法解决掉问题. 写出炫酷的代码不一定是最重要的, 能够解决掉问题才是最重要的. 而新标准更多的意义在于遇到真正刁钻问题的时候能够有解决方法或语言支持, 以及对代码抽象能力的提升, 性能的优化等.

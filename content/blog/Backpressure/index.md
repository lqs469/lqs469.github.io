---
title: Node.js Streams 中的背压(backpressure)
date: 2018-07-03 21:09:32
categories: 弱鸡之路
---

[原文](https://nodejs.org/en/docs/guides/backpressuring-in-streams/)

数据处理过程中经常出现一个称为**背压(backpressure)**的常见问题，用来描述数据传输过程中缓冲区后面的数据累积。当传送的接收端操作复杂时，或者由于某种原因而较慢时，来自传入源的数据有积聚的趋势，如堵塞。

为了解决这个问题，必须有一个授权系统来确保从一个源到另一个源的数据的平滑流动。不同的社区有根据其程序特点的独特解决方案，Unix pipes 和 TCP sockets 就是这方面的很好的例子，并且通常被称为流量控制。在Node.js中，Stream 是已被采用的解决方案。

本指南的目的是进一步详细说明背压是什么，以及流如何在Node.js的源代码中解决这个问题。本指南的第二部分将介绍建议的最佳实践，以确保您的应用程序的代码在实现流时安全和优化。

我们假设身为读者的你对 Node.js 中背压，`Buffer` 和 `EventEmitters` 的一般定义以及 Stream 的一些经验有点熟悉。如果您还没有阅读这些文档，首先查看API文档并不是一个坏主意，因为这将有助于在阅读本指南时扩展您的理解。

## 数据处理的问题
在计算机系统中，数据通过管道，套接字和信号(pipes, sockets, and signals)从一个进程传输到另一个进程。在 Node.js 中，我们找到了一个名为 Stream 的类似机制。Stream 很棒！他们为 Node.js 做了很多工作，几乎内部代码库的每个部分都利用该模块。作为一名开发人员，鼓励您去使用它们！

```js
const readline = require('readline');

// process.stdin and process.stdout are both instances of Streams
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Why should you use streams? ', (answer) => {
  console.log(`Maybe it's ${answer}, maybe it's because they are awesome! :)`);

  rl.close();
});
```

通过比较 Node.js Stream 实现的内部系统工具，可以证明为什么通过 **Stream** 实现 **backpressure** 机制是一个很好的优化。

在一种情况下，我们将采用大文件(大约9GB) 并使用熟悉的`zip(1)`工具对其进行压缩。

```
$ zip The.Matrix.1080p.mkv
```

虽然这需要几分钟的时间才能完成，在另一个shell中，我们可以运行一个采用 Node.js 的模块 `zlib` 的脚本，该脚本包含另一个压缩工具 `gzip(1)`。

```js
const gzip = require('zlib').createGzip();
const fs = require('fs');

const inp = fs.createReadStream('The.Matrix.1080p.mkv');
const out = fs.createWriteStream('The.Matrix.1080p.mkv.gz');

inp.pipe(gzip).pipe(out);
```

然后来验证结果，尝试打开每个压缩文件。由 `zip(1)` 工具压缩的文件将通知您文件已损坏，而由 Stream 完成的压缩将无错地解压缩。

注意：在本例中，我们使用 `.pipe()` 从一端到另一端获取数据源。但是，请注意，没有附加适当的错误处理程序。如果大量数据无法正确接收，则可读源或 `gzip` 流不会被销毁。`.pump` 是一个很实用工具，如果其中一个失败或关闭，它将稳定无误地销毁管道中的所有流，并且在这种情况下是必须的！

## 数据太多, 太快
有些情况下，可读流可能太快地将数据提供给`Writable` - 远远超过消费者可以处理的数量！

当发生这种情况时，消费者将开始排列所有数据块以供以后使用。写入队列将变得越来越长，并且因为这个更多的数据必须保存在内存中，直到整个过程完成。

写入磁盘比从磁盘读取要慢很多，因此，当我们试图压缩文件并将其写入硬盘时，就会发生背压，因为写入磁盘将无法跟上速度阅读。

```js
// Secretly the stream is saying: "whoa, whoa! hang on, this is way too much!"
// Data will begin to build up on the read-side of the data buffer as
// `write` tries to keep up with the incoming data flow.
inp.pipe(gzip).pipe(outputFile);
```

这就是背压机制很重要的原因。如果背压系统不存在，这个过程将耗尽系统的内存，严重减缓其他的过程，并垄断大部分系统资源直到完成。

结局如下:
- 放慢所有其他现有流程
- 一个非常劳累过度的垃圾收集器
- 内存耗尽

在以下示例中，我们将取出`.write()` 函数的返回值并将其更改为 true，这有效地禁用了Node.js内核中的背压支持。在任何对“修改”二进制文件的引用中，我们都在讨论如何运行没有 `return ret;` 的节点二进制 (node binary) 文件线，而替换为 `return true` ;

## 过量的垃圾收集
让我们看看一个快速的基准。使用上面的同一个例子，我们进行了几次试验，以获得两个二进制文件的中位时间。

```
   trial (#)  | `node` binary (ms) | modified `node` binary (ms)
=================================================================
      1       |      56924         |           55011
      2       |      52686         |           55869
      3       |      59479         |           54043
      4       |      54473         |           55229
      5       |      52933         |           59723
=================================================================
average time: |      55299         |           55975
```

两者都花费一分钟左右的时间，所以根本没什么区别，但让我们仔细观察一下，以确认我们的猜测是否正确。我们使用 Linux 工具 `dtrace` 来评估V8垃圾收集器的情况。

GC（垃圾回收器）测量的时间表示垃圾收集器完成的单次扫描的完整周期的时间间隔：

```
approx. time (ms) | GC (ms) | modified GC (ms)
=================================================
          0       |    0    |      0
          1       |    0    |      0
         40       |    0    |      2
        170       |    3    |      1
        300       |    3    |      1

         *             *           *
         *             *           *
         *             *           *

      39000       |    6    |     26
      42000       |    6    |     21
      47000       |    5    |     32
      50000       |    8    |     28
      54000       |    6    |     35
```

虽然这两种方法的起始时间相同，并且似乎以相同的速度工作，但显然在几秒钟后使用正确工作的反压系统GC负荷会以4-8毫秒的间隔持续扩散，直到数据传输结束。

但是，当背压系统不在时，V8垃圾回收系统开始拖延。正常的二进制文件在一分钟内调用GC约75次，而修改后的二进制文件只触发36次。

这是由于记忆体使用量增加而累积的缓慢而渐进的债务。随着数据的传输，如果没有背压系统，每个块传输都会使用更多的内存。

分配的内存越多，GC就必须在一次扫描中处理得越多。扫描越大，GC需要决定什么可以释放，并且在更大的内存空间中扫描分离的指针会消耗更多的计算能力。

## 内存耗尽
为了确定每个二进制文件的内存消耗，我们为每个进程分别设定了`/usr/bin/time -lp sudo ./node ./backpressure-example/zlib.js`。

这是正常二进制的输出：
```
Respecting the return value of .write()
=============================================
real        58.88
user        56.79
sys          8.79
  87810048  maximum resident set size
         0  average shared memory size
         0  average unshared data size
         0  average unshared stack size
     19427  page reclaims
      3134  page faults
         0  swaps
         5  block input operations
       194  block output operations
         0  messages sent
         0  messages received
         1  signals received
        12  voluntary context switches
    666037  involuntary context switches
```

虚拟内存占用的最大字节大小约为87.81 mb。 现在改变 `.write()` 函数的返回值，我们得到：

```
Without respecting the return value of .write():
==================================================
real        54.48
user        53.15
sys          7.43
1524965376  maximum resident set size
         0  average shared memory size
         0  average unshared data size
         0  average unshared stack size
    373617  page reclaims
      3139  page faults
         0  swaps
        18  block input operations
       199  block output operations
         0  messages sent
         0  messages received
         1  signals received
        25  voluntary context switches
    629566  involuntary context switches
```

虚拟内存占用的最大字节大小约为1.52 gb。

如果没有适当的 Stream backpressure，分配的内存空间就会增加一个数量级 - 这是同一过程之间的巨大差异！

这个实验展示了 Node.js 的背压机制是如何针对您的计算系统优化和具有成本效益的。现在，让我们分析一下它的工作原理！

## 背压是如何解决这些问题的?
有不同的功能将数据从一个进程传输到另一个进程。在Node.js中，有一个名为`.pipe()`的内部内置函数。还有其他的软件包也可以使用！但最终，在这个过程的基本层面上，我们有两个独立的组件：数据源和消费者。

当从源调用`.pipe()`时，它向消费者发出信号，告知有数据要传输。管道功能有助于为事件触发器设置适当的背压闭合。

在Node.js中，源是可读流，而消费者是可写流（这两者可以与双工或转换流互换，但对于本指南而言，这是超出范围的）。

触发背压的时刻可以精确地缩小到Writable的`.write()`函数的返回值。当然，这个返回值由几个条件决定。

在数据缓冲区已超过`highWaterMark`或写入队列当前正忙的任何情况下，`.write()`将返回`false`。

当返回错误值时，背压系统启动。它将暂停传入的可读流发送任何数据并等待消费者再次准备就绪。清空数据缓冲区后，将发出`.drain()`事件并恢复传入的数据流。

队列完成后，背压将允许再次发送数据。正在使用的内存空间将自行释放并为下一批数据做好准备。

这有效地允许在任何给定时间为`.pipe()`函数使用固定数量的内存。没有内存泄漏，没有无限缓冲，垃圾收集器只需要处理内存中的一个区域！

那么，如果背压如此重要，为什么你（可能）没有听说过它？那么答案很简单：Node.js自动完成所有这些。

太棒了！但是当我们试图理解如何实现我们自己的自定义流时也不是那么好。

注意：在大多数机器中，有一个字节大小决定缓冲区何时已满（这将在不同的机器上有所不同）。 Node.js允许您设置自己的自定义highWaterMark，但通常，默认设置为16kb（对于objectMode流，为16384或16）。在某些情况下，您可能需要提高该值，但请谨慎行事！


## `.pipe()`的生命周期
为了更好地理解背压，下面是一个可读流的生命周期的流程图，该流被导入到可写流中：

```
                                                     +===================+
                         x-->  Piping functions   +-->   src.pipe(dest)  |
                         x     are set up during     |===================|
                         x     the .pipe method.     |  Event callbacks  |
  +===============+      x                           |-------------------|
  |   Your Data   |      x     They exist outside    | .on('close', cb)  |
  +=======+=======+      x     the data flow, but    | .on('data', cb)   |
          |              x     importantly attach    | .on('drain', cb)  |
          |              x     events, and their     | .on('unpipe', cb) |
+---------v---------+    x     respective callbacks. | .on('error', cb)  |
|  Readable Stream  +----+                           | .on('finish', cb) |
+-^-------^-------^-+    |                           | .on('end', cb)    |
  ^       |       ^      |                           +-------------------+
  |       |       |      |
  |       ^       |      |
  ^       ^       ^      |    +-------------------+         +=================+
  ^       |       ^      +---->  Writable Stream  +--------->  .write(chunk)  |
  |       |       |           +-------------------+         +=======+=========+
  |       |       |                                                 |
  |       ^       |                              +------------------v---------+
  ^       |       +-> if (!chunk)                |    Is this chunk too big?  |
  ^       |       |     emit .end();             |    Is the queue busy?      |
  |       |       +-> else                       +-------+----------------+---+
  |       ^       |     emit .write();                   |                |
  |       ^       ^                                   +--v---+        +---v---+
  |       |       ^-----------------------------------<  No  |        |  Yes  |
  ^       |                                           +------+        +---v---+
  ^       |                                                               |
  |       ^               emit .pause();          +=================+     |
  |       ^---------------^-----------------------+  return false;  <-----+---+
  |                                               +=================+         |
  |                                                                           |
  ^            when queue is empty     +============+                         |
  ^------------^-----------------------<  Buffering |                         |
               |                       |============|                         |
               +> emit .drain();       |  ^Buffer^  |                         |
               +> emit .resume();      +------------+                         |
                                       |  ^Buffer^  |                         |
                                       +------------+   add chunk to queue    |
                                       |            <---^---------------------<
                                       +============+
```

注意：如果您正在设置一个管道以将几个流链接在一起来操纵数据，那么您很可能会实现Transform流。

在这种情况下，来自可读流的输出将输入到Transform中，并将流入Writable。

```
Readable.pipe(Transformable).pipe(Writable);
```

背压将自动应用，但请注意转换流的输入和输出`highWaterMark`可能会被操纵，并会影响反压系统。

## 背压指南
由于Node.js v0.10，Stream类提供了使用这些函数（`._read()和._write()`）的下划线版本来修改`.read()`或`.write()`的行为的功能。 。

有关于实现可读流和实现可写流的指导文件。我们假设你已经阅读了这些内容，下一节将更深入一点。

## 实现自定义流时遵守的规则
`Stream`的黄金法则是始终尊重背压。最佳实践的构成是非矛盾的做法。只要你小心避免与内部背压支持相冲突的行为，就可以确定你正在遵循良好的做法。

一般来说:
1. 如果没有询问，请不要使用`.push()`。
2. 永远不要在返回false后调用`.write()`，而是等待'drain'。
3. Streams在不同的Node.js版本和您使用的库之间进行更改。要小心注意并测试一下。

注意：关于第3点，构建浏览器流的非常有用的包是`readable-stream`。 Rodd Vagg撰写了一篇很棒的博客文章，描述了这个库的实用性。简而言之，它为可读流提供了一种自动优雅降级，并支持旧版本的浏览器和Node.js.

## 可读流的特定规则
到目前为止，我们已经了解了`.write()`如何影响背压，并将重点放在`Writable`流上。由于Node.js的功能，数据在技术上从可读流向下游流向可写。但是，正如我们可以在数据，物质或能量的任何传输中观察到的那样，源与目标一样重要，可读流对于如何处理背压至关重要。

这两个进程都依赖于另一个进行有效的通信，如果`Readable`忽略了当`Writable`流要求它停止发送数据时，它可能与`.write()`的返回值不正确时一样有问题。

因此，在尊重`.write()`返回时，我们还必须尊重`._read()`方法中使用的`.push()`的返回值。如果`.push()`返回一个假值，则该流将停止从源读取。否则，它将继续而不会暂停。

这有个使用`.push()`的反例
```
// This is problematic as it completely ignores return value from push
// which may be a signal for backpressure from the destination stream!
class MyReadable extends Readable {
  _read(size) {
    let chunk;
    while (null !== (chunk = getNextChunk())) {
      this.push(chunk);
    }
  }
}
```

另外，从定制流的外部来看，忽视背压是非常重要的。在这个良好实践的反例中，应用程序的代码在数据可用时强制数据（由`.data`事件发送信号）：

```
// This ignores the backpressure mechanisms Node.js has set in place,
// and unconditionally pushes through data, regardless if the
// destination stream is ready for it or not.
readable.on('data', (data) =>
  writable.write(data)
);
```

## 可写流的特定规则
回想一下`.write()`可能会根据某些条件返回true或false。幸运的是，在构建我们自己的可写流时，流状态机将处理我们的回调并确定何时处理背压并为我们优化数据流。

但是，当我们想直接使用Writable时，我们必须尊重`.write()`返回值并密切注意这些条件：

- 如果写队列忙，.`write()`将返回false。
- 如果数据块太大，`.write()`将返回false（该值由变量highWaterMark指示）。

```
// This writable is invalid because of the async nature of JavaScript callbacks.
// Without a return statement for each callback prior to the last,
// there is a great chance multiple callbacks will be called.
class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    if (chunk.toString().indexOf('a') >= 0)
      callback();
    else if (chunk.toString().indexOf('b') >= 0)
      callback();
    callback();
  }
}

// The proper way to write this would be:
    if (chunk.contains('a'))
      return callback();
    else if (chunk.contains('b'))
      return callback();
    callback();
```

在实现`._writev()`时还需要注意一些事项。该函数与`.cork()`结合使用，但写入时常见错误：

```
// Using .uncork() twice here makes two calls on the C++ layer, rendering the
// cork/uncork technique useless.
ws.cork();
ws.write('hello ');
ws.write('world ');
ws.uncork();

ws.cork();
ws.write('from ');
ws.write('Matteo');
ws.uncork();

// The correct way to write this is to utilize process.nextTick(), which fires
// on the next event loop.
ws.cork();
ws.write('hello ');
ws.write('world ');
process.nextTick(doUncork, ws);

ws.cork();
ws.write('from ');
ws.write('Matteo');
process.nextTick(doUncork, ws);

// as a global function
function doUncork(stream) {
  stream.uncork();
}
```

`.cork()`可以被调用多次，我们只需要小心调用`.uncork()`相同的次数，使其再次流动。

## 结论
Streams是Node.js中经常使用的模块。它们对于内部结构非常重要，对于开发人员来说，它们可以跨Node.js模块生态系统进行扩展和连接。

希望您现在能够排除故障，安全地编写您自己的可写和可读流的背景，并与同事和朋友分享您的知识。

在使用Node.js构建应用程序时，请务必阅读有关其他API函数的Stream的更多信息，以帮助改进和释放您的流功能。

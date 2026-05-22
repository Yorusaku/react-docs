# JavaScript核心与ES6知识卡片

文档定位：适用于 5-10 年前端工程师系统复习、面试准备、手写题训练和底层原理查漏补缺。学习目标不是只知道“是什么”，而是能讲清“为什么这样设计、边界在哪里、工程里怎么落地、面试里怎么表达”。

## 目录

1. 语言基础与值模型
2. 作用域、执行上下文与闭包
3. this、函数调用与对象创建
4. 原型链、继承与类
5. 集合、键值结构与元编程
6. 异步体系、事件循环与 Promise
7. 迭代协议、Generator 与 async/await
8. 模块化与工程边界
9. 浏览器运行时、性能与内存管理
10. 设计模式与前端常见抽象
11. 高频手写题与追问
12. 高频面试题与分层展开

# 1 语言基础与值模型

## 1.1 JavaScript 的值到底怎么分

### 定位

这一节先把 JavaScript 最基础但也最容易被讲浅的内容收住。很多后面的坑，比如隐式转换、拷贝、闭包持有、对象遍历、Map 和 WeakMap 的选择，都和“值是什么”直接相关。

### 必会结论

1. JavaScript 的值可以先分成原始值和对象值两大类。
2. 原始类型一共有 string、number、boolean、null、undefined、symbol、bigint。
3. 除原始类型外，其余都属于对象类型，包括普通对象、数组、函数、日期、正则、Map、Set。
4. 面试里不要把“原始类型一定在栈、引用类型一定在堆”当成规范结论去背，因为 ECMAScript 规范不规定底层内存布局。

### 核心理解

JavaScript 最重要的第一层区分不是“是不是对象语法”，而是“这个值是不是原始值”。原始值的特点是不可变，字符串拼接、数字运算、布尔转换看起来像在“修改原值”，本质上都是产生新值。对象则更像一块可被多处引用的结构，变量里保存的是对它的访问入口。也正因为如此，后面一旦涉及函数传参、拷贝、闭包、缓存和状态共享，就一定要先判断你在处理的是原始值还是对象值。

### 代码抓手

```js
let a = 'foo'
let b = a
b = b + 'bar'
console.log(a) // 'foo'
console.log(b) // 'foobar'

const obj1 = { count: 1 }
const obj2 = obj1
obj2.count++
console.log(obj1.count) // 2
```

### 常见坑

1. 把 function 当成“不是对象”，实际上函数也是对象，只是 `typeof fn === 'function'` 是一个特殊历史分支。
2. 把 null 当成对象类型，实际上它不是对象，只是 `typeof null` 的历史遗留结果是 `'object'`。
3. 把“引用类型”说成“按引用传递”，更准确的说法通常是“对象值参与时，会传递引用值的副本”。

### 面试展开

如果面试官问 JS 数据类型，我一般不会只背 7 个原始类型。我会先说：JavaScript 的值可以先分成原始值和对象值。原始值不可变，对象值通过引用入口访问。很多工程问题，比如浅拷贝、深拷贝、闭包持有、Map/WeakMap 选型，本质都建立在这层差异上。

## 1.2 类型判断怎么答才不浅

### 定位

这一节不是罗列 API，而是讲“不同判断方案分别解决什么问题、边界在哪儿”。

### 必会结论

1. typeof 适合判断大部分原始类型和函数，但对 null、数组、普通对象不够精确。
2. `Array.isArray()` 是判断数组最稳妥的方案。
3. `Object.prototype.toString.call(value)` 适合做更精确的内置类型判断。
4. instanceof 判断的是原型链关系，不是类型系统意义上的“绝对真相”。

### 核心理解

类型判断不能只问“哪个最准”，而要问“你要判断的到底是什么”。如果只是想区分字符串、数字、布尔、函数，typeof 已经很够用；如果你要判断数组，用 `Array.isArray` 更直接也更稳定；如果你要区分 Date、RegExp、Map、Set 这类内置对象，`Object.prototype.toString.call()` 更精确；如果你要判断某个实例是否来自某个构造函数，instanceof 才是更自然的工具。真正成熟的回答不是背一个“终极方案”，而是知道每个方案的适用边界。

### 代码抓手

```js
console.log(typeof 'x') // 'string'
console.log(typeof 1) // 'number'
console.log(typeof true) // 'boolean'
console.log(typeof undefined) // 'undefined'
console.log(typeof Symbol()) // 'symbol'
console.log(typeof 1n) // 'bigint'
console.log(typeof function () {}) // 'function'
console.log(typeof null) // 'object'
console.log(typeof []) // 'object'

console.log(Array.isArray([])) // true
console.log(Object.prototype.toString.call(new Date())) // [object Date]
console.log(Object.prototype.toString.call(/x/)) // [object RegExp]
console.log([] instanceof Array) // true
```

### 常见坑

1. `typeof null === 'object'`，但 null 不是对象。
2. `typeof [] === 'object'`，不能拿 typeof 判断数组。
3. instanceof 在跨 iframe、跨 realm 场景下可能失效，因为原型链不是同一份。
4. `Object.prototype.toString.call()` 也不是绝对不可伪造，因为 `Symbol.toStringTag` 可以影响结果。

### 面试展开

比较稳的回答是：类型判断没有单一银弹。typeof 适合原始类型和函数，`Array.isArray` 专门判断数组，`Object.prototype.toString.call` 适合精确识别内置对象，instanceof 则更适合判断实例关系。也就是说，判断方案取决于你到底想判断“值的类别”还是“原型链来源”。

## 1.3 number、NaN、BigInt 为什么总被追问

### 定位

这一节处理 JavaScript 数值模型最常见的面试切入口。

### 必会结论

1. JavaScript 常规数值类型只有一种：number。
2. number 基于 IEEE 754 双精度浮点数，所以会有精度问题和安全整数边界问题。
3. NaN 的类型是 number，而且 `NaN !== NaN`。
4. 超过安全整数范围的大整数场景，应优先考虑 BigInt。

### 核心理解

JavaScript 选择只保留一种常规数值类型，换来的是语言层面的统一性，但代价就是浮点精度和安全整数问题会直接暴露到业务里。最典型的例子就是 `0.1 + 0.2 !== 0.3`。这并不是 JavaScript“算错了”，而是二进制浮点表示本身带来的近似误差。另一类问题是安全整数边界，当值超过 `Number.MAX_SAFE_INTEGER` 后，整数就不能再被可靠地精确表示。这时如果还坚持使用 number，很多对比和累加都可能失真。

### 代码抓手

```js
console.log(0.1 + 0.2) // 0.30000000000000004
console.log(Number.MAX_SAFE_INTEGER) // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER) // -9007199254740991
console.log(Number.isSafeInteger(9007199254740991)) // true
console.log(Number.isSafeInteger(9007199254740992)) // false

console.log(typeof NaN) // 'number'
console.log(NaN === NaN) // false
console.log(Number.isNaN(NaN)) // true
console.log(isNaN('foo')) // true
console.log(Number.isNaN('foo')) // false

console.log(9007199254740993n - 1n) // 9007199254740992n
```

### 常见坑

1. 用全局 `isNaN()` 判断是否是 NaN，却忽略它会先做类型转换。
2. 把 BigInt 当成“更大的 number”，其实它是另一套整数语义，不能和 number 直接混算。
3. 金额和大整数 ID 场景还继续直接用浮点数做精确计算。

### 面试展开

如果被问 JS 数值模型，我会说：JS 只有一种常规数值类型 number，它基于 IEEE 754 双精度浮点数，所以会带来浮点精度误差和安全整数边界问题。NaN 也是 number，只是代表无效数值结果；而 BigInt 适合超出安全整数范围的大整数运算，但它有自己的算术和兼容边界。

## 1.4 隐式类型转换为什么是面试高频坑

### 定位

这一节专门处理 JavaScript 里最容易“背例子但不懂规则”的部分。

### 必会结论

1. `==` 会先做类型转换再比较，工程里除非语义非常明确，否则优先使用 `===`。
2. `+` 同时承担数值运算和字符串拼接两种语义。
3. `Boolean()` 的真假值规则必须熟。
4. `Object.is()` 和 `===` 很接近，但在 NaN 和 `+0/-0` 上有关键差异。

### 核心理解

隐式转换最麻烦的地方不是规则多，而是它会在你没明确表达意图时替你做决定。比如表单值、URL 参数、localStorage、后端接口响应，经常天然就是字符串；如果你直接拿来加减比较，很容易得到看似“诡异”但其实符合语言规则的结果。成熟的工程习惯不是把所有规则背成口诀，而是默认显式转换：要数字就 `Number()`，要布尔就明确判断，要比较就优先 `===`。

### 代码抓手

```js
console.log('5' + 1) // '51'
console.log('5' - 1) // 4
console.log([] == ![]) // true
console.log(Boolean(0)) // false
console.log(Boolean(NaN)) // false
console.log(Boolean('')) // false
console.log(Boolean([])) // true
console.log(Boolean({})) // true
console.log(Object.is(NaN, NaN)) // true
console.log(Object.is(+0, -0)) // false
console.log(+0 === -0) // true
```

### 常见坑

1. 只会背 `[] == ![]`，但讲不清背后的转换链路。
2. 看到 `0`、`''`、false 就默认当成“没值”，导致默认值逻辑写错。
3. 混用 `||` 和空值判断，结果把合法的 `0`、空字符串误伤。

### 面试展开

比较稳的说法是：JS 隐式转换最大的问题不是语言难，而是业务输入天然很多都不是你以为的类型。表单、URL、缓存、接口都偏字符串，如果不主动做显式转换，就很容易踩坑。所以工程里我更倾向显式表达类型意图，而不是依赖 `==` 和隐式 coercion。

## 1.5 值传递、引用值与拷贝语义

### 定位

这一节把“函数传参、共享状态、浅拷贝、深拷贝”放回同一个逻辑里理解。

### 必会结论

1. JavaScript 函数传参本质上是值传递。
2. 当参数是对象时，传递的是“引用值的副本”，所以能改内部属性，但不能改外部变量绑定。
3. `Object.assign()`、对象展开、数组 slice/concat 都是浅拷贝。
4. `JSON.parse(JSON.stringify())` 只是非常受限的“序列化再还原”，不能当通用深拷贝。

### 核心理解

很多人把对象传参讲成“按引用传递”，其实更稳的表述是：对象场景下传递的是引用值的副本。你拿到的是一份新的入口地址值，这份值仍然指向同一对象，所以你改对象内部属性，外部能感知；但如果你把参数重新赋值成另一个对象，外部原变量绑定不会变。理解了这一点，后面的浅拷贝、深拷贝和状态共享问题就不会乱。

### 代码抓手

```js
function updateUser(user) {
    user.name = 'new'
    user = { name: 'other' }
}
const user = { name: 'old' }
updateUser(user)
console.log(user.name) // 'new'

const state = {
    user: { name: 'miaoma' },
    tags: ['js'],
}
const shallow = { ...state }
shallow.user.name = 'es'
console.log(state.user.name) // 'es'
```

### 常见坑

1. 把对象参数重新赋值后，以为会影响外部变量。
2. 把对象展开和 `Object.assign()` 当成深拷贝。
3. 把 `JSON.parse(JSON.stringify())` 当通用深拷贝，忽略它会丢 undefined、symbol、函数、Date、RegExp，还无法处理循环引用。
4. 不了解 `structuredClone()` 的边界，以为它能保留函数和自定义原型行为。

### 面试展开

如果面试官问“JS 是值传递还是引用传递”，我会说：JS 函数传参本质上都是值传递。只是对象场景下，这个“值”恰好是引用值，所以修改对象内部属性会影响外部，但给参数重新赋新对象不会影响外部变量绑定。

## 1.6 对象属性不只是键和值

### 定位

这一节把对象模型往前推进一步，避免把对象理解成“纯 key-value 表”。

### 必会结论

1. 对象属性除了值，还有 writable、enumerable、configurable、get、set 等描述符。
2. 不同取键 API 的覆盖范围不同。
3. 对象遍历方式不同，能遍历到的内容也不同。

### 核心理解

对象属性不是简单的“键和值”，它还携带能不能改、能不能枚举、能不能删除、是不是访问器等元信息。也正因为如此，浅拷贝、深拷贝、对象遍历和元编程都不能只盯着 `Object.keys()`。如果你只拿可枚举字符串键，那 Symbol、不可枚举属性、访问器描述信息就都被漏掉了。这个差异在业务代码里也许不高频，但在手写题、框架机制和底层封装里非常重要。

### 代码抓手

```js
const sym = Symbol('id')
const obj = {}
Object.defineProperty(obj, 'hidden', {
    value: 1,
    enumerable: false,
})
obj.name = 'miaoma'
obj[sym] = 100

console.log(Object.keys(obj)) // ['name']
console.log(Object.getOwnPropertyNames(obj)) // ['hidden', 'name']
console.log(Object.getOwnPropertySymbols(obj)) // [Symbol(id)]
console.log(Reflect.ownKeys(obj)) // ['hidden', 'name', Symbol(id)]
```

### 常见坑

1. 用 `for...in` 遍历对象，却忘了它会扫到原型链上的可枚举字符串键。
2. 误以为 `for...of` 能直接遍历普通对象。
3. 深拷贝时只用 `Object.keys()`，结果漏掉 Symbol 和不可枚举属性。

### 面试展开

更成熟的答法是：对象属性不只是键和值，还有属性描述符。遍历对象时要先明确你到底要的是“自身可枚举字符串键”，还是“所有自身键”，还是“包含 Symbol 的完整键集合”。不同 API 的设计目标不一样，不能混用。

## 1.7 freeze、seal、preventExtensions 和值模型边界

### 定位

这一节处理对象“可变性控制”的最常见面试收尾题。

### 必会结论

1. `Object.preventExtensions()` 只禁止新增属性。
2. `Object.seal()` 在不可扩展基础上，再禁止删除和重新配置属性。
3. `Object.freeze()` 最严格，会让已有数据属性也不可写。
4. 这三个默认都只作用于当前层，不是深层冻结。

### 核心理解

这三个 API 的共同点，都是控制“对象本身的结构和属性描述符”，而不是递归冻结整个对象图。很多人看到 freeze 就以为对象“彻底不可变”了，其实如果内部嵌套对象没有一起冻结，内部状态仍然可以被改。也就是说，它们更像是对象边界控制工具，而不是完整的不可变数据方案。

### 代码抓手

```js
const obj = {
    info: { count: 1 },
}
Object.freeze(obj)
obj.info.count++
console.log(obj.info.count) // 2
```

### 常见坑

1. 以为 freeze 会自动深层冻结所有嵌套对象。
2. 把这三个 API 的差异背反了。
3. 把“冻结对象”当成应用层状态管理的完整答案。

### 面试展开

如果被问这三者区别，我会先按能力范围回答：preventExtensions 只禁新增，seal 再禁删除和重新配置，freeze 再进一步禁写已有值。但我会补一句，它们默认只作用于当前层，不会自动深冻结，这个边界是很容易答错的。

## 1.8 第一章速记

### 定位

这一节给面试前快速回忆。

### 必会结论

1. 先分清原始值和对象值，再去看拷贝、传参和状态共享。
2. 类型判断没有单一银弹，要看目标是“类别判断”还是“原型链判断”。
3. number 统一了数值语义，但也带来了浮点精度和安全整数边界问题。
4. 隐式转换最大的问题不是规则多，而是业务输入天然容易带偏类型。
5. 对象属性有描述符，遍历和拷贝都不能只盯着键值本身。

### 面试展开

如果让我用 30 秒收口这一章，我会说：JavaScript 的第一层心智是“值模型”，也就是原始值和对象值怎么工作。类型判断、数值边界、隐式转换、传参和拷贝、对象属性描述符，其实都在回答同一件事：这个值在语言里到底是怎么被表示、比较、共享和约束的。

# 2 作用域、执行上下文与闭包

## 2.1 执行上下文与调用栈

### 定位

这一节先回答“代码运行时到底发生了什么”。作用域、变量提升、闭包、this 都不能只从语法表面理解，它们都和执行上下文有关。

### 必会结论

1. JavaScript 代码执行时会进入执行上下文。
2. 全局代码对应全局执行上下文，函数调用会创建函数执行上下文。
3. 多个执行上下文由调用栈管理，调用栈遵循后进先出。
4. 变量提升不是代码真的移动，而是上下文创建阶段先建立绑定。

### 核心理解

执行上下文可以理解成一段代码运行时需要的环境记录。它通常包含词法环境、变量环境、this 绑定和外部环境引用。函数每调用一次，就会创建新的函数执行上下文并压入调用栈，函数执行完成后再出栈。理解这件事后，递归为什么会栈溢出、闭包为什么能保留外层变量、变量为什么能在声明前被“看到”，都会更容易解释。

### 代码抓手

```js
function a() {
    b()
}
function b() {
    c()
}
function c() {
    console.log('run')
}
a()
// 调用栈心智：global -> a -> b -> c -> b -> a -> global
```

### 常见坑

1. 把变量提升理解成代码文本真的被挪到顶部。
2. 只会背“栈先进后出”，却不会结合函数调用解释。
3. 把执行上下文和作用域混为一谈，前者是运行时环境，后者更多是变量查找规则。

### 面试展开

如果面试官问执行上下文，我会说：它是代码执行时创建的运行环境，包含词法环境、变量环境、this 绑定和外部环境引用。函数调用会创建新的执行上下文并压入调用栈，所以调用栈就是 JS 管理函数执行顺序和返回路径的结构。

## 2.2 词法作用域与作用域链

### 定位

这一节把“变量从哪里找”讲清楚。后面闭包、模块作用域、TDZ 都建立在这个基础上。

### 必会结论

1. JavaScript 是词法作用域语言，作用域在定义时确定，不在调用时确定。
2. 变量查找会先找当前作用域，找不到再沿外层作用域查找，这就是作用域链。
3. var 是函数作用域，let、const 是块级作用域。
4. 作用域链解决“变量从哪里找”，this 解决“函数以谁为上下文执行”，两者不能混讲。

### 核心理解

词法作用域的关键是“看代码写在哪里”，不是“看函数在哪里调用”。一个函数能访问哪些变量，在它定义时就已经由外层词法环境决定。调用位置可以改变 this，但不能改变函数的词法作用域。这也是闭包成立的基础：函数会记住它定义时的外层环境，而不是调用时临时去找。

### 代码抓手

```js
const name = 'global'
function outer() {
    const name = 'outer'
    return function inner() {
        console.log(name)
    }
}
const fn = outer()
fn() // 'outer'
```

### 常见坑

1. 把作用域链和 this 绑定规则混在一起讲。
2. 以为函数在哪里调用，就在哪里找变量。
3. 只知道 var 会提升，不知道 let/const 有块级作用域和暂时性死区。

### 面试展开

更稳的表达是：JS 的作用域是词法作用域，变量查找由定义位置决定。函数执行时如果当前作用域找不到变量，就沿着定义时的外层作用域逐级查找。这个链路就是作用域链。

## 2.3 var、let、const 的本质区别

### 定位

这一节把 ES6 的变量绑定放回作用域主线里，而不是单独当新语法背。

### 必会结论

1. var 是函数作用域，存在变量提升，可以重复声明。
2. let 和 const 是块级作用域，存在暂时性死区。
3. const 约束的是绑定不可重新赋值，不是值深不可变。
4. `for (let i = 0; ...)` 每轮循环会创建新的绑定，适合异步回调场景。

### 核心理解

let/const 真正解决的是作用域边界问题。var 的函数作用域很容易把变量泄漏到超出预期的范围，尤其是在循环和异步回调里。let 的块级作用域让变量生命周期更贴近代码块，const 则让绑定关系更稳定。所谓暂时性死区，不是变量不存在，而是在声明初始化前不允许访问。

### 代码抓手

```js
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('var', i), 0)
}
// var 3 3 3

for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('let', j), 0)
}
// let 0 1 2

const obj = { count: 1 }
obj.count++
console.log(obj.count) // 2
```

### 常见坑

1. 以为 const 声明的对象内部也不能改。
2. 以为 typeof 一定安全，实际上在 TDZ 中访问 let/const 也会抛错。
3. 只把 let/const 理解成“新版 var”，忽略它们解决的是作用域和绑定边界。

### 面试展开

我会这样讲：let 真正带来的是块级作用域和更清晰的生命周期，const 真正保证的是绑定稳定，不是深不可变。现代工程里默认优先 const，需要重赋值再用 let，基本不再主动使用 var。

## 2.4 闭包的本质

### 定位

这一节处理 JavaScript 面试最经典的问题之一，但重点不是背定义，而是讲清它为什么存在。

### 必会结论

1. 闭包的本质是函数持有其定义时所在词法环境的引用。
2. 外层函数执行结束后，如果内部函数仍被引用，相关变量不会立刻销毁。
3. 闭包不是内存泄漏本身，但它可能延长变量生命周期。

### 核心理解

闭包不是某种特殊语法，而是词法作用域和函数一等公民共同带来的自然结果。函数可以被返回、传递和保存，只要这个函数内部还引用了外层变量，外层变量所在的词法环境就不能被释放。闭包的价值在于保存状态、封装私有变量、实现缓存、防抖节流、柯里化等；它的风险在于可能长期持有不再需要的大对象、DOM 或旧状态。

### 代码抓手

```js
function createCounter() {
    let count = 0
    return function add() {
        count++
        return count
    }
}
const counter = createCounter()
console.log(counter()) // 1
console.log(counter()) // 2
```

### 常见坑

1. 把闭包等同于内存泄漏。
2. 只会说“函数套函数就是闭包”，但讲不清持有词法环境引用。
3. 忽略闭包会让变量生命周期变长。

### 面试展开

更准确的说法是：闭包是函数保存其定义时词法环境引用的机制。它本身不是问题，问题是闭包长期持有已经不需要的数据，导致这些数据无法被垃圾回收。

## 2.5 闭包的工程边界

### 定位

这一节把闭包从概念题拉回工程场景。

### 必会结论

1. 闭包常用于私有变量、状态保存、缓存、防抖节流、回调上下文。
2. 闭包可能导致旧状态、旧参数、DOM、订阅器被长期持有。
3. 工程里要在组件卸载、事件解绑、缓存过期时主动释放不再需要的引用。

### 核心理解

闭包真正容易出问题的地方，不是“用了闭包”，而是“闭包还在，但里面保存的数据已经没用了”。比如事件监听器没有移除，监听函数闭包里持有页面状态；防抖函数长期存在，里面保存旧参数；缓存函数没有过期策略，持续持有大对象。这些都不是闭包语法的错，而是生命周期和资源管理没有设计好。

### 代码抓手

```js
function createCache() {
    const map = new Map()
    return {
        get(key) {
            return map.get(key)
        },
        set(key, value) {
            map.set(key, value)
        },
        clear() {
            map.clear()
        },
    }
}
```

### 常见坑

1. 事件监听没有解除，闭包持续持有组件状态。
2. 缓存没有上限和过期策略。
3. 防抖节流函数里保存的上下文和参数比预期活得更久。

### 面试展开

如果面试官问如何避免闭包问题，我会说：闭包不是问题本身，真正要关注的是变量生命周期。只要闭包里持有的资源有明确释放时机，比如解绑事件、清理定时器、清空缓存，就能避免大部分闭包相关泄漏。

## 2.6 第二章速记

### 定位

这一节给作用域和闭包主线做收口。

### 必会结论

1. 执行上下文解决“代码运行需要什么环境”。
2. 调用栈解决“函数调用怎么进出”。
3. 词法作用域解决“变量从哪里找”。
4. 闭包解决“函数如何继续持有定义时环境”。
5. this 不属于作用域链问题，不能混讲。

### 面试展开

如果让我 30 秒收口这一章，我会说：JS 是词法作用域语言，函数定义时就决定了它能访问哪些外部变量。函数调用会创建执行上下文并进入调用栈；如果内部函数在外部函数结束后仍被引用，它就会继续持有外层词法环境，这就是闭包。闭包的价值是保存状态，风险是延长变量生命周期。

# 3 this、函数调用与对象创建

## 3.1 this 由调用方式决定

### 定位

这一节专门把 this 从作用域链里拆出来，避免把两个完全不同的问题混在一起。

### 必会结论

1. 普通函数的 this 由调用方式决定，不由定义位置决定。
2. 箭头函数没有自己的 this，它捕获外层词法环境里的 this。
3. 常见绑定优先级可以概括为：new 绑定、显式绑定、隐式绑定、默认绑定。
4. 严格模式下默认绑定是 undefined，非严格模式下通常指向全局对象。

### 核心理解

this 不是变量查找规则，而是函数执行时的调用上下文。`obj.fn()` 这种调用会把 obj 作为隐式接收者；`fn.call(obj)` 会显式指定；`new Fn()` 会创建新对象并把它作为构造过程里的 this；独立函数调用则走默认绑定。箭头函数是例外，因为它根本没有自己的 this。

### 代码抓手

```js
const obj = {
    name: 'obj',
    getName() {
        return this.name
    },
}
const fn = obj.getName
console.log(obj.getName()) // 'obj'
console.log(fn()) // 非严格模式通常是 undefined 或全局属性值
console.log(obj.getName.call({ name: 'call' })) // 'call'
```

### 常见坑

1. 说 this 指向函数定义位置。
2. 把箭头函数的 this 说成“指向定义它的对象”。
3. 忘记独立调用会丢失隐式绑定。

### 面试展开

更稳的表达是：普通函数的 this 由调用方式决定，箭头函数没有自己的 this。所以判断 this 不能只看函数在哪里写，而要看函数是怎么被调用的。

## 3.2 箭头函数不是普通函数简写

### 定位

这一节把 ES6 箭头函数放回函数语义里讲，而不是只当语法糖。

### 必会结论

1. 箭头函数没有自己的 this、arguments、super、`new.target`。
2. 箭头函数没有 prototype，不能被 new。
3. call/apply/bind 不能改变箭头函数的 this，但 bind 预置参数仍然有效。
4. 箭头函数适合回调，不适合依赖动态 this 的对象方法和构造函数。

### 核心理解

箭头函数最大的语义变化不是“写得短”，而是词法绑定 this。它会从外层最近一层非箭头函数作用域里捕获 this，之后调用方式再怎么变，也不会改变它的 this。所以数组方法、Promise 回调、事件内部闭包经常适合箭头函数；但对象方法、构造函数、需要动态接收者的场景就不适合。

### 代码抓手

```js
const obj = {
    name: 'test',
    getName: () => this.name,
    getRealName() {
        return this.name
    },
}
console.log(obj.getName()) // 通常不是 'test'
console.log(obj.getRealName()) // 'test'

const arrow = () => this
console.log(arrow.bind({ a: 1 })() === arrow()) // true
```

### 常见坑

1. 在对象字面量方法里无脑使用箭头函数。
2. 以为 bind 能改变箭头函数的 this。
3. 用箭头函数做构造函数。

### 面试展开

我会这样说：箭头函数不是普通函数的简写版，它真正改变的是绑定语义。它没有自己的 this，所以适合回调和闭包，不适合依赖动态调用上下文的对象方法。

## 3.3 call、apply、bind 怎么讲

### 定位

这一节为后面的手写题做概念铺垫。

### 必会结论

1. call 立即执行，参数逐个传入。
2. apply 立即执行，参数以数组或类数组形式传入。
3. bind 不立即执行，而是返回绑定后的新函数。
4. bind 返回的新函数仍然可以被 new 调用。

### 核心理解

call/apply/bind 的共同点是控制函数调用时的 this，差异在于调用时机和参数传递形式。bind 更特殊，因为它返回一个新函数，这个新函数除了固定 this，还可以预置一部分参数。但如果这个绑定函数被 new 调用，new 绑定优先级会高于显式绑定，构造出来的实例应该使用新对象作为 this。

### 代码抓手

```js
function add(a, b) {
    return this.base + a + b
}
const ctx = { base: 10 }
console.log(add.call(ctx, 1, 2)) // 13
console.log(add.apply(ctx, [1, 2])) // 13
const bound = add.bind(ctx, 1)
console.log(bound(2)) // 13
```

### 常见坑

1. 手写 bind 时不处理 new 场景。
2. 把 call 和 apply 的差异说成返回值不同。
3. 忘记对 null/undefined 上下文做默认绑定处理。

### 面试展开

比较稳的答法是：call/apply/bind 都是显式绑定 this 的工具。call/apply 立即执行，只是参数形式不同；bind 返回新函数，常用于固定回调上下文和参数预置，但手写时必须考虑 new 调用的优先级。

## 3.4 new 的执行过程

### 定位

这一节把对象创建过程讲清楚，为原型链和继承打基础。

### 必会结论

1. new 会创建一个新对象。
2. 新对象的原型会指向构造函数的 prototype。
3. 构造函数会以新对象作为 this 执行。
4. 如果构造函数返回引用类型，则返回这个引用；否则返回新对象。

### 核心理解

new 的本质是一套对象创建协议。它不是简单调用函数，而是先准备实例对象，再连接原型，再执行构造逻辑，最后决定返回值。这个规则解释了为什么构造函数里给 this 挂属性会出现在实例上，也解释了为什么构造函数返回普通值不会覆盖实例，但返回对象会覆盖实例。

### 代码抓手

```js
function User(name) {
    this.name = name
}
User.prototype.say = function () {
    return this.name
}
const user = new User('miaoma')
console.log(user.say()) // 'miaoma'
console.log(Object.getPrototypeOf(user) === User.prototype) // true
```

### 常见坑

1. 忘记构造函数返回对象会覆盖默认实例。
2. 忘记构造函数返回原始值不会覆盖默认实例。
3. 以为 new 只是把函数执行一遍。

### 面试展开

如果面试官问 new 做了什么，我会按四步答：创建对象，连接原型，以新对象为 this 执行构造函数，根据返回值决定最终结果。手写 new 也就是把这四步翻译成代码。

## 3.5 默认参数、剩余参数与扩展运算符

### 定位

这一节把 ES6 函数参数能力放到调用语义里讲。

### 必会结论

1. 默认参数在每次函数调用时求值，不是在函数定义时求值。
2. 剩余参数 `...args` 收集参数，得到的是真数组。
3. 扩展运算符 `...` 用于展开可迭代对象，或者展开对象自身可枚举属性。
4. 对象展开是浅拷贝，不保留原型和属性描述符。

### 核心理解

默认参数、剩余参数和扩展运算符看起来是语法便利，实际是在改善函数调用和数据展开的表达能力。`...args` 比 arguments 更适合现代代码，因为它是数组，语义也更明确。对象展开虽然常用于复制对象，但它只是拷贝自有可枚举属性，遇到 getter 会触发取值，不会保留完整属性描述符。

### 代码抓手

```js
let x = 10
function fn(a = x) {
    return a
}
console.log(fn()) // 10
x = 20
console.log(fn()) // 20

function sum(...nums) {
    return nums.reduce((total, item) => total + item, 0)
}
console.log(sum(...[1, 2, 3])) // 6
```

### 常见坑

1. 以为默认参数只在定义时求一次。
2. 把对象展开当成深拷贝。
3. 不知道对象展开会触发 getter 取值。

### 面试展开

我会这样总结：这些语法不只是让函数写得短，而是让“参数默认值、参数收集、参数展开”变得更显式。工程里要特别记住，对象展开和数组展开都是浅层行为。

## 3.6 第三章速记

### 定位

这一节收束函数调用和对象创建主线。

### 必会结论

1. 普通函数 this 看调用方式。
2. 箭头函数 this 看外层词法环境。
3. call/apply/bind 是显式绑定工具。
4. new 是对象创建协议，不是普通函数调用。
5. ES6 参数语法提升表达力，但不会改变浅拷贝等底层边界。

### 面试展开

如果让我 30 秒讲完这一章，我会说：函数调用要同时看三件事，第一是 this 怎么绑定，第二是参数怎么传，第三是是否通过 new 进入构造流程。普通函数的 this 由调用方式决定，箭头函数没有自己的 this，new 则会创建对象、连接原型并执行构造逻辑。

# 4 原型链、继承与类

## 4.1 prototype、[[Prototype]] 与原型链

### 定位

这一节把 JS 对象模型的核心概念拆清楚。

### 必会结论

1. 函数有 prototype 属性，用来给实例共享方法。
2. 对象内部有 `[[Prototype]]`，可以通过 `Object.getPrototypeOf()` 获取。
3. 实例访问属性时，先查自身，找不到再沿原型链向上查找。
4. `__proto__` 是历史常见写法，不推荐作为严肃代码里的主要 API。

### 核心理解

JS 的继承不是类复制，而是对象之间通过原型链委托查找。构造函数的 prototype 是未来实例的原型对象，实例内部的 `[[Prototype]]` 指向这个对象。访问属性时，如果实例自身没有，就去原型对象找，再继续往上找，直到 null。理解了这件事，instanceof、继承、class、方法共享都能串起来。

### 代码抓手

```js
function User(name) {
    this.name = name
}
User.prototype.say = function () {
    return this.name
}
const user = new User('miaoma')
console.log(user.say()) // 'miaoma'
console.log(Object.getPrototypeOf(user) === User.prototype) // true
```

### 常见坑

1. 把 prototype 说成实例的属性。
2. 把 constructor 当成绝对可靠的类型判断依据。
3. 把原型链理解成类继承的复制关系。

### 面试展开

我会说：JS 的对象继承本质上是原型委托。构造函数的 prototype 用来放实例共享方法，实例内部的 `[[Prototype]]` 指向它。属性访问沿原型链逐层查找，这就是原型链的核心。

## 4.2 instanceof 的本质

### 定位

这一节把 instanceof 从“判断类型”改成“判断原型链关系”。

### 必会结论

1. instanceof 判断的是右侧构造函数的 prototype 是否出现在左侧对象的原型链上。
2. 它适合判断自定义构造函数实例关系。
3. 它不适合做所有内置类型的精确判断。
4. 跨 iframe、跨 realm、`Object.create(null)` 等场景都有边界。

### 核心理解

instanceof 的结果取决于原型链，而不是某个隐藏的类型标签。只要右侧构造函数的 prototype 能在左侧对象的原型链上被找到，结果就是 true。这也解释了为什么原型链可以被人为改写，instanceof 也会受到影响。

### 代码抓手

```js
function myInstanceof(left, right) {
    if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
        return false
    }
    let proto = Object.getPrototypeOf(left)
    const target = right.prototype
    while (proto) {
        if (proto === target) return true
        proto = Object.getPrototypeOf(proto)
    }
    return false
}
console.log(myInstanceof([], Array)) // true
```

### 常见坑

1. 以为 instanceof 能精确判断所有类型。
2. 忘记跨 realm 场景下内置构造函数不是同一份。
3. 忽略 `Symbol.hasInstance` 可以自定义 instanceof 行为。

### 面试展开

更稳的答法是：instanceof 判断的是原型链关系，不是类型标签。它的核心算法就是不断取左侧对象的原型，看能不能找到右侧构造函数的 prototype。

## 4.3 ES5 继承方式怎么讲

### 定位

这一节不要求死背所有继承名字，而是要说清每种方式解决了什么，又带来什么问题。

### 必会结论

1. 原型链继承能复用方法，但引用属性会共享。
2. 构造函数继承能避免引用属性共享，但拿不到父类原型方法。
3. 组合继承比较完整，但父类构造函数会执行两次。
4. 寄生组合继承是 ES5 时代相对最推荐的方式。

### 核心理解

ES5 继承本质上是在手动处理两件事：实例属性怎么继承，原型方法怎么复用。原型链继承偏向方法复用，但共享引用属性有坑；构造函数继承偏向实例属性隔离，但方法复用差；组合继承把两者结合起来，但会重复调用父构造函数；寄生组合继承则通过 `Object.create()` 连接原型，避免重复执行父构造函数。

### 代码抓手

```js
function Parent(name) {
    this.name = name
    this.tags = ['js']
}
Parent.prototype.say = function () {
    return this.name
}
function Child(name, age) {
    Parent.call(this, name)
    this.age = age
}
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child
```

### 常见坑

1. 只背继承名字，不知道各自解决的问题。
2. 原型链继承里把引用属性挂到原型上，导致实例共享。
3. 组合继承忘记父构造函数会调用两次。

### 面试展开

如果面试官追问 ES5 继承，我会按“实例属性”和“原型方法”两条线讲。继承方案本质上就是在平衡属性隔离、方法复用和父构造函数执行次数。

## 4.4 ES6 class 与 extends

### 定位

这一节把 class 放回原型链，而不是当成完全不同的对象模型。

### 必会结论

1. class 底层仍然基于原型链，可以理解成更规范的语法层封装。
2. class 内部默认严格模式。
3. 类方法定义在原型上，并且默认不可枚举。
4. 派生类构造函数必须先调用 `super()`，才能使用 this。

### 核心理解

class 让继承语义更清晰，但没有把 JS 改造成传统类语言。实例方法仍然在原型上，extends 仍然会建立原型链关系。它真正改善的是语法一致性、继承内置对象、super 调用和方法枚举性等细节。说它是语法糖可以，但不能说它完全没有语义差异。

### 代码抓手

```js
class Parent {
    constructor(name) {
        this.name = name
    }
    say() {
        return this.name
    }
}
class Child extends Parent {
    constructor(name, age) {
        super(name)
        this.age = age
    }
}
const child = new Child('miaoma', 7)
console.log(child.say()) // 'miaoma'
```

### 常见坑

1. 说 class 是全新的对象模型。
2. 说 class 只是纯语法糖，却忽略严格模式、方法不可枚举、super 规则等差异。
3. 在派生类里 `super()` 前访问 this。

### 面试展开

我会这样答：class 底层仍然建立在原型链上，但它提供了更清晰的继承语义和更规范的默认行为。它不是传统类模型，也不是零差异糖衣，而是对原型继承的一层现代语法封装。

## 4.5 私有字段、静态字段与静态代码块

### 定位

这一节补充现代 class 在工程里经常被追问的能力。

### 必会结论

1. #private 是语法级私有字段，外部无法通过普通属性访问拿到。
2. 静态字段挂在类本身上，不挂在实例上。
3. 静态代码块适合做类级初始化逻辑。
4. #private、Symbol 私有、闭包私有不是同一种语义。

### 核心理解

早期 JS 经常用闭包或 Symbol 模拟私有，但它们都不是完全同一层能力。#private 是语言层面的私有字段，语法上就禁止外部访问；Symbol 更像“避免命名冲突”的约定式隐藏；闭包私有则依赖作用域保存数据。工程里要根据封装目标选择，而不是把它们都叫“私有变量”。

### 代码抓手

```js
class User {
    static count = 0
    #password
    constructor(name, password) {
        this.name = name
        this.#password = password
        User.count++
    }
    checkPassword(value) {
        return this.#password === value
    }
}
```

### 常见坑

1. 以为 #private 可以通过字符串属性名访问。
2. 把 TS 的 private 和 JS 的 #private 混为一谈。
3. 忘记静态字段属于类本身，不属于实例。

### 面试展开

更稳的说法是：#private 是运行时真正私有，TS 的 private 更偏编译期约束，Symbol 私有偏命名隔离，闭包私有偏作用域封装。它们解决的问题相似，但语义层级不同。

## 4.6 第四章速记

### 定位

这一节收束对象模型和继承主线。

### 必会结论

1. JS 继承本质上是原型链委托，不是属性复制。
2. instanceof 判断原型链关系，不是绝对类型判断。
3. ES5 继承重点是实例属性隔离和原型方法复用。
4. class 底层仍基于原型链，但带来了更清晰的继承语义。

### 面试展开

如果让我 30 秒收口这一章，我会说：JS 的对象模型核心是原型链。实例访问属性时先查自身，再沿 `[[Prototype]]` 向上委托。ES5 继承是在手动连接实例属性和原型方法，ES6 class 则是在原型链基础上提供更清晰、更规范的语法表达。

# 5 集合、键值结构与元编程

## 5.1 Map 和 Object 怎么选

### 定位

这一节把 ES6 的 Map 放回键值结构选型里，而不是只当“新对象”理解。

### 必会结论

1. Object 更适合结构化业务数据。
2. Map 更适合动态键值表、缓存、索引、对象做键的场景。
3. Map 的键可以是任意类型，Object 的键本质上只能是字符串或 Symbol。
4. Map 保留插入顺序，并且有原生迭代器和 size。

### 核心理解

Object 和 Map 不是谁替代谁，而是语义不同。对象更像“有固定结构的数据记录”，比如用户、订单、配置项；Map 更像“运行时动态维护的映射表”，比如缓存、依赖关系、节点索引。对象把非字符串键隐式转成字符串，这在动态键场景很容易踩坑；Map 则能直接用对象、函数、数组作为键。

### 代码抓手

```js
const obj = {}
obj[{ id: 1 }] = 'a'
obj[{ id: 2 }] = 'b'
console.log(obj) // { '[object Object]': 'b' }

const key1 = { id: 1 }
const key2 = { id: 2 }
const map = new Map()
map.set(key1, 'a')
map.set(key2, 'b')
console.log(map.get(key1)) // 'a'
console.log(map.size) // 2
```

### 常见坑

1. 把对象硬当 Map 用，导致对象键被转成字符串。
2. 以为对象属性顺序就是简单插入顺序。
3. 结构化数据也无脑用 Map，反而降低可读性和序列化便利性。

### 面试展开

我会这样答：如果数据是固定结构，优先 Object；如果是运行时动态键表、缓存、索引或对象做键，优先 Map。Object 是记录结构，Map 是映射关系。

## 5.2 Set 和唯一值集合

### 定位

这一节讲 Set 的真实定位和边界。

### 必会结论

1. Set 用于保存不重复值。
2. Set 和 Map 的值相等判断基于 SameValueZero。
3. SameValueZero 下 NaN 等于 NaN，`+0` 和 `-0` 被视为相等。
4. Set 适合去重、集合判断、权限点集合、已访问节点集合。

### 核心理解

Set 的重点不是“数组去重工具”，而是集合语义。只要你关心的是“有没有这个值”，而不是“这个值在第几个位置”，Set 就比数组更清晰。数组去重只是最常见的入门场景，更工程化的场景包括图遍历的 visited 集合、权限码集合、缓存命中判断等。

### 代码抓手

```js
const list = [1, 2, 2, NaN, NaN, +0, -0]
const unique = [...new Set(list)]
console.log(unique) // [1, 2, NaN, 0]

const visited = new Set()
visited.add('node-1')
console.log(visited.has('node-1')) // true
```

### 常见坑

1. 只把 Set 当数组去重语法糖。
2. 忽略对象值去重仍然按引用判断。
3. 不知道 NaN 在 Set 里可以被认为是同一个值。

### 面试展开

如果被问 Set，我会说它表达的是集合语义，适合“唯一值”和“是否存在”的场景。数组去重只是它的一个应用，不是全部价值。

## 5.3 WeakMap 和 WeakSet 的内存语义

### 定位

这一节是资深面试常见加分点，要讲清“弱引用”到底解决什么问题。

### 必会结论

1. WeakMap 的键必须是对象，WeakSet 也只能存对象。
2. 它们对键是弱引用，不会阻止键对象被垃圾回收。
3. 它们不能遍历，也没有 size，这是刻意设计。
4. 常见场景是对象关联缓存、私有元数据、响应式依赖收集。

### 核心理解

WeakMap 的核心价值不是“高级 Map”，而是“不额外延长对象生命周期”。如果你用普通 Map 以对象为键做缓存，只要这个 Map 还在，键对象就会被强引用，可能导致缓存长期占用内存。WeakMap 则不会阻止键对象回收，非常适合把元数据挂到对象外部，同时不破坏垃圾回收。

### 代码抓手

```js
const metaMap = new WeakMap()
function setMeta(target, meta) {
    metaMap.set(target, meta)
}
function getMeta(target) {
    return metaMap.get(target)
}
const node = {}
setMeta(node, { mounted: true })
console.log(getMeta(node)) // { mounted: true }
```

### 常见坑

1. 以为 WeakMap 可以遍历。
2. 想用 WeakMap 统计数量。
3. 把基本类型当成 WeakMap 的键。

### 面试展开

更成熟的表达是：WeakMap 适合做“对象 -> 元数据”的关联，而且不会因为缓存关系阻止对象回收。这也是很多框架依赖收集、私有数据保存喜欢用它的原因。

## 5.4 Symbol 的两个核心价值

### 定位

这一节不只讲唯一值，还要讲语言协议入口。

### 必会结论

1. `Symbol()` 每次都会创建唯一值。
2. `Symbol.for()` 会走全局注册表，相同 key 会复用同一个 Symbol。
3. Symbol 适合做无冲突对象键。
4. 内置 Symbol 可以定制语言行为，比如 `Symbol.iterator`、`Symbol.toStringTag`、`Symbol.hasInstance`。

### 核心理解

Symbol 的价值可以分成两层。第一层是唯一键，避免对象属性名冲突；第二层是语言协议，很多 JS 行为都通过内置 Symbol 暴露可定制入口。比如对象能不能被 `for...of` 遍历，看的是有没有 `Symbol.iterator`；`Object.prototype.toString.call()` 的结果也可能被 `Symbol.toStringTag` 影响。

### 代码抓手

```js
const s1 = Symbol('id')
const s2 = Symbol('id')
console.log(s1 === s2) // false

const g1 = Symbol.for('id')
const g2 = Symbol.for('id')
console.log(g1 === g2) // true

const obj = {
    [Symbol.toStringTag]: 'Custom',
}
console.log(Object.prototype.toString.call(obj)) // [object Custom]
```

### 常见坑

1. 以为描述相同的 Symbol 就相等。
2. 忘记 `Object.keys()` 和 `for...in` 默认拿不到 Symbol 键。
3. 把 Symbol 只理解成“唯一字符串”。

### 面试展开

我会说：Symbol 的核心不是多一个基本类型，而是提供了无冲突键和语言协议定制能力。前者解决命名冲突，后者让对象参与迭代、类型标签、instanceof 等底层行为。

## 5.5 Proxy 与 Reflect

### 定位

这一节把元编程能力和框架原理连接起来。

### 必会结论

1. Proxy 是对象级拦截器，可以拦截读取、赋值、删除、枚举、函数调用、构造调用等操作。
2. Reflect 提供对象内部默认行为的标准化函数，常和 Proxy 配合。
3. Proxy 相比 `Object.defineProperty`，能覆盖更多对象级操作。
4. Vue 3 响应式系统就是 Proxy 的经典工程落地。

### 核心理解

`Object.defineProperty` 更像是属性级拦截，必须针对具体属性定义 getter/setter；Proxy 则是对象级代理，可以拦截新增属性、删除属性、in、ownKeys、数组索引等更多操作。`Reflect.get/set` 的价值在于调用默认内部行为，并正确处理 receiver，尤其在访问器属性和原型链场景更稳。

### 代码抓手

```js
function reactive(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver)
            console.log('track', key)
            return value
        },
        set(target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver)
            console.log('trigger', key)
            return result
        },
    })
}
const state = reactive({ count: 1 })
state.count
state.count = 2
```

### 常见坑

1. 以为 Proxy 能被完整 polyfill。
2. 在 trap 里直接 `target[key]`，忽略 receiver 语义。
3. 把 Proxy 理解成一定不修改原对象，实际取决于 trap 逻辑。

### 面试展开

如果面试官问 Vue 3 为什么选 Proxy，我会说：核心不是新 API 更酷，而是它能做对象级拦截，天然覆盖新增属性、删除属性、数组索引、枚举等操作，解决了 Vue 2 基于 defineProperty 的很多结构性限制。

## 5.6 第五章速记

### 定位

这一节收束集合结构和元编程主线。

### 必会结论

1. 结构化数据用对象，动态映射用 Map。
2. 唯一值集合用 Set。
3. 对象关联元数据和弱引用缓存用 WeakMap。
4. 无冲突键和语言协议入口看 Symbol。
5. 对象级拦截和框架响应式看 `Proxy + Reflect`。

### 面试展开

如果让我收口这一章，我会说：ES6+ 的集合和元编程能力不是零散 API，而是在补齐 JS 对动态键、集合语义、弱引用缓存、语言协议和对象级代理的表达能力。这些能力在框架、缓存、权限、依赖收集和工程抽象里都很常见。

# 6 异步体系、事件循环与 Promise

## 6.1 异步的本质

### 定位

这一节先把异步从“回调晚点执行”提升到运行时模型。

### 必会结论

1. JavaScript 主线程通常是单线程执行模型。
2. 异步不是主线程同时执行多段 JS，而是宿主环境处理外部任务后再把回调交回任务队列。
3. 异步的价值是避免长时间阻塞主线程，提高响应性和吞吐能力。

### 核心理解

定时器、网络请求、I/O、事件监听这些能力并不是 JS 引擎单独完成的，而是宿主环境参与调度。JS 主线程负责执行当前调用栈里的代码；异步任务完成后，宿主把对应回调放入合适的队列，等待事件循环调度。理解这一点后，就不会再说“JS 多线程同时跑回调”这种不准确的话。

### 代码抓手

```js
console.log('start')
setTimeout(() => {
    console.log('timer')
}, 0)
console.log('end')
// start end timer
```

### 常见坑

1. 把异步理解成 JS 主线程并行执行。
2. 只会说“宏任务微任务”，但不知道宿主环境参与调度。
3. 忽略长任务会阻塞页面交互和渲染。

### 面试展开

更稳的表达是：异步不是 JS 主线程同时执行多段代码，而是宿主环境处理耗时任务，完成后把回调放回队列，等主线程空闲和事件循环调度时再执行。

## 6.2 浏览器事件循环

### 定位

这一节处理输出顺序题和渲染时机的基础模型。

### 必会结论

1. 执行当前任务中的同步代码。
2. 当前任务结束后，清空微任务队列。
3. 微任务清空后，浏览器有机会进行渲染。
4. 再进入下一轮任务。

### 核心理解

浏览器事件循环最常用的面试模型是：同步代码先跑，当前任务结束后清空微任务，然后浏览器进入渲染机会，再取下一个任务。常见任务包括定时器、DOM 事件、网络回调；常见微任务包括 `Promise.then/catch/finally`、queueMicrotask、MutationObserver。微任务会在下一轮任务前被清空，所以微任务过多也可能饿死渲染。

### 代码抓手

```js
console.log(1)
setTimeout(() => console.log(2), 0)
Promise.resolve().then(() => console.log(3))
queueMicrotask(() => console.log(4))
console.log(5)
// 1 5 3 4 2
```

### 常见坑

1. 以为 `Promise.then` 是宏任务。
2. 忽略微任务按入队顺序执行。
3. 把 requestAnimationFrame 简单等同普通宏任务，它更接近浏览器渲染调度阶段的回调。

### 面试展开

输出顺序题不要靠猜，统一按三步分析：先跑同步代码，再记录微任务和任务，同步结束后清空微任务，最后进入下一轮任务。

## 6.3 Node 事件循环和浏览器不能混背

### 定位

这一节补充资深面试里经常追问的宿主差异。

### 必会结论

1. 浏览器和 Node 都有事件循环，但宿主环境不同。
2. Node 有 timers、poll、check 等阶段，不能简单套浏览器模型。
3. `process.nextTick` 优先级通常高于普通 Promise 微任务。
4. setImmediate 和 `setTimeout(fn, 0)` 的先后顺序在不同上下文下不一定固定。

### 核心理解

很多面试回答会把浏览器里的“宏任务/微任务”简化模型直接套到 Node，这是不稳的。Node 的事件循环有自己的阶段模型，I/O 回调、timer、check 阶段会影响任务执行顺序。资深回答不一定要展开所有 libuv 细节，但一定要知道两套宿主不能混成一个版本背。

### 代码抓手

```js
Promise.resolve().then(() => console.log('promise'))
process.nextTick(() => console.log('nextTick'))
// Node 中通常先输出 nextTick，再输出 promise
```

### 常见坑

1. 用浏览器事件循环模型解释所有 Node 输出题。
2. 机械背 setTimeout 一定早于 setImmediate。
3. 不知道 `process.nextTick` 的特殊优先级。

### 面试展开

我会说：浏览器和 Node 都有事件循环，但队列和阶段不同。浏览器更常用任务、微任务、渲染机会去解释；Node 还要考虑 timers、poll、check，以及 `process.nextTick` 的特殊队列。

## 6.4 Promise 是状态机和结果容器

### 定位

这一节把 Promise 从“异步语法”讲回机制。

### 必会结论

1. Promise 有三种状态：pending、fulfilled、rejected。
2. 状态一旦改变就不可逆。
3. Promise 构造函数里的 executor 是同步执行的。
4. 真正异步调度的是 then/catch/finally 回调。

### 核心理解

Promise 既是异步结果容器，也是一个状态机。它的不可逆状态保证了异步结果的确定性，避免同一个任务既成功又失败、回调被多次触发。executor 同步执行，所以在里面 throw 或 resolve 会立即改变状态；但 `.then()` 注册的回调会进入微任务队列。

### 代码抓手

```js
console.log('start')
const p = new Promise(resolve => {
    console.log('executor')
    resolve('ok')
})
p.then(value => console.log(value))
console.log('end')
// start executor end ok
```

### 常见坑

1. 以为 Promise 构造函数本身是异步执行。
2. 以为状态可以从 fulfilled 再变 rejected。
3. 把 Promise 只理解成回调写法替代品。

### 面试展开

如果被问 Promise，我会先说它是一个异步结果状态机。状态从 pending 变成 fulfilled 或 rejected 后不可逆，executor 同步执行，then 回调以微任务方式调度。

## 6.5 then 为什么能链式调用

### 定位

这一节讲 Promise 深问的核心。

### 必会结论

1. then 返回新的 Promise。
2. 回调返回普通值，新 Promise fulfilled。
3. 回调返回 Promise，新 Promise 跟随它的状态。
4. 回调抛异常，新 Promise rejected。
5. thenable 会进入吸收流程。

### 核心理解

Promise 链式调用成立的核心不在于“返回 this”，而在于 then 返回一个新的 Promise。这个新 Promise 会根据当前回调的返回结果进入解析流程：普通值直接成功，Promise 就跟随它，thenable 会尝试调用它的 then，异常会转成失败。Promise/A+ 的难点也主要在这里，包括 thenable 吸收、循环引用保护和状态流转。

### 代码抓手

```js
Promise.resolve(1)
    .then(value => value + 1)
    .then(value => Promise.resolve(value + 1))
    .then(value => {
        throw new Error(String(value))
    })
    .catch(err => console.log(err.message)) // 3
```

### 常见坑

1. 以为 then 返回原 Promise。
2. 不知道回调抛异常会让新 Promise 变 rejected。
3. 不知道 thenable 吸收逻辑。

### 面试展开

我会这样答：then 链式调用成立，是因为每次 then 都返回新的 Promise，并用回调返回值决定新 Promise 的状态。普通值、Promise、thenable、异常都会走不同解析分支。

## 6.6 Promise 静态方法怎么选

### 定位

这一节把 Promise 组合方法和工程语义关联起来。

### 必会结论

1. `Promise.all`：全部成功才成功，一个失败就失败。
2. `Promise.allSettled`：等待全部结束，不管成功失败。
3. `Promise.race`：第一个结束的结果决定状态。
4. `Promise.any`：第一个成功就成功，全部失败才失败。
5. `Promise.try` 已进入标准，适合统一把同步异常和异步结果纳入 Promise 链。

### 核心理解

这些方法真正考的是并发语义，不是 API 名字。多个任务必须全部成功才能继续，用 all；你要收集所有任务结果，用 allSettled；你只关心谁先返回，不管成功失败，用 race；你要多个候选里拿第一个成功结果，用 any。`Promise.try` 则适合统一包装可能同步抛错或返回 Promise 的函数。

### 代码抓手

```js
const tasks = [fetch('/a'), fetch('/b')]
const [a, b] = await Promise.all(tasks)

const results = await Promise.allSettled(tasks)

const first = await Promise.race([fetch('/api'), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))])
```

### 常见坑

1. 用 `Promise.all` 批量请求，却不接受任何一个失败导致整体失败。
2. 把 race 和 any 混淆。
3. 多个无依赖任务还串行 await。

### 面试展开

我会按业务语义回答：全部必须成功用 all，全部结果都要看用 allSettled，谁先结束就要谁用 race，谁先成功就要谁用 any。关键不是背 API，而是识别并发关系。

## 6.7 async/await

### 定位

这一节把 async/await 放回 Promise 和微任务模型里。

### 必会结论

1. async 函数调用后一定返回 Promise。
2. await 会等待右侧结果，后续逻辑以微任务继续执行。
3. 连续多个 await 默认是串行。
4. 多个无依赖任务应优先考虑 `Promise.all` 并行。

### 核心理解

async/await 不是把异步变成同步，而是让异步流程写起来像同步。await 会暂停当前 async 函数后续逻辑，等右侧 Promise 解决后，再把后续代码放入微任务继续执行。它改善的是可读性和错误处理模型，底层仍然建立在 Promise 上。

### 代码抓手

```js
async function fetchBoth() {
    const [user, posts] = await Promise.all([fetch('/user').then(res => res.json()), fetch('/posts').then(res => res.json())])
    return { user, posts }
}
```

### 常见坑

1. 说 await 后面的代码同步执行。
2. 无依赖请求写成连续 await，导致性能变差。
3. 忘记 async 函数返回值会自动包装成 Promise。

### 面试展开

更稳的说法是：await 只是让控制流看起来像同步，实际会把函数后续逻辑拆到 Promise resolved 后的微任务里执行。所以它是 Promise 语义上的语法改进，不是同步化魔法。

## 6.8 第六章速记

### 定位

这一节收束异步主线。

### 必会结论

1. 异步依赖宿主环境和事件循环。
2. 浏览器中同步代码先执行，再清空微任务，再进入下一轮任务。
3. Promise 是状态机，then 返回新 Promise。
4. async/await 是 Promise 语义上的控制流优化。
5. 并发方法要按业务语义选择。

### 面试展开

如果让我 30 秒讲异步体系，我会说：JS 主线程负责执行当前调用栈，宿主环境处理定时器、网络和事件，完成后把回调放入队列。Promise 用状态机表达异步结果，then 回调走微任务，async/await 只是基于 Promise 的语法层优化。

# 7 迭代协议、Generator 与 async/await

## 7.1 Iterator 与 Iterable 协议

### 定位

这一节解释为什么很多语法都能作用在数组、Set、Map、字符串上。

### 必会结论

1. 可迭代对象需要实现 `Symbol.iterator`。
2. 调用 `Symbol.iterator` 后应返回迭代器对象。
3. 迭代器对象需要实现 `next()`，返回 `{ value, done }`。
4. `for...of`、展开运算符、数组解构、`Array.from()` 都依赖可迭代协议。

### 核心理解

数组解构能作用在 Set 上，不是因为 Set 像数组，而是因为它实现了可迭代协议。可迭代协议把“怎么一个个取值”抽象了出来，让不同数据结构能被统一消费。普通对象默认不可迭代，是因为它没有默认的 `Symbol.iterator`。

### 代码抓手

```js
const range = {
    start: 1,
    end: 3,
    [Symbol.iterator]() {
        let current = this.start
        const end = this.end
        return {
            next() {
                return current <= end ? { value: current++, done: false } : { value: undefined, done: true }
            },
        }
    },
}
console.log([...range]) // [1, 2, 3]
```

### 常见坑

1. 以为能展开就是数组。
2. 以为普通对象天然能 `for...of`。
3. 把可枚举和可迭代混为一谈。

### 面试展开

我会说：Iterator/Iterable 协议解决的是“不同数据结构如何统一被消费”的问题。只要对象实现了 `Symbol.iterator` 并返回合法迭代器，就可以被 `for...of`、展开、解构等语法消费。

## 7.2 for...in 与 for...of

### 定位

这一节把两个最容易混用的遍历语法拆清楚。

### 必会结论

1. `for...in` 遍历可枚举属性名，包含原型链上的可枚举属性。
2. `for...of` 遍历可迭代对象产出的值。
3. 数组一般不推荐用 `for...in` 遍历元素值。

### 核心理解

`for...in` 更像对象属性枚举，它拿到的是键名，而且可能包含继承来的可枚举属性。`for...of` 更像值迭代，它遵循可迭代协议，适合数组、字符串、Map、Set、生成器结果等。两者不是新旧替代，而是语义不同。

### 代码抓手

```js
const arr = [1, 2, 3]
arr.name = 'test'
for (const key in arr) {
    console.log(key) // '0' '1' '2' 'name'
}
for (const value of arr) {
    console.log(value) // 1 2 3
}
```

### 常见坑

1. 用 `for...in` 遍历数组元素值。
2. 忘记 `for...in` 会扫原型链。
3. 把对象属性枚举和迭代协议混淆。

### 面试展开

如果被问两者区别，我会说：`for...in` 是属性名枚举，偏对象；`for...of` 是值迭代，偏可迭代协议。数组通常更适合 `for...of` 或数组方法。

## 7.3 Generator 是可暂停函数

### 定位

这一节把 Generator 的本质讲清楚，不把它只当冷门语法。

### 必会结论

1. Generator 函数调用后不会立即执行函数体，而是返回迭代器。
2. yield 用于暂停并产出值。
3. `next()` 用于恢复执行。
4. Generator 本身不是异步，但可以配合 Promise 组织异步流程。

### 核心理解

Generator 的核心是“控制执行权”。普通函数一旦调用会一路执行到返回，而 Generator 可以在 yield 处暂停，把执行权交出去，再由外部通过 `next()` 恢复。这个能力让它天然符合迭代器协议，也曾经被用来配合 Promise 实现类似 async/await 的异步流程控制。

### 代码抓手

```js
function* gen() {
    yield 1
    yield 2
    return 3
}
const iterator = gen()
console.log(iterator.next()) // { value: 1, done: false }
console.log(iterator.next()) // { value: 2, done: false }
console.log(iterator.next()) // { value: 3, done: true }
```

### 常见坑

1. 以为调用 Generator 会立即执行函数体。
2. 把 Generator 直接等同异步。
3. 忘记 Generator 返回的是迭代器。

### 面试展开

我会说：Generator 最本质的能力是可暂停和可恢复执行，它把函数执行权交给外部控制。异步只是它可以参与的一个应用方向，不是它的全部。

## 7.4 Generator 自动执行器

### 定位

这一节为理解 async/await 的历史语义做铺垫。

### 必会结论

1. Generator 可以配合 Promise 和自动执行器组织异步流程。
2. 自动执行器的核心是不断 `next()`，遇到 Promise 就等待后再继续。
3. async/await 可以理解成这类模式的语言级封装。

### 核心理解

在 async/await 普及前，Generator + Promise + runner 是常见异步流程方案。Generator 负责把流程写成可暂停形式，Promise 负责表达异步结果，runner 负责在 Promise 完成后恢复 Generator。理解这个模式后，async/await 为什么能“暂停”和“恢复”就更容易理解。

### 代码抓手

```js
function run(genFn) {
    const gen = genFn()
    function step(nextFn, arg) {
        let result
        try {
            result = nextFn.call(gen, arg)
        } catch (err) {
            return Promise.reject(err)
        }
        if (result.done) return Promise.resolve(result.value)
        return Promise.resolve(result.value).then(
            value => step(gen.next, value),
            err => step(gen.throw, err)
        )
    }
    return step(gen.next)
}
```

### 常见坑

1. 只会背 Generator，不知道它和 async/await 的关系。
2. 自动执行器里忘记异常要通过 `gen.throw` 继续传回去。
3. 忽略 yield 后面的值可以是 Promise 或普通值。

### 面试展开

如果面试官追问 async/await 的历史背景，我会说：它可以看成 Generator + Promise 自动执行器的语言级内建版本。Generator 负责暂停恢复，Promise 负责异步结果，执行器负责把两者接起来。

## 7.5 异步迭代与 for await...of

### 定位

这一节补充现代异步流消费能力。

### 必会结论

1. 异步可迭代对象实现 `Symbol.asyncIterator`。
2. `for await...of` 适合顺序消费异步流。
3. 它适合分页拉取、流式响应、按序处理 Promise 序列。
4. 它和 `Promise.all` 解决的问题不同。

### 核心理解

`for await...of` 表达的是“一个个等待并消费值”，而 `Promise.all` 表达的是“并行等待一组结果”。如果你要按顺序处理异步流，比如分页拉取下一页依赖上一页结果，`for await...of` 很自然；如果一组任务互不依赖，那 `Promise.all` 往往更高效。

### 代码抓手

```js
async function* createPages() {
    yield await fetch('/page/1').then(res => res.json())
    yield await fetch('/page/2').then(res => res.json())
}
for await (const page of createPages()) {
    console.log(page)
}
```

### 常见坑

1. 所有异步任务都用 `for await...of` 串行处理。
2. 把异步迭代和普通 Promise 并发混为一谈。
3. 不知道 `for await...of` 更适合流式和顺序消费。

### 面试展开

我会说：`for await...of` 适合顺序消费异步可迭代数据，`Promise.all` 适合并行收集多个独立任务结果。关键是先判断业务需要顺序还是并行。

## 7.6 第七章速记

### 定位

这一节收束迭代协议和 Generator 主线。

### 必会结论

1. 可迭代协议让不同数据结构能被统一消费。
2. `for...in` 枚举属性名，`for...of` 迭代值。
3. Generator 是可暂停、可恢复的函数。
4. async/await 可以理解成 Promise 控制流的语言级封装。
5. `for await...of` 适合异步流和顺序消费。

### 面试展开

如果让我收口这一章，我会说：Iterator/Iterable 解决统一取值协议，Generator 提供可暂停函数能力，async/await 和异步迭代则把这种控制流推进到异步场景。真正的关键不是语法，而是“谁控制下一步执行”。

# 8 模块化与工程边界

## 8.1 CommonJS 与 ES Module

### 定位

这一节把模块化从写法差异提升到加载机制和工程边界。

### 必会结论

1. CommonJS 典型写法是 require 和 `module.exports`，更偏运行时加载。
2. ES Module 使用 import/export，静态结构更强，适合编译期分析。
3. ESM 导入的是绑定关系，不是简单值拷贝，这就是 live binding。
4. 不要机械背“CJS 同步、ESM 异步”，真实行为还和运行环境、打包工具有关。

### 核心理解

CommonJS 的模块关系更偏运行时确定，require 可以放在条件分支里，也可以动态拼路径，这让静态分析更困难。ESM 则把导入导出放在模块顶层，结构更明确，编译器和打包工具能更早知道依赖关系。这也是 ESM 更适合 tree-shaking、依赖图分析和现代构建优化的原因。

### 代码抓手

```js
// counter.js
export let count = 0
export function inc() {
    count++
}

// main.js
import { count, inc } from './counter.js'
console.log(count) // 0
inc()
console.log(count) // 1
```

### 常见坑

1. 把 ESM 导入理解成值拷贝。
2. 把 CJS 和 ESM 的互操作细节按单一环境死背。
3. 认为写了 ESM 就一定能 tree-shaking。

### 面试展开

我会说：ESM 的核心价值不只是语法统一，而是模块关系在编译阶段更可见。live binding、静态结构、tree-shaking 和循环依赖行为，都和这个设计有关。

## 8.2 动态导入与代码分割

### 定位

这一节把 `import()` 放到加载性能和工程拆包里理解。

### 必会结论

1. `import()` 返回 Promise。
2. 它适合运行时按需加载模块。
3. 常见场景是路由懒加载、大组件按需加载、图表库和编辑器延迟加载。
4. 代码分割不是切得越碎越好。

### 核心理解

静态 import 解决编译期可分析，动态 import 解决运行时按需加载。工程里最常见的拆包边界是路由，因为用户不可能首屏访问所有页面。重型组件和低频功能也可以动态加载。但拆包过细会增加请求数量、loading 管理和缓存复杂度，所以代码分割要围绕用户路径和资源体量来设计。

### 代码抓手

```js
async function loadChart() {
    const { default: Chart } = await import('./Chart.js')
    return Chart
}
```

### 常见坑

1. 把动态导入当成静态导入的替代品。
2. 为了拆包而拆包，导致 chunk 过碎。
3. 首屏关键路径也被过度异步化。

### 面试展开

更稳的说法是：静态导入让工具链提前理解依赖，动态导入让运行时按需加载。两者不是替代关系，而是面向不同加载时机的分工。

## 8.3 tree-shaking 与 side effects

### 定位

这一节讲现代构建优化里的高频面试点。

### 必会结论

1. tree-shaking 的前提是模块结构可静态分析。
2. ESM 更适合 tree-shaking，但不是写了 ESM 就一定能摇干净。
3. 副作用代码会影响裁剪结果。
4. `package.json` 里的 sideEffects 声明会影响打包工具判断。

### 核心理解

tree-shaking 本质上是根据静态依赖关系裁剪未使用导出。但如果模块一被导入就执行副作用，比如改全局变量、注册 polyfill、引入样式、初始化 SDK，那么打包工具就不能随便删。`sideEffects: false` 是告诉工具“未使用导出可以安全删除”，但如果声明错了，可能导致必要副作用被裁掉。

### 代码抓手

```js
// pure.js
export function add(a, b) {
    return a + b
}
export function sub(a, b) {
    return a - b
}

// side-effect.js
window.__APP_VERSION__ = '1.0.0'
export const version = '1.0.0'
```

### 常见坑

1. 以为 ESM 自动等于 tree-shaking 成功。
2. 包里有副作用初始化却乱写 `sideEffects: false`。
3. 动态访问导出、动态 require 让工具链难以分析。

### 面试展开

我会说：tree-shaking 依赖静态结构和副作用判断。ESM 提供了更好的静态分析基础，但最终能不能裁剪，还要看代码写法、打包工具和 sideEffects 声明。

## 8.4 循环依赖

### 定位

这一节处理模块化里真正容易在工程中出问题的部分。

### 必会结论

1. 循环依赖不是绝对不能出现，但会提高理解成本。
2. CommonJS 下容易拿到半初始化导出。
3. ESM 因为 live binding 行为更明确，但初始化时机仍可能带来问题。
4. 真正解决循环依赖要靠拆分模块边界，而不是只记现象。

### 核心理解

循环依赖本质上说明两个模块互相知道太多。CJS 因为运行时加载和导出对象特性，循环中可能拿到未完成初始化的结果；ESM 有静态依赖和 live binding，行为更规范，但如果在初始化阶段访问尚未初始化的绑定，依然可能出错。工程里最重要的不是背哪个环境输出什么，而是通过抽出公共模块、反转依赖或重划职责来消除双向依赖。

### 常见坑

1. 把循环依赖当成语法错误。
2. 只背 CJS 和 ESM 的现象，不会讲模块边界问题。
3. 两个业务模块互相 import，越改越耦合。

### 面试展开

如果被问循环依赖，我会说：它不是绝对不能存在，但它暴露了模块职责边界问题。真正的解决方式通常是抽公共依赖、下沉类型或工具函数、反转控制，而不是靠记忆某个环境的输出结果。

## 8.5 Top-level await

### 定位

这一节补充现代 ESM 中的异步初始化边界。

### 必会结论

1. Top-level await 只在 ESM 中可用。
2. 它会让模块初始化过程变成可能阻塞的异步过程。
3. 导入者需要等待该模块完成后再继续执行。
4. 它适合配置、SDK、语言包初始化，不适合滥用在核心主路径。

### 核心理解

Top-level await 的本质不是“顶层也能 await 了”，而是“模块图的执行时机被异步依赖影响”。如果一个模块顶层 await 了配置加载，那么依赖它的模块也要等它完成。这让初始化逻辑更方便，但也可能让启动路径变慢，甚至在循环依赖里放大初始化问题。

### 代码抓手

```js
const config = await fetch('/config.json').then(res => res.json())
export default config
```

### 常见坑

1. 把 Top-level await 当普通语法便利，忽略模块图阻塞。
2. 在核心入口滥用，拖慢启动。
3. 在循环依赖场景下增加初始化复杂度。

### 面试展开

我会这样说：Top-level await 改变的是模块初始化时机。它很适合必要的异步配置初始化，但要谨慎放在核心依赖链上，否则会影响整个模块图的启动。

## 8.6 Babel、polyfill 与兼容边界

### 定位

这一节把 ES6+ 能力和工程构建链路接起来。

### 必会结论

1. Babel 主要处理语法转换，不负责自动补齐所有运行时 API。
2. Promise、Map、Set、Array 方法等运行时能力通常需要 polyfill。
3. Proxy 无法被完整 polyfill。
4. BigInt 也不能无损降级成 Number。

### 核心理解

Babel 的核心流程是 parse、transform、generate，它擅长把新语法转换成旧语法，比如箭头函数、可选链、空值合并。但像 Promise、Map、Set 这种运行时 API，需要通过 polyfill 提供；而 Proxy 这种对象级拦截能力无法完整模拟，这也是 Vue 3 无法兼容 IE11 的关键原因之一。兼容不是“全部交给 Babel”，而是语法转换、polyfill、目标环境三者共同决定。

### 代码抓手

```js
// 语法转换可以处理
const name = user?.profile?.name ?? 'anonymous'

// 运行时 API 需要环境或 polyfill 支持
const map = new Map()
const promise = Promise.resolve()
```

### 常见坑

1. 以为 Babel 能解决所有新特性兼容。
2. 组件库随意注入全局 polyfill，污染宿主环境。
3. 不看 browserslist 就谈兼容策略。

### 面试展开

我会说：Babel 解决的是语法层转换，polyfill 解决的是运行时 API 补齐，browserslist 决定目标环境。不是所有能力都能转译，比如 Proxy 和 BigInt 就有明显边界。

## 8.7 非标准与提案能力要带前提

### 定位

这一节提醒提案类能力不要和标准能力混写。

### 必会结论

1. 管道运算符仍属于提案能力，不能按稳定标准语法去背。
2. `Promise.try` 已进入标准，不应再简单说成“非标准库方法”。
3. 面试里遇到提案类能力，必须先说明标准化状态和工具链支持。

### 核心理解

前端知识更新很快，有些能力以前是库方法或提案，后来可能进入标准；有些能力长期停留在提案阶段。资深回答最重要的是带前提：这是标准能力、提案能力、工具链扩展，还是库封装。比如管道运算符要谨慎说明仍看提案和工具链；`Promise.try` 在现代语境下则不能再只当作 Bluebird 风格库方法来讲。

### 代码抓手

```js
function pipe(...fns) {
    return initialValue => fns.reduce((value, fn) => fn(value), initialValue)
}
const calculate = pipe(
    x => x + 10,
    x => x * 2,
    x => x - 5
)
console.log(calculate(10)) // 35
```

### 常见坑

1. 把提案语法当成已稳定标准。
2. 把已经进入标准的能力继续说成“非标准”。
3. 不区分语言标准、Babel 插件和第三方库封装。

### 面试展开

如果被问到提案类能力，我会先说明标准化状态，再谈它解决什么问题。工程里不是“能配 Babel 就能用”，还要看团队约定、浏览器目标和长期维护成本。

## 8.8 第八章速记

### 定位

这一节收束模块化和工程兼容主线。

### 必会结论

1. ESM 的核心是静态结构和 live binding。
2. 动态导入解决运行时按需加载。
3. tree-shaking 依赖静态分析和副作用判断。
4. 循环依赖本质是模块边界问题。
5. Babel、polyfill、browserslist 共同决定兼容策略。

### 面试展开

如果让我收口这一章，我会说：模块化不只是 import/export 写法，而是依赖关系、加载时机、静态分析、代码分割和兼容策略的综合问题。资深前端要能从模块边界和工具链行为上解释现象，而不是只背语法。

# 9 浏览器运行时、性能与内存管理

## 9.1 事件模型与事件委托

### 定位

这一节处理浏览器运行时里最常见的交互和性能切入口。

### 必会结论

1. 浏览器事件分捕获、目标、冒泡三个阶段。
2. `event.target` 是实际触发元素，`event.currentTarget` 是当前处理事件的元素。
3. 事件委托利用冒泡，把多个子元素监听收敛到父元素。
4. 不是所有事件都冒泡。

### 核心理解

事件委托的价值不是“写法更高级”，而是减少监听器数量，并且天然适合动态列表、懒渲染内容和统一交互入口。因为真正触发事件的是子节点，而冒泡阶段会一路向上，所以父节点可以统一处理子节点行为。但这依赖事件本身支持冒泡。

### 代码抓手

```js
document.querySelector('#list').addEventListener('click', event => {
    const target = event.target.closest('li')
    if (!target) return
    console.log('clicked:', target.dataset.id)
})
```

### 常见坑

1. 混淆 target 和 currentTarget。
2. 以为所有事件都能委托。
3. 委托处理时不做节点过滤，导致冒泡路径上的无关点击也被处理。

### 面试展开

我会说：事件委托是把多个子元素监听收敛到父节点，核心依赖的是冒泡机制。它能减少监听器数量，也更适合动态内容场景，但前提是事件本身支持冒泡。

## 9.2 渲染流程、重排与重绘

### 定位

这一节把浏览器性能问题放回渲染主线。

### 必会结论

1. 常见渲染流程可以概括为 DOM、CSSOM、渲染树、布局、绘制。
2. 重排通常比重绘更重，因为它涉及布局计算。
3. 不是所有样式变更都会触发重排。
4. 高频读写布局信息交替最容易造成性能抖动。

### 核心理解

浏览器渲染不是“改样式就直接画出来”，中间还要经过布局和绘制。像修改颜色这类变化往往只需要重绘；修改尺寸、位置、字体等则可能触发布局，也就是常说的重排。更常见的性能坑其实是布局抖动：你刚改了样式，又立刻读取 offsetWidth 这类布局信息，浏览器就可能被迫同步刷新布局。

### 代码抓手

```js
const box = document.querySelector('.box')
box.style.width = '200px'
// 这里读取布局信息，可能触发同步布局计算
console.log(box.offsetWidth)
```

### 常见坑

1. 把所有样式修改都说成重排。
2. 高频场景里反复读写布局信息。
3. 只关注 JS 执行时间，忽略渲染和布局成本。

### 面试展开

更工程化的说法是：浏览器性能问题不只是 JS 慢，还可能是布局和绘制成本高。真正高频的问题是长任务、布局抖动和过多 DOM。

## 9.3 垃圾回收与内存泄漏

### 定位

这一节处理运行时稳定性的核心问题。

### 必会结论

1. 主流垃圾回收依赖可达性判断。
2. 内存泄漏的本质是“本该不可达的对象仍然被引用”。
3. 全局变量、定时器、事件监听、闭包、大缓存、脱离文档的 DOM 都是高频泄漏来源。
4. WeakMap、WeakSet 适合做不会额外延长生命周期的对象关联缓存。

### 核心理解

JS 里很多人把“内存涨了”都叫泄漏，但更准确的判断标准是：对象是否本该被释放却仍然可达。比如页面销毁后，定时器还在跑，回调里闭包持有大对象；DOM 已经移除，但 JS 变量还引用着它；第三方图表实例没销毁，内部继续持有节点和监听器。泄漏不是语法问题，而是生命周期管理问题。

### 代码抓手

```js
const timer = setInterval(() => {
    console.log('poll')
}, 1000)

window.addEventListener('resize', onResize)

function destroy() {
    clearInterval(timer)
    window.removeEventListener('resize', onResize)
}
```

### 常见坑

1. 组件销毁或页面切换后忘记移除事件监听。
2. 缓存只加不清。
3. 第三方实例不用时不销毁。

### 面试展开

我会这样答：内存泄漏本质上是对象本该不可达却仍然被引用。闭包不是泄漏本身，定时器不是泄漏本身，问题在于这些机制如果没有配合正确的释放时机，就会让无用数据一直活着。

## 9.4 性能优化怎么拆才不像清单

### 定位

这一节把前端性能优化拉回系统化表达。

### 必会结论

1. 性能优化要分加载性能、执行性能、渲染性能、缓存与监控。
2. 首屏问题优先看资源体积、拆包和关键路径。
3. 交互卡顿优先看长任务、高频事件、DOM 规模和布局抖动。
4. 大列表、重计算、复杂图表要优先考虑虚拟化、缓存和 Worker。

### 核心理解

资深回答不应该只停留在“防抖节流、懒加载、缓存”。更稳的拆法是：资源层看体积和拆包，执行层看长任务和主线程占用，渲染层看 DOM 和布局，数据层看缓存和重复计算，监控层看指标采集和问题定位。这样组织起来，性能优化才像一个系统方案，而不是技巧拼盘。

### 面试展开

如果被问性能优化，我会先判断瓶颈在哪一层，再决定手段。加载慢优先看资源和架构，交互卡优先看主线程和渲染，内存涨优先看生命周期和缓存。

## 9.5 第九章速记

### 定位

这一节收束浏览器运行时主线。

### 必会结论

1. 事件委托依赖冒泡。
2. 渲染性能要看布局和绘制，不只看 JS。
3. 内存泄漏本质是可达性没断开。
4. 性能优化要按层次定位，而不是堆技巧。

### 面试展开

如果让我收口这一章，我会说：浏览器运行时问题主要落在事件、渲染、内存和主线程执行上。真正成熟的前端优化，不是记几个技巧，而是能先判断问题发生在哪一层。

# 10 设计模式与前端常见抽象

## 10.1 单例模式

### 定位

这一节开始把语言能力和应用层抽象接起来。

### 必会结论

1. 单例模式的目标是保证某个对象只有一个实例，并提供统一访问点。
2. 常见场景是全局配置、全局弹窗管理、全局缓存实例。
3. 单例不是“全局变量换个名字”，而是受控的唯一实例。

### 代码抓手

```js
class ConfigService {
    static instance
    static getInstance() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService()
        }
        return ConfigService.instance
    }
}
```

### 面试展开

我会说：单例模式的价值是控制实例数量和访问入口，但它也意味着全局共享状态，所以要谨慎控制职责范围和初始化时机。

## 10.2 发布订阅与观察者

### 定位

这一节处理前端里很常见但也很容易混叫的模式。

### 必会结论

1. 发布订阅通过事件中心解耦发布者和订阅者。
2. 观察者更偏对象之间的一对多依赖关系。
3. 前端里常见落地是 EventEmitter、事件中心、状态变化通知。
4. EventBus 适合做通知，不适合替代复杂状态管理。

### 面试展开

如果被问两者区别，我会说：发布订阅中间有事件中心，发布者和订阅者彼此不知道；观察者更像被观察对象直接维护观察者列表。前端里我们经常把 EventEmitter 叫发布订阅。

## 10.3 代理模式

### 定位

这一节把模式和 Proxy 能力连接起来。

### 必会结论

1. 代理模式是通过代理对象控制对目标对象的访问。
2. 常见场景是权限控制、数据校验、缓存代理、懒加载、响应式代理。
3. Vue 3 响应式本质上就体现了代理模式。

### 面试展开

我会说：代理模式不只是“中间包一层”，而是把访问控制、缓存、校验和副作用拦截统一放到代理层。前端里最典型的工程例子就是 Vue 3 的 Proxy 响应式。

## 10.4 装饰器模式

### 定位

这一节讲不修改原对象前提下的能力增强。

### 必会结论

1. 装饰器模式是在不修改原对象的前提下动态增强能力。
2. 常见场景是日志埋点、性能统计、权限校验、方法增强。
3. 高阶函数、高阶组件都能体现装饰思想。

### 代码抓手

```js
function withLog(fn) {
    return function (...args) {
        console.log('before')
        const result = fn.apply(this, args)
        console.log('after')
        return result
    }
}
```

### 面试展开

更稳的说法是：装饰器模式解决的是“在不改原实现的前提下增加横切能力”，常见于日志、埋点、鉴权和性能统计。

## 10.5 工厂模式

### 定位

这一节讲对象创建逻辑的抽象收敛。

### 必会结论

1. 工厂模式把创建逻辑封装起来，根据参数生成不同对象。
2. 常见场景是组件工厂、请求实例工厂、表单项工厂。
3. 它的价值在于把创建细节和使用方解耦。

### 代码抓手

```js
function createRequestClient(type) {
    if (type === 'fetch') return fetchClient
    if (type === 'mock') return mockClient
    return defaultClient
}
```

### 面试展开

我会说：工厂模式的重点不是“写一个 createX 函数”，而是把对象创建规则集中起来，让使用方只关心“我要什么”，而不是“这个对象怎么造”。

## 10.6 第十章速记

### 定位

这一节收束常见抽象模式。

### 必会结论

1. 单例解决唯一实例。
2. 发布订阅解决通知解耦。
3. 代理解决访问控制。
4. 装饰器解决无侵入增强。
5. 工厂解决创建逻辑抽离。

### 面试展开

如果让我收口这一章，我会说：设计模式在前端里真正有价值的地方，不是背名字，而是帮助我们把创建、通知、增强、访问控制这些重复问题抽象成稳定方案。

# 11 高频手写题与追问

## 11.1 这一章怎么用

### 定位

这一章不只是给答案，而是帮你建立“面试版实现”和“工程版追问”的双层意识。

### 必会结论

1. 面试里先写核心版，保证主流程正确。
2. 面试官继续追问时，再主动补边界、异常、兼容和复杂场景。
3. 不要一上来就把所有工程细节写满，容易失控。

## 11.2 手写 call

### 代码抓手

```js
Function.prototype.myCall = function (context, ...args) {
    if (typeof this !== 'function') throw new TypeError('must be function')
    context = context == null ? globalThis : Object(context)
    const key = Symbol('fn')
    context[key] = this
    const result = context[key](...args)
    delete context[key]
    return result
}
```

### 高频追问

1. 为什么 context 要用 `Object(context)` 包一下？
2. 为什么要用 Symbol 做临时键？
3. null/undefined 为什么默认指向 globalThis？

### 面试展开

面试版核心是三步：挂函数、执行、删除。继续追问时再补装箱、全局对象和异常安全。

## 11.3 手写 apply

### 代码抓手

```js
Function.prototype.myApply = function (context, args = []) {
    if (typeof this !== 'function') throw new TypeError('must be function')
    context = context == null ? globalThis : Object(context)
    const key = Symbol('fn')
    context[key] = this
    const result = context[key](...args)
    delete context[key]
    return result
}
```

### 面试展开

apply 和 call 的核心逻辑相同，差别只在参数形态。

## 11.4 手写 bind

### 代码抓手

```js
Function.prototype.myBind = function (context, ...args1) {
    if (typeof this !== 'function') throw new TypeError('must be function')
    const fn = this
    context = context == null ? globalThis : Object(context)
    function boundFn(...args2) {
        const thisArg = this instanceof boundFn ? this : context
        return fn.call(thisArg, ...args1, ...args2)
    }
    if (fn.prototype) {
        boundFn.prototype = Object.create(fn.prototype)
        boundFn.prototype.constructor = boundFn
    }
    return boundFn
}
```

### 高频追问

1. 为什么 bind 返回的新函数还能被 new？
2. 为什么要处理 `this instanceof boundFn`？
3. 预置参数和运行时参数怎么拼接？

### 面试展开

手写 bind 的核心难点不在返回函数，而在 new 场景。只要不处理这一点，基本都会被继续追问。

## 11.5 手写 new

### 代码抓手

```js
function myNew(Fn, ...args) {
    const obj = Object.create(Fn.prototype)
    const result = Fn.apply(obj, args)
    return result !== null && (typeof result === 'object' || typeof result === 'function') ? result : obj
}
```

### 面试展开

核心就是四步：创建对象、连接原型、执行构造函数、处理返回值覆盖规则。

## 11.6 手写 instanceof

### 代码抓手

```js
function myInstanceof(left, right) {
    if (left === null || (typeof left !== 'object' && typeof left !== 'function')) return false
    let proto = Object.getPrototypeOf(left)
    const prototype = right.prototype
    while (proto) {
        if (proto === prototype) return true
        proto = Object.getPrototypeOf(proto)
    }
    return false
}
```

### 面试展开

这道题真正考的是你是否知道 instanceof 本质在查原型链，而不是查类型标签。

## 11.7 手写防抖与节流

### 代码抓手

```js
function debounce(fn, delay, immediate = false) {
    let timer = null
    return function (...args) {
        const callNow = immediate && !timer
        clearTimeout(timer)
        timer = setTimeout(() => {
            timer = null
            if (!immediate) fn.apply(this, args)
        }, delay)
        if (callNow) return fn.apply(this, args)
    }
}

function throttle(fn, delay) {
    let last = 0
    return function (...args) {
        const now = Date.now()
        if (now - last >= delay) {
            last = now
            fn.apply(this, args)
        }
    }
}
```

### 高频追问

1. 立即执行版防抖怎么写？
2. 节流能不能补尾调用？
3. 组件卸载时如何取消？

### 面试展开

面试版先写最小可用版，继续追问再补 cancel、flush、尾调用和时间戳+定时器混合方案。

## 11.8 手写 Promise.all

### 代码抓手

```js
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = []
        let count = 0
        if (promises.length === 0) return resolve(results)
        promises.forEach((promise, index) => {
            Promise.resolve(promise).then(value => {
                results[index] = value
                count++
                if (count === promises.length) resolve(results)
            }, reject)
        })
    })
}
```

### 面试展开

核心考点不是循环本身，而是“保持结果顺序、统一 Promise 化、一个失败整体失败”。

## 11.9 手写并发控制

### 代码抓手

```js
function limitRequest(tasks, limit) {
    return new Promise(resolve => {
        const results = []
        let nextIndex = 0
        let running = 0
        function run() {
            if (nextIndex === tasks.length && running === 0) {
                resolve(results)
                return
            }
            while (running < limit && nextIndex < tasks.length) {
                const current = nextIndex++
                running++
                Promise.resolve(tasks[current]())
                    .then(res => {
                        results[current] = res
                    })
                    .catch(err => {
                        results[current] = err
                    })
                    .finally(() => {
                        running--
                        run()
                    })
            }
        }
        run()
    })
}
```

### 面试展开

并发控制题真正考的是任务调度能力：队列推进、并发窗口、结果归位、失败处理、结束时机。

## 11.10 手写深拷贝

### 代码抓手

```js
function deepClone(target, map = new WeakMap()) {
    if (target === null || typeof target !== 'object') return target
    if (map.has(target)) return map.get(target)
    if (target instanceof Date) return new Date(target)
    if (target instanceof RegExp) return new RegExp(target.source, target.flags)
    if (target instanceof Map) {
        const cloneMap = new Map()
        map.set(target, cloneMap)
        target.forEach((value, key) => cloneMap.set(deepClone(key, map), deepClone(value, map)))
        return cloneMap
    }
    if (target instanceof Set) {
        const cloneSet = new Set()
        map.set(target, cloneSet)
        target.forEach(value => cloneSet.add(deepClone(value, map)))
        return cloneSet
    }
    const cloneTarget = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target))
    map.set(target, cloneTarget)
    Reflect.ownKeys(target).forEach(key => {
        cloneTarget[key] = deepClone(target[key], map)
    })
    return cloneTarget
}
```

### 高频追问

1. 怎么处理循环引用？
2. 怎么处理 Symbol 键和不可枚举属性？
3. 怎么处理属性描述符、访问器属性、`RegExp.lastIndex`？

### 面试展开

深拷贝真正难点不是递归，而是特殊类型、循环引用、原型链、Symbol、不可枚举属性和属性描述符。

## 11.11 手写 EventEmitter

### 代码抓手

```js
class EventEmitter {
    constructor() {
        this.events = new Map()
    }
    on(event, fn) {
        const list = this.events.get(event) || []
        list.push(fn)
        this.events.set(event, list)
    }
    emit(event, ...args) {
        const list = this.events.get(event) || []
        list.slice().forEach(fn => fn(...args))
    }
    off(event, fn) {
        const list = this.events.get(event) || []
        this.events.set(
            event,
            list.filter(item => item !== fn)
        )
    }
    once(event, fn) {
        const wrapper = (...args) => {
            fn(...args)
            this.off(event, wrapper)
        }
        this.on(event, wrapper)
    }
}
```

### 面试展开

这道题除了 on/emit/off/once，还很适合继续追问异常隔离、重复订阅、最大监听数和类型约束。

## 11.12 手写数组转树与柯里化

### 代码抓手

```js
function arrayToTree(list) {
    const map = new Map()
    const result = []
    list.forEach(item => {
        map.set(item.id, { ...item, children: [] })
    })
    list.forEach(item => {
        const node = map.get(item.id)
        if (item.parentId == null) {
            result.push(node)
        } else {
            const parent = map.get(item.parentId)
            if (parent) parent.children.push(node)
            else result.push(node)
        }
    })
    return result
}

function curry(fn, ...args) {
    return function (...rest) {
        const allArgs = args.concat(rest)
        if (allArgs.length >= fn.length) {
            return fn.apply(this, allArgs)
        }
        return curry(fn, ...allArgs)
    }
}
```

### 面试展开

数组转树会继续追问无序输入、孤儿节点、重复 id、多根节点；柯里化会继续追问占位符、函数长度和 this 透传。

## 11.13 第十一章速记

### 定位

这一节收束手写题思路。

### 必会结论

1. 手写题先保核心逻辑正确。
2. 继续追问时再补边界和工程性。
3. 每道手写题背后都对应一条语言机制主线。

### 面试展开

如果让我收口这一章，我会说：手写题不是考你会不会背模板，而是考你是否理解语言机制、边界条件，以及能不能区分面试版实现和工程版实现。

# 12 高频面试题与分层展开

## 12.1 题目：闭包的本质是什么，怎么避免闭包问题？

### 考点

词法作用域、环境引用、生命周期、内存管理。

### 3-5 年回答

闭包的本质是函数能访问并持有它定义时外层作用域里的变量。外层函数执行完后，如果内部函数还被引用，对应变量就不会立刻销毁。闭包常用于私有变量、状态保存、防抖节流和缓存。

### 5-7 年展开

更准确的说法是：闭包不是“函数套函数”，而是函数持有其定义时词法环境的引用。它本身不是问题，问题在于被闭包持有的数据如果已经不再需要，却仍然被引用，那就会造成额外内存占用甚至泄漏风险。工程里要结合组件卸载、事件解绑、缓存清理来管理闭包生命周期。

### 高频追问与回答

1. 闭包为什么不会让外层变量立刻释放？
   答：因为内部函数仍然引用着这份词法环境，GC 看起来它仍然可达。
2. 闭包和内存泄漏是什么关系？
   答：闭包不是泄漏本身，但它会延长变量生命周期。如果里面持有大对象、DOM、旧状态却没有释放，就可能形成泄漏。
3. 防抖节流为什么也和闭包有关？
   答：因为定时器句柄、旧参数、旧 this 都常常保存在返回函数形成的闭包里。

### 易错点

1. 把闭包等同于内存泄漏。
2. 只背“访问外层变量就是闭包”，不会讲词法环境引用。

## 12.2 题目：Promise 为什么状态不可逆？

### 考点

Promise 状态机、异步一致性、then 链路。

### 3-5 年回答

Promise 只有 pending、fulfilled、rejected 三种状态，一旦从 pending 变成 fulfilled 或 rejected，就不能再变。这样做是为了保证异步结果可预测，避免同一个任务被多次成功或多次失败。

### 5-7 年展开

状态不可逆不仅是使用体验问题，也是实现复杂度和一致性问题。如果 Promise 状态可以反复变化，那么 then 链的执行、回调幂等性、错误传播和调度语义都会变得非常混乱。不可逆状态保证了异步流程在任意时刻都能被稳定解释。

### 高频追问与回答

1. executor 是同步还是异步？
   答：同步执行，异步的是 then/catch/finally 回调调度。
2. 为什么 then 能链式调用？
   答：因为 then 返回的是新的 Promise，回调返回值会进入新的解析流程。

### 易错点

1. 说 Promise 构造函数异步执行。
2. 说状态可以从 fulfilled 再变 rejected。

## 12.3 题目：为什么 then 可以链式调用？

### 考点

新 Promise、解析流程、thenable、异常传播。

### 3-5 年回答

因为 then 返回新的 Promise。上一个 then 回调的返回值会决定新 Promise 的状态：返回普通值就成功，返回 Promise 就跟随它，抛异常就失败。

### 5-7 年展开

更完整的说法要补 thenable 吸收。也就是说，回调返回的不只是普通值和 Promise，还可能是一个带 then 的对象。Promise 规范会尝试按 thenable 解析它。Promise/A+ 的难点就在这里，还要处理循环引用保护。

### 高频追问与回答

1. catch 本质是什么？
   答：本质上是 `then(null, onRejected)`。
2. finally 为什么不会改掉原有成功值或失败原因？
   答：因为它更像旁路回调，默认会把原来的完成值或拒因继续向下穿透。

### 易错点

1. 以为 then 返回原 Promise。
2. 不知道 thenable 吸收流程。

## 12.4 题目：Map 和 Object 应该怎么选？

### 考点

结构化数据、动态键、键类型、迭代能力。

### 3-5 年回答

固定结构的业务对象优先用 Object，动态键值关系、缓存和对象做键的场景优先用 Map。

### 5-7 年展开

更资深的讲法要补三点：第一，Object 的键会被限制为字符串或 Symbol；第二，Map 保留插入顺序且原生可迭代；第三，Map 更适合依赖关系、节点映射、缓存索引这类运行时动态结构。不是哪个更新，而是哪种语义更合适。

### 高频追问与回答

1. 为什么 WeakMap 不适合做统计？
   答：因为它不可遍历，也没有 size，这是为了不暴露 GC 时机。
2. Object 什么时候仍然是更好的选择？
   答：当它表达的是业务结构记录，比如用户、配置、DTO，而不是动态键表。

### 易错点

1. 把一切键值结构都写成对象。
2. 只记住“Map 键可以是对象”，却讲不出为什么这很重要。

## 12.5 题目：Proxy 相比 Object.defineProperty 有什么优势？

### 考点

对象级拦截、属性级拦截、框架响应式。

### 3-5 年回答

`Object.defineProperty` 主要是属性级的 getter/setter 拦截，新增属性、删除属性、数组索引变化这类场景处理起来比较别扭。Proxy 是对象级代理，能拦截更多操作。

### 5-7 年展开

更完整的回答是：defineProperty 需要提前逐个属性劫持，无法天然处理新增属性、删除属性、in、ownKeys、数组索引和函数调用等操作；Proxy 则能在对象层统一拦截这些行为，所以更适合响应式、访问控制和代理层设计。但它无法被完整 polyfill，这也带来兼容边界。

### 高频追问与回答

1. 为什么 Vue 3 选择 Proxy？
   答：因为它要解决 Vue 2 在新增属性、数组索引和对象级拦截上的局限。
2. 为什么 Proxy 让 Vue 3 放弃 IE11？
   答：因为 Proxy 无法被完整降级模拟，兼容成本不可接受。

### 易错点

1. 把 Proxy 说成只是“更方便的 defineProperty”。
2. 忘记 Proxy 的兼容边界。

## 12.6 题目：ES Module 为什么更适合 tree-shaking？

### 考点

静态结构、live binding、编译期分析、构建优化。

### 3-5 年回答

因为 ESM 的 import/export 结构是静态的，打包工具在编译阶段就能分析哪些导出被使用、哪些没用，所以更适合做 tree-shaking。

### 5-7 年展开

更完整的说法是：tree-shaking 真正依赖的是“模块关系可静态分析”。ESM 顶层导入导出让依赖图更清晰，工具链更容易裁剪未使用导出；但如果模块本身有副作用、动态访问、错误的 sideEffects 声明，还是会影响最终结果。所以不是“用了 ESM 就一定摇干净”，而是它提供了更好的前提。

### 高频追问与回答

1. CommonJS 为什么更难 tree-shaking？
   答：因为 require 更偏运行时，能放在条件和动态路径里，静态分析难度更高。
2. live binding 是什么？
   答：ESM 导入的是绑定关系，不是值拷贝，所以导出端更新后，导入端访问到的是最新绑定结果。

### 易错点

1. 把 tree-shaking 完全归因于 ESM 语法。
2. 忘记副作用和打包工具实现也会影响结果。

## 12.7 题目：前端性能优化应该怎么拆？

### 考点

资源、执行、渲染、缓存、监控。

### 3-5 年回答

我会先分加载性能和运行性能。加载性能看资源体积、懒加载、拆包；运行性能看高频事件、DOM 数量、长任务、缓存和不必要计算。

### 5-7 年展开

更成熟的回答应该按层来拆：资源层看首屏体积和关键路径；执行层看主线程长任务、事件循环压力；渲染层看 DOM 规模、布局抖动、绘制成本；数据层看缓存、重复计算和并发策略；监控层看指标和回归验证。这样能体现你不是在背技巧，而是在做系统分析。

### 高频追问与回答

1. 为什么有时候 JS 不慢但页面还是卡？
   答：因为布局、绘制、图片解码和主线程长任务都可能导致卡顿，不是所有卡顿都来自 JS 算法。
2. 为什么虚拟列表常常比纠结 diff 更有效？
   答：因为大列表很多时候瓶颈是 DOM 数量和布局成本，而不是单纯的 JS diff。

### 易错点

1. 没定位瓶颈就开始优化。
2. 把性能优化讲成技巧清单。

## 12.8 第十二章速记

### 定位

这一节给整本文档做最终收口。

### 必会结论

1. JS 核心不是 API 集合，而是值模型、执行模型、对象模型和运行时模型。
2. ES6+ 不是“新语法包”，而是对作用域、集合、模块化、异步控制流和工程表达的系统增强。
3. 资深面试真正看的是：能不能把语言机制、边界条件、工程落地和面试表达串起来。

### 面试展开

如果让我用 1 分钟收口整本文档，我会说：JavaScript 的核心要按四条主线理解。第一是值和对象模型，决定类型、拷贝、比较和状态共享；第二是执行与作用域模型，决定上下文、闭包和 this；第三是对象与原型模型，决定继承和类；第四是异步、模块和浏览器运行时模型，决定 Promise、事件循环、模块边界和工程性能。ES6+ 不是简单加语法，而是在这些主线上把 JS 变得更适合现代工程。

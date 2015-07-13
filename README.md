# math.diff.js

A plugin for [Math.js](http://mathjs.org) that calculates
symbolic derivatives in JavaScript.

Demo: <https://rawgit.com/hausen/math.diff.js/master/demo.html>

Suggestions, bug reports and pull requests are welcome!

## Usage

1. Load the necessary files 
```html
<!-- load math.js first... -->
<script src="math.js"></script>
<!-- ... and then load math.diff.js -->
<script src="math.diff.js"></script>
```
2. Differentiate an expression
```javascript
var expr = math.parse("4*x^3 + 3*x^2 + 2*x + 1");
var derivative = math.diff(expr, "x");
```

### What works

Arithmetic operations: ``+``, ``-``, ``*``, ``/`` and ``^``.

Functions: ``sqrt``, ``log`` (natural logarithm), ``sin``, ``cos``,
``tan``, ``sec``, ``csc``, ``cot``.
For any other function ``f``, its derivative will not be explicitly
evaluated; instead, it will be represented by ``f'``.

Constants: ``e`` and ``pi``.

Some trivial simplifications, such as ``2*3*x = 6*x`` are performed.

### Todo

Implement inverse trigonometric functions.

Handle multivariable functions.

Improve simplification.

Unit tests.

## Why?

I am teaching a course on numerical analysis and wondered if there was
a simple way to calculate symbolic derivatives on a web page without
relying on a server. I tried a couple of JavaScript libraries that
should do the trick, but they didn't work as expected; to make matters
worse, they were huge and seemed to be unmaintained.

Also, it was late in the night, I was bored and sleepless.

## License

[GNU Affero Public License v. 3.0](http://www.gnu.org/licenses/agpl-3.0.html)

## Thanks to

[verteu](https://news.ycombinator.com/user?id=verteu)

# math.diff.js

A plugin for [Math.js](http://mathjs.org) that calculates
symbolic derivatives in JavaScript.

Demo: <https://rawgit.com/hausen/math.diff.js/master/demo.html>

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

Functions: ``sin``, ``cos``. For any other function ``f``,
its derivative will not be explicitly evaluated; instead, it will be
represented by ``f'``.

Constants: ``e`` and ``pi``.

Some trivial simplifications, such as ``2*3*x = 6*x`` are performed.

### Todo

Implement ``sqrt``, ``log`` and all trigonometric and inverse
trigonometric functions.

Improve simplification.

Unit tests.

## License

[GNU Affero Public License v. 3.0](http://www.gnu.org/licenses/agpl-3.0.html)

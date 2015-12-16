/**
 * Copyright © 2015 Rodrigo Hausen <http://github.com/hausen/math.diff.js>
 * This file is made available under the GNU Affero General Public License
 * version 3.0 or higher (AGPLv3).
 */
math.differentiation = {
  substituteConstants: false,
  eName: 'e',
  piName: 'pi'
}

math.setIsConstant = function (node, varname) {
  if (node.type == 'ConstantNode') {
    node.isconstant = true;
    return;
  }

  if (node.type == 'SymbolNode') {
    if (node.name != varname) {
      node.isconstant = true;
    } else {
      node.isconstant = false;
    }
    return;
  }

  var constantChildren = 0;
  var numChildren = 0;
  if (node.args) {
    numChildren = node.args.length;
    for (var i=0; i<numChildren; ++i) {
      math.setIsConstant(node.args[i], varname);
      if (node.args[i].isconstant) {
        ++constantChildren;
      }
    }
  }
  if (constantChildren == numChildren) {
    node.isconstant = true;
  } else {
    node.isconstant = false;
  }
}

math.cloneNode = function (node, varname) {
  if (node.type == 'ParenthesisNode') {
    return math.cloneNode(node.content, varname);
  }
  if (math.differentiation.substituteConstants) {
    if (node.type == 'SymbolNode' &&
        node.name == math.differentiation.piName) {
      return math.getConstantNode(math.pi);
    } else if (node.type == 'SymbolNode' &&
               node.name == math.differentiation.eName) {
      return math.getConstantNode(math.e);
    }
  }
  var newnode = node.clone();
  math.setIsConstant(newnode, varname);
  return newnode;
}

math.unaryMinusNode = function (node) {
  if (node.type == 'ConstantNode') {
    var val = parseFloat(node.value);
    var ret = new math.expression.node.ConstantNode(-val);
    ret.isconstant = true;
    return ret;  
  } else if (node.type == 'OperatorNode' && node.fn == 'subtract') {
    var ret = new math.expression.node.OperatorNode('-', 'subtract',
                                                    [node.args[1],
                                                     node.args[0]]);
    ret.isconstant = (node.args[1].isconstant && node.args[0].isconstant);
    return ret;
  } else {
    var ret = new math.expression.node.OperatorNode('-', 'unaryMinus',
                                                    [node]);
    ret.isconstant = node.isconstant;
    return ret;
  }
}

math.addNodes = function (node0, node1) {
  if (node0.type == 'ConstantNode' && node1.type == 'ConstantNode') {
    var val = parseFloat(node0.value) + parseFloat(node1.value);
    var ret = new math.expression.node.ConstantNode(val);
    ret.isconstant = true;
    return ret;  
  } else if (node0.type == 'ConstantNode' && node0.value == '0') {
    return node1;
  } else if (node1.type == 'ConstantNode' && node1.value == '0') {
    return node0;
  } else {
    var ret = new math.expression.node.OperatorNode('+', 'add',
                                                    [node0, node1]);
    ret.isconstant = (node0.isconstant && node1.isconstant);
    return ret;
  }
}

math.subtractNodes = function (node0, node1) {
  if (node0.type == 'ConstantNode' && node1.type == 'ConstantNode') {
    var val = parseFloat(node0.value) - parseFloat(node1.value);
    var ret = new math.expression.node.ConstantNode(val);
    ret.isconstant = true;
    return ret;
  } else if (node1.type == 'ConstantNode' && node1.value == '0') {
    return node0;
  } else if (node0.type == 'ConstantNode' && node0.value == '0') {
    return math.unaryMinusNode(node1);
  } else {
    var ret = new math.expression.node.OperatorNode('-', 'subtract',
                                                    [node0, node1]);
    ret.isconstant = (node0.isconstant && node1.isconstant);
    return ret;
  }
}

math.multiplyNodes = function (node0, node1) {
  if (node0.type == 'ConstantNode') {
    if (node0.value == '0') {
      return node0;
    } else if (node1.type == 'ConstantNode') {
      var val = parseFloat(node0.value) * parseFloat(node1.value);
      var ret = new math.expression.node.ConstantNode(val);
      ret.isconstant = true;
      return ret;  
    } else if (node1.type == 'OperatorNode' && node1.fn == 'multiply'
               && (node1.args[0].type == 'ConstantNode'
                   || node1.args[1].type == 'ConstantNode') ) {
      if (node1.args[0].type == 'ConstantNode' &&
          node1.args[1].type == 'ConstantNode') {
        var val = parseFloat(node0.value) * parseFloat(node1.args[0].value)
                  * parseFloat(node1.args[1].value);
        var ret = new math.expression.node.ConstantNode(val);
        ret.isconstant = true;
        return ret;  
      } else if (node1.args[0].type == 'ConstantNode') {
        var val = parseFloat(node0.value) * parseFloat(node1.args[0].value);
        var constNode = new math.expression.node.ConstantNode(val);
        constNode.isconstant = true;
        var n = new math.expression.node.OperatorNode('*', 'multiply',
                                                      [constNode,
                                                       node1.args[1]]);
        n.isconstant = node1.args[1].isconstant;
        return n;
      } else {
        var val = parseFloat(node0.value) * parseFloat(node1.args[1].value);
        var constNode = new math.expression.node.ConstantNode(val);
        constNode.isconstant = true;
        var n = new math.expression.node.OperatorNode('*', 'multiply',
                                                      [constNode,
                                                       node1.args[0]]);
        n.isconstant = node1.args[0].isconstant;
        return n;
      }
    } else if (node0.value == '1') {
      return node1;
    } else if (node0.value == '-1') {
      return math.unaryMinusNode(node1);
    } else {
      var n = new math.expression.node.OperatorNode('*', 'multiply',
                                                    [node0, node1]);
      n.isconstant = node1.isconstant;
      return n;
    }
  } else if (node1.type == 'ConstantNode') {
    return math.multiplyNodes(node1, node0);
  } else {
    var n = new math.expression.node.OperatorNode('*', 'multiply',
                                                  [node0, node1]);
    n.isconstant = (node0.isconstant && node0.isconstant);
    return n;
  }
}

math.divideNodes = function (node0, node1) {
  if (node1.type == 'ConstantNode' && node1.value == '1') {
    return node0;
  } else if (node1.type == 'ConstantNode' && node1.value == '-1') {
    return math.multiplyNodes(node0, node1);
  } else if (node0.type == 'ConstantNode' && node0.value == '0') {
    return node0;
  } else if (node0.type == 'ConstantNode' && node1.type == 'ConstantNode') {
    var val = parseFloat(node0.value) / parseFloat(node1.value);
    var ret = new math.expression.node.ConstantNode(val);
    ret.isconstant = true;
    return ret;  
  }
  var n = new math.expression.node.OperatorNode('/', 'divide',
                                                [node0, node1]);
  n.isconstant = (node0.isconstant && node0.isconstant);
  return n;
}

math.powNodes = function (node0, node1) {
  // TODO: how to deal with 0^0?
  if (node1.type == 'ConstantNode' && node1.value == '1' ||
      node0.type == 'ConstantNode' && node0.value == '0' ||
      node0.type == 'ConstantNode' && node0.value == '1') {
    return node0;
  } else if (node1.type == 'ConstantNode' && node1.value == '0') {
    return math.getConstantNode(1);
  }
  var node = new math.expression.node.OperatorNode('^', 'pow',
                                                   [node0, node1]);
  node.isconstant = (node0.isconstant && node1.isconstant);
  return node;
}

math.logNode = function (node) {
  if (node.type == 'ConstantNode' && node.value == '1') {
    return math.getConstantNode(0);
  } else if (node.type == 'ConstantNode' && node.value == math.e) {
    return math.getConstantNode(1);
  } else if (node.type == 'SymbolNode' &&
             node.name == math.differentiation.eName) {
    return math.getConstantNode(1);
  }
  var n = new math.expression.node.FunctionNode('log', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.sinNode = function (node) {
  if (node.type == 'ConstantNode') {
    var value = math.sin(parseFloat(node.value));
    var ret = new math.expression.node.ConstantNode(value);
    ret.isconstant = true;
    return ret;
  } else if (node.type == 'SymbolNode' &&
             node.name == math.differentiation.piName) {
    return math.getConstantNode(0);
  } 
  var n = new math.expression.node.FunctionNode('sin', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.cosNode = function (node) {
  if (node.type == 'ConstantNode') {
    var value = math.cos(parseFloat(node.value));
    var ret = new math.expression.node.ConstantNode(value);
    ret.isconstant = true;
    return ret;
  } else if (node.type == 'SymbolNode' &&
             node.name == math.differentiation.piName) {
    return math.getConstantNode(-1);
  } 
  var n = new math.expression.node.FunctionNode('cos', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.tanNode = function (node) {
  if (node.type == 'ConstantNode') {
    var value = math.tan(parseFloat(node.value));
    var ret = new math.expression.node.ConstantNode(value);
    ret.isconstant = true;
    return ret;
  } else if (node.type == 'SymbolNode' &&
             node.name == math.differentiation.piName) {
    return math.getConstantNode(0);
  } 
  var n = new math.expression.node.FunctionNode('tan', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.secNode = function (node) {
  if (node.type == 'ConstantNode') {
    var value = math.sec(parseFloat(node.value));
    var ret = new math.expression.node.ConstantNode(value);
    ret.isconstant = true;
    return ret;
  } else if (node.type == 'SymbolNode' &&
             node.name == math.differentiation.piName) {
    return math.getConstantNode(-1);
  } 
  var n = new math.expression.node.FunctionNode('sec', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.cscNode = function (node) {
  if (node.type == 'ConstantNode') {
    var value = math.csc(parseFloat(node.value));
    var ret = new math.expression.node.ConstantNode(value);
    ret.isconstant = true;
    return ret;
  }
  var n = new math.expression.node.FunctionNode('csc', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.cotNode = function (node) {
  if (node.type == 'ConstantNode') {
    var value = math.cot(parseFloat(node.value));
    var ret = new math.expression.node.ConstantNode(value);
    ret.isconstant = true;
    return ret;
  }
  var n = new math.expression.node.FunctionNode('cot', [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.funcNode = function (node, funcname) {
  var n = new math.expression.node.FunctionNode(funcname, [node]);
  n.isconstant = node.isconstant;
  return n;
}

math.diffUnaryMinus = function (node, varname) {
  return math.unaryMinusNode(math.diff(node.args[0], varname));
}

math.diffAdd = function (node, varname) {
  var newnode0 = math.diff(node.args[0], varname);
  var newnode1 = math.diff(node.args[1], varname);
  return math.addNodes(newnode0, newnode1);
}

math.diffSubtract = function (node, varname) {
  var newnode0 = math.diff(node.args[0], varname);
  var newnode1 = math.diff(node.args[1], varname);
  return math.subtractNodes(newnode0, newnode1);
}

math.diffMultiply = function (node, varname) {
  var node0 = math.diff(node.args[0], varname);
  var node1 = math.cloneNode(node.args[1], varname);
  var nodeLeft = math.multiplyNodes(node0, node1);

  var node2 = math.cloneNode(node.args[0], varname);
  var node3 = math.diff(node.args[1], varname);
  var nodeRight = math.multiplyNodes(node2, node3);

  return math.addNodes(nodeLeft, nodeRight);
}

math.diffDivide = function (node, varname) {
  var dfx = math.diff(node.args[0], varname); // f'(x)
  var gx = math.cloneNode(node.args[1], varname); // g(x)
  var nodeLeft = math.multiplyNodes(dfx, gx); // f'(x)*g(x)

  var fx = math.cloneNode(node.args[0], varname); //  f(x)
  var dgx = math.diff(node.args[1], varname); // g'(x)
  var nodeRight = math.multiplyNodes(fx, dgx); // f(x)*g'(x)

  var num = math.subtractNodes(nodeLeft, nodeRight); // f'(x)*g(x) - f(x)*g'(x)

  fx = math.cloneNode(node.args[1], varname);
  var den = math.powNodes(fx, math.getConstantNode(2));
  // (f'(x)*g(x) - f(x)*g'(x)) / (g(x))^2

  return math.divideNodes(num, den);
}

math.diffPow = function (node, varname) { // d/dx f(x)^g(x)
  var fx = math.cloneNode(node.args[0], varname); // f(x)
  var gx = math.cloneNode(node.args[1], varname); // g(x)
  if (fx.isconstant && gx.isconstant) {
    return math.diffConstantNode(fx, varname);
  } else if (gx.isconstant) {
    var gx1 = math.subtractNodes(math.cloneNode(gx, varname),
                                 math.getConstantNode(1)); // g-1
    var n = math.multiplyNodes(gx, math.powNodes(fx, gx1)); // g*f(x)^(g-1)
    var dfx = math.diff(fx, varname); // f'(x)
    return math.multiplyNodes(n, dfx); // g*f(x)^(g-1)*f'(x)
  } else if (fx.isconstant) {
    var n = math.multiplyNodes(math.powNodes(fx, gx),
                               math.logNode(fx)); // f^g(x) log(f)
    return math.multiplyNodes(n, math.diff(gx, varname)); // f^g(x) log(f) g'(x)
  } else {
    var dfx = math.diff(fx, varname); // f'(x)
    var dgx = math.diff(gx, varname); // g'(x)

    var n = math.multiplyNodes(dfx, gx); // f'g 
    n = math.divideNodes(n, fx); // f'g / f
    n = math.addNodes(dgx, n); // g' + f'g / f
    var log_fx = new math.expression.node.FunctionNode('log', [fx]);
    log_fx.isconstant = fx.isconstant;
    n = math.multiplyNodes(log_fx, n); // log(f) ( g' + f'g / f )
    var fx_pow_gx = math.powNodes(fx, gx);
    n = math.multiplyNodes(fx_pow_gx, n); // f^g log(f) ( g' + f'g / f )
    return n;
  }
}

math.diffOperatorNode = function (node, varname) {
  if (node.fn == 'unaryPlus') {
    return math.diff(node.args[0], varname);
  } else if (node.fn == 'unaryMinus') {
    return math.diffUnaryMinus(node, varname);
  } else if (node.fn == 'add') {
    return math.diffAdd(node, varname);
  } else if (node.fn == 'subtract') {
    return math.diffSubtract(node, varname);
  } else if (node.fn == 'multiply') {
    return math.diffMultiply(node, varname);
  } else if (node.fn == 'divide') {
    return math.diffDivide(node, varname);
  } else if (node.fn == 'pow') {
    return math.diffPow(node, varname);
  }
}

math.diffSin = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  return math.multiplyNodes(dfx, math.cosNode(fx));
}

math.diffCos = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  return math.multiplyNodes(dfx, math.unaryMinusNode(math.sinNode(fx)));
}

math.diffTan = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  var sec = math.powNodes(math.secNode(fx), math.getConstantNode(2));

  return math.multiplyNodes(dfx, sec);
}

math.diffSec = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  var sectan = math.multiplyNodes(math.secNode(fx), math.tanNode(fx));

  return math.multiplyNodes(dfx, sectan);
}

math.diffCsc = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  var cotcsc = math.multiplyNodes(math.unaryMinusNode(math.cotNode(fx)),
                                  math.cscNode(fx));

  return math.multiplyNodes(dfx, cotcsc);
}

math.diffCot = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  var cot2 = math.powNodes(math.cscNode(fx), math.getConstantNode(2));
  return math.multiplyNodes(dfx, math.unaryMinusNode(cot2));
}

math.diffSqrt = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname); // f(x)
  var dfx = math.diff(node.args[0], varname); // f'(x)
  var sqrtNode = math.funcNode(fx, 'sqrt'); // sqrt(f(x))
  var denom = math.multiplyNodes(math.getConstantNode(2),
                                 sqrtNode); // 2*sqrt(f(x))
  return math.divideNodes(dfx, denom); // f'(x) / (2*sqrt(f(x)))
}

math.diffLog = function (node, varname) {
  var fx = math.cloneNode(node.args[0], varname); // f(x)
  var dfx = math.diff(node.args[0], varname); // f'(x)
  return math.divideNodes(dfx, fx); // f'(x) / f(x)
}

math.diffFunc = function (node, varname) {
  // TODO: handle multivariable functions
  var fx = math.cloneNode(node.args[0], varname);
  var dfx = math.diff(node.args[0], varname);
  return math.multiplyNodes(dfx, math.funcNode(fx, node.name + '\''));
}

math.diffFunctionNode = function (node, varname) {
  if (node.name == 'sin') {
    return math.diffSin(node, varname);
  } else if (node.name == 'cos') {
    return math.diffCos(node, varname);
  } else if (node.name == 'tan') {
    return math.diffTan(node, varname);
  } else if (node.name == 'sec') {
    return math.diffSec(node, varname);
  } else if (node.name == 'csc') {
    return math.diffCsc(node, varname);
  } else if (node.name == 'cot') {
    return math.diffCot(node, varname);
  } else if (node.name == 'sqrt') {
    return math.diffSqrt(node, varname);
  } else if (node.name == 'log') {
    return math.diffLog(node, varname);
  } else {
    return math.diffFunc(node, varname);
  }
}

math.diffSymbolNode = function (node, varname) {
  if (node.name == varname) {
    return math.getConstantNode(1);
  } else {
    return math.diffConstantNode(node, varname);
  }
}

math.diffConstantNode = function (node, varname) {
  return math.getConstantNode(0);
}

math.getConstantNode = function (value) {
  var ret = new math.expression.node.ConstantNode(value);
  ret.isconstant = true;
  return ret;
}

math.diff = function (node, varname) {
  if (node.type == 'ConstantNode' || node.isconstant) {
    return math.diffConstantNode(node, varname);
  } else if ( node.type == 'SymbolNode') {
    return math.diffSymbolNode(node, varname);
  } else if (node.type == 'OperatorNode') {
    return math.diffOperatorNode(node, varname);
  } else if (node.type == 'FunctionNode') {
    return math.diffFunctionNode(node, varname);
  } else if (node.type == 'ParenthesisNode') {
    return math.diff(node.content, varname);
  }
}

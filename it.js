/** -------------------------------------------------------------------------------------------------------------------
 * it.js
 */

(function (global, window, Function, Object, String, Array, RegExp, Date, Error, Promise) {
  global = this; window = global.window;
  const currentScript = document.currentScript;
  const cases = currentScript.getAttribute("tests");
  const debug = currentScript.hasAttribute("debug");
  if(!debug) document.head.removeChild(currentScript);

  //const BROWSER = 1
  /** -----------------------------------------------------------------------------------------------
   * lib.js
   */
  
  var undefined;
  
  /** --------------------------------------------------------------------------
   * Function
   */
  var nop = Function.prototype;
  var _call = nop.call;
  var _apply = nop.apply;
  var _bind = nop.bind;
  var func = _call.bind(_bind, _call);
  var bind = func(_bind);
  var call = func(_call);
  var apply = func(_apply);
  
  function isFunction(any) {
    return typeof any === 'function';
  }
  
    /** --------------------------------------------------------------------------
     * Object
     */
    var Object_prototype = Object.prototype;
    var create = Object.create;
    var getPrototype = Object.getPrototypeOf;
    var setPrototype = Object.setPrototypeOf;
    var _isPrototypeOf = Object_prototype.isPrototypeOf;
  
    function isObject(any) {
      return Object(any) === any;    // typeof any === 'object' && any !== nil;
    }
  
    function genusof(any) {
      return any === null ? "null" : typeof any;
    }
  
    var reTrimTag = /\[object |\]/g;
    function tagof(any) {
      return replace(call(Object_prototype.toString, any), reTrimTag, '');
    }
  
    var hasOwnProperty = func(Object_prototype.hasOwnProperty);
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  
    function hasProperty(obj, prop) {
      while (obj) {
        if (hasOwnProperty(obj, prop))
          return obj;
        obj = getPrototype(obj);
      }
    }
  
    function getPropertyDescriptor(obj, prop) {
      var desc;
      while (obj) {
        if (desc = getOwnPropertyDescriptor(obj, prop))
          return desc;
        obj = getPrototype(obj);
      }
    }
  
    /** --------------------------------------------------------------------------
     * String
     */
    var String_prototype = String.prototype;
  
    function isString(any) {
      return typeof any === 'string';
    }
  
    var trim = func(String_prototype.trim);
    var replace = func(String_prototype.replace);
    var match = func(String_prototype.match);
    var split = func(String_prototype.split);
    var stringify = JSON.stringify;
  
    /** --------------------------------------------------------------------------
     * Array
     */
    var Array_prototype = Array.prototype;
    var piece = func(Array_prototype.slice);
    var splice = func(Array_prototype.splice);
    var push = func(Array_prototype.push);
    var pop = func(Array_prototype.pop);
  
    /** --------------------------------------------------------------------------
     * RegExp
     */
    function isRegExp(any) {
      return any instanceof RegExp;
    }
  
    /** --------------------------------------------------------------------------
     * Date
     */
    var now = Date.now;
  
    /** --------------------------------------------------------------------------
     * Iterator, Promise, Generator, Async Function
     */
    var isIterator = bind(_isPrototypeOf, getPrototype(getPrototype(''[Symbol.iterator]())));
    var isPromise = bind(_isPrototypeOf, Promise.prototype);
  
    function isGeneratorFunction(any) {
      return tagof(any) === 'GeneratorFunction';
    }
  
    function isAsyncFunction(any) {
      return tagof(any) === 'AsyncFunction';
    }
  
    function isSyncFunction(any) {
      return tagof(any) === 'Function';
    }
  
    /** indent(code, spaces) 缩进代码行 */
    function indent(code, spaces) {
      return code.replace(/^/gm, spaces);
    }
  
  
  /** -----------------------------------------------------------------------------------------------
   * log.js
   */
  
  function report(it) {
    if (!(it.end = it.parent.end)) {
      var s = it.topic;
      if (it.ms) {
        s += format(" (timeout #m%dms)", it.ms);
      }
      if (it.fail) {
        s = format("#f✘ %s\n#e%s%s", s, indent(it.fail, "  "), it.trace ? "\n" + indent(it.trace, "  #m") : "");
      }
      else {
        s = format("#s✔ %s", s);
      }
      log("%s", indent(s, it.indent));
      it.end = 1;
    }
  }
  
  function review() {
    var me = this, it = me.its[me.its.length - 1];
    if (it && !it.func && !it.end) {
      var s = '#t• ' + it.topic;
      if (it.trace)
        s += indent('\n#e' + it.trace, '  ');
      log(indent(s, it.indent));
    }
  }
  
  function log() {
    print(format.apply(undefined, arguments));
  }
  
  const server = cases
    ? Server()
    : nop;
  function print(s) {
    server("log", textcolor(s))
    console.log.apply(console, argscolor(arguments));
  }
  
  const textcolors = {
    0: "\x1b[0m",
    i: "\u001b[0m\u001b[37m",
    s: "\u001b[1m\u001b[32m",
    f: "\u001b[1m\u001b[31m",
    e: "\u001b[0m\u001b[31m",
    t: "\u001b[1m\u001b[34m",
    m: "\u001b[1m\u001b[30m"
  };
  
  function textcolor(text) {
    return replace(text, /#\w/g, (s) => textcolors[s[1]] || textcolors[0]) + textcolors[0];
  }
  
  const argscolors = {
    0: "",
    i: "color:lightgray",
    s: "color:lawngreen;font-weight:900",
    f: "color:tomato;font-weight:900",
    e: "color:red",
    t: "color:royalblue;font-weight:900",
    m: "color:darkgrey"
  };
  
  function argscolor(args) {
    var i = 1;
    args[0] = replace(args[0], /#\w/g, (s) => (args[i++] = argscolors[s[1]] || "", "%c"));
    args.length = i;
    return args;
  }
  
  function format(s) {
    var i = 1, args = arguments;
    return replace(s, /%[sd]/g, function (s) {
      return i < args.length ? args[i++] : s;
    });
  }
  
  /** -----------------------------------------------------------------------------------------------
   * trace.js
   */
  
  /** get(path) 获取文本资源 */
  var get;
  
  if (this.window) {
    get = function (path) {
      var http = new XMLHttpRequest;
      http.open('GET', path, false);
      http.send();
      return http.status / 100 ^ 2 ? '' : http.responseText;
    };
  }
  else {
    const fs = require('fs');
    get = function (path) {
      return fs.readFileSync(path, { encoding: 'utf-8' });
    };
  }
  
  var reWhere = RegExp('\\b' + where.name + '\\b');
  var reHere = /((?:https?:\/\/[\w.-]+(?::\d+)?|)[\w./@-]+(?:\?.*|)):(\d+):(\d+)/;
  function where(deep) {
    var stack = split(Error().stack, "\n");
    for (var i = 0, line; line = stack[i++];) {
      if (match(line, reWhere)) break;
    }
    if (i < stack.length) {
      var ms = match(stack[i + deep], reHere);
      if (ms)
        return {
          trace: ms[0],
          loc: ms[1],
          row: ms[2] - 1,
          col: ms[3] - 1
        };
    }
  }
  
  var reTrace = /((?:https?:\/\/[\w.-]+(?::\d+)?|)[\w./@-]+(?:\?.*|)):(\d+):(\d+)/;
  function getTrace(error) {
    var stack = error.stack;
    if (stack) {
      stack = split(stack, "\n");
      for (var i = 0, item; item = stack[i++];) {
        var ms = match(item, reTrace);
        if (ms) return ms[0];
      }
    }
  }
  
  function getLine(deep) {
    var here, rows, row;
    deep += 1;
    if (here = where(deep)) {
      if (rows = getRows(here.loc)) {
        if (row = rows[here.row]) {
          return { code: row, trace: here.trace }
        }
      }
    }
  }
  
  var cachedRows = {};
  function getRows(loc) {
    var rows;
    if (hasOwnProperty(cachedRows, loc)) {
      rows = cachedRows[loc];
    }
    else {
      rows = cachedRows[loc] = split(get(loc), "\n");
    }
    return rows;
  }
  
  
  
  /** -----------------------------------------------------------------------------------------------
   * assert.js
   */
  const EPSILON = 0.0000001192092896;
  
  function assert(assert) {
    var it = newIt(this);
    if (!assert)
      it.fail = 'Assert failure!';
    report(it);
  }
  
  function hope(value) {
    var it = newIt(this, "", value);
    if (arguments.length > 1)
      it.args = piece(arguments, 1);
    return it;
  }
  
  function newIt(parent, topic, value) {
    call(review, parent);
    var it = create(itProto);
    it.parent = parent;
    var line = getLine(2), code;
    if (line) {
      code = trim(line.code);
      it.trace = line.trace;
    }
    it.topic = topic || code || "unknown testing"
    it.value = value;
    it.indent = parent.indent;
    it.zero = now();
    push(parent.its, it);
    return it;
  }
  
  var itProto = {
    get be() { return this },
    get is() {
      var me = this;
      var is = setPrototype(newIs(me), newA(me));
      return setPrototype({ get not() { me.no = 1; return is } }, is);
    },
    get not() {
      this.no = !this.no;
      return this;
    },
  
    equal: function (expect) { assertEqual(this, normalEqual, 'equals', expect) },
  
    get strict() {
      var me = this;
      return {
        equal: function (expect) { assertEqual(me, strictEqual, 'strict equals', expect) }
      }
    },
  
    get deep() {
      var me = this;
      return {
        equal: function (expect) { assertDeepEqual(me, normalEqual, 'deep equals', expect) },
        get strict() {
          return {
            equal: function (expect) { assertDeepEqual(me, strictEqual, 'deep strict equals', expect) }
          }
        }
      }
    },
  
    get a() { return newA(this) },
  
    get has() {
      var me = this;
      var has = newHas(me);
      return setPrototype({ get not() { me.no = 1; return has }, get no() { me.no = 1; return has } }, has);
    },
    throw: function () {
      var me = this, value = me.value, args = arguments, specified, error;
      if (specified = args.length) error = args[0];
      args = me.args;
      if (assertFunction(me)) {
        if (isSyncFunction(value)) {
          try {
            apply(value, undefined, args);
            assertThrow(me, specified, error);
          }
          catch (except) {
            assertThrow(me, specified, error, except);
          }
        }
        else if (isGeneratorFunction(value)) {
          return apply(go, undefined, union([value], args))
            .then(function () {
              assertThrow(me, specified, error);
            })
            .catch(function (except) {
              assertThrow(me, specified, error, except);
            });
        }
        else if (isAsyncFunction(value)) {
          return apply(value, undefined, args)
            .then(function () {
              assertThrow(me, specified, error);
            })
            .catch(function (except) {
              assertThrow(me, specified, error, except);
            });
        }
      }
    }
  };
  
  function newIs(me) {
    return {
      get undefined() { return assertValue(me, me.value === undefined, 'undefined') },
      get null() { return assertValue(me, me.value === null, 'null') },
      get void() { return assertValue(me, me.value === undefined || me.value === null, 'void') },
      get ok() { return assertValue(me, me.value, 'ok') },
      get NaN() { return assertValue(me, me.value !== me.value, 'NaN') },
      get finite() { return assertValue(me, Number.isFinite(me.value), 'finite') },
      get a() { return newA(me) },
      get an() { return newA(me) },
      equal: function (expect) { assertEqual(me, normalEqual, 'equal to', expect) },
      get strict() {
        return {
          equal: function (expect) { assertEqual(me, strictEqual, 'strict equal to', expect) }
        }
      },
      get deep() {
        return {
          equal: function (expect) { assertDeepEqual(me, normalEqual, 'deep equal to', expect) },
          get strict() {
            return {
              equal: function (expect) { assertDeepEqual(me, strictEqual, 'deep strict equal to', expect) }
            }
          }
        }
      },
    };
  }
  
  function newHas(me) {
    return {
      property: function (property) { assertHasProperty(me, property) },
      get own() {
        return {
          property: function (property) { assertHasOwnProperty(me, property) },
          get enumerable() {
            return {
              property: function (property) { assertHasOwnEnumerableProperty(me, property) }
            }
          }
        }
      },
      get enumerable() {
        return {
          property: function (property) { assertHasEnumerableProperty(me, property) }
        }
      }
    }
  }
  
  function newA(me) {
    return {
      get boolean() { assertType(me, 'boolean') },
      get number() { assertType(me, 'number') },
      get string() { assertType(me, 'string') },
      get symbol() { assertType(me, 'symbol') },
      get object() { assertType(me, 'object') },
      get function() { assertType(me, 'function') },
      get Object() { assertInstance(me, Object) },
      get Function() { assertInstance(me, Function) },
      get Boolean() { assertInstance(me, Boolean) },
      get Number() { assertInstance(me, Number) },
      get String() { assertInstance(me, String) },
      get Array() { assertInstance(me, Array) },
      get RegExp() { assertInstance(me, RegExp) },
      get Date() { assertInstance(me, Date) },
      get Error() { assertInstance(me, Error) },
      get Set() { assertInstance(me, Set) },
      get WeakSet() { assertInstance(me, WeakSet) },
      get Map() { assertInstance(me, Map) },
      get WeakMap() { assertInstance(me, WeakMap) },
      get Arguments() { assertTag(me, 'Arguments') },
      get Iterator() { assertInstanceOf(me, isIterator(me.value), 'Iterator') },
      get Promise() { assertInstance(me, Promise) },
      get Generator() { assertTag(me, 'Generator') },
      get GeneratorFunction() { assertTag(me, 'GeneratorFunction') },
      get AsyncFunction() { assertTag(me, 'AsyncFunction') },
      get instance() { return { of: function (type) { assertInstance(me, type) } } }
    };
  }
  
  function assertValue(it, assert, verb) {
    if (!assert ^ it.no)
      it.fail = disappoint(textify(it.value), 'is', it.no, verb);
    report(it);
  }
  
  function assertEqual(it, compare, verb, expect) {
    var value = it.value, not = it.no, assert;
    assert = compare(value, expect);
    if (!assert ^ not) {
      var type = typeclass(value);
      if (match(type, /^[A-Z]|symbol/) && type === typeclass(expect))
        verb += not ? ' the same' : ' another';
      it.fail = "hope " + textify(value) + ' is ' + (not ? 'not ' : '') + verb + ' ' + textify(expect) + '.';
    }
    report(it);
  }
  
  function assertDeepEqual(it, compare, verb, expect) {
    var value = it.value, not = it.no, assert, dif;
    dif = diff(value, expect, compare);
    if (!!dif ^ not)
      it.fail = "hope " + textify(value) + ' is ' + (not ? 'not ' : '') + verb + ' ' + textify(expect) + '.'
        + '\n' + (dif ? dif : 'there is no different for ' + verb + '.');
    report(it);
  }
  
  
  
  function assertType(it, type) {
    if ((genusof(it.value) !== type) ^ it.no)
      it.fail = disappoint(textify(it.value), 'is', it.no, 'type as', type);
    report(it);
  }
  
  function assertInstance(it, type) {
    if (isFunction(type)) {
      assertInstanceOf(it, isFunction(type) && it.value instanceof type, funcname(type));
    }
    else {
      it.fail = 'Error: ' + textify(type) + ' is not callable.';
      report(it);
    }
  }
  
  function assertTag(it, type) {
    assertInstanceOf(it, tagof(it.value) === type, type);
  }
  
  function assertInstanceOf(it, assert, type) {
    if (!assert ^ it.no)
      it.fail = disappoint(textify(it.value), 'is', it.no, 'an instance of', type);
    report(it);
  }
  
  function disappoint(one, vi, not, vt, other) {
    return 'Hope ' + one + ' ' + vi + (not ? ' not ' : ' ') + vt + (other ? ' ' + other : '') + '.';
  }
  
  function assertHasProperty(it, property) {
    if (assertObject(it)) {
      assertProperty(it, property in it.value, 'property', property);
    }
  }
  
  function assertHasOwnProperty(it, property) {
    if (assertObject(it)) {
      assertProperty(it, hasOwnProperty(it.value, property), 'own property', property);
    }
  }
  
  function assertHasEnumerableProperty(it, property) {
    if (assertObject(it)) {
      var desc = getPropertyDescriptor(it.value, property);
      assertProperty(it, desc && desc.enumerable, 'enumerable property', property);
    }
  }
  
  function assertHasOwnEnumerableProperty(it, property) {
    if (assertObject(it)) {
      var desc = getOwnPropertyDescriptor(it.value, property);
      assertProperty(it, desc && desc.enumerable, 'own enumerable property', property);
    }
  }
  
  function assertProperty(it, assert, verb, property) {
    var no = it.no;
    if (!assert ^ no)
      it.fail = 'But ' + textify(it.value) + ' has ' + (no ? '' : 'no ') + verb + ' ' + stringify(property) + '.';
    report(it);
  }
  
  function assertObject(it) {
    return isObject(it.value) || (it.fail = 'But ' + textify(it.value) + ' is not an object!', report(it));
  }
  
  function assertFunction(it) {
    return isFunction(it.value) || (it.fail = 'But ' + textify(it.value) + ' is not a function!', report(it))
  }
  
  function assertThrow(it, specified, error, except) {
    var not = it.no, ok = arguments.length < 4;
  
    if (ok) {
      if (!not)
        it.fail = fail(specified ? textify(error) : '', textify(except));
    }
    else if (specified) {
      if (isFunction(error)) {
        if (!(except instanceof error) ^ not)
          it.fail = fail(funcname(error) + ' object', textify(except));
      }
      else if (isString(error)) {
        error = stringify(error);
        if (isString(except)) {
          except = stringify(except);
        }
        else if (isObject(except)) {
          if (hasProperty(except, 'message')) {
            except = stringify(except.message);
          }
          else {
            except = textify(except);
          }
        }
        else {
          except = textify(except);
        }
        if ((error !== except) ^ not)
          it.fail = fail(error, except);
      }
      else if ((error !== except) ^ not) {
        it.fail = fail(textify(error), textify(except));
      }
    }
    else if (not) {
      it.fail = fail('', textify(except));
    }
    report(it);
  
    function fail(error, except) { return 'Hope' + (not ? ' not' : '') + ' throw ' + (error && error + ' ') + 'but throw ' + (ok ? 'nothing' : except) + '.' };
  }
  
  function typeclass(any) {
    var type = genusof(any), proto;
    if (type === 'object' || type === 'function') {
      if (proto = getPrototype(any)) {
        if (hasOwnProperty(proto, 'constructor')) {
          type = funcname(proto.constructor);
        }
        else {
          type = tagof(any);
        }
      }
      else {
        type = 'null prototype';
      }
    }
    return type;
  }
  
  function funcname(any) {
    return isFunction(any) ?
      any.name || '[anonymous]' : '';
  }
  
  function normalEqual(a, b) { return a == b || typeof a === "number" && typeof b === "number" && EPSILON >= a-b && a-b>=-EPSILON }
  
  function strictEqual(a, b) { return a === b || typeof a === "number" && typeof b === "number" && EPSILON >= a-b && a-b>=-EPSILON }
  
  function textify(any) {
    var s = typeclass(any);
    if (s === 'string' || s === 'boolean') {
      s += ' ' + stringify(any);
    }
    else if (s === 'number' || s === 'symbol') {
      s += ' ' + String(any);
    }
    else if (s === 'Date' || s === 'String' || s === 'Number' || s === 'Boolean') {
      s += ' ' + stringify(any.valueOf());
    }
    else if (s === 'null prototype') {
      s = 'object with ' + s;
    }
    else if (s !== 'undefined' && s !== 'null') {
      s += ' object';
    }
    return s;
  }
  
  function diff(a, b, equal) {
    var aValue, bValue;
    if (!equal(a, b)) {
      if (isObject(a) && isObject(b)) {
        if (isRegExp(a) && isRegExp(b)) {
          aValue = a.toString(), bValue = b.toString();
          if (!equal(aValue, bValue))
            return ': one is ' + aValue + ', the other is ' + bValue + '.';
        }
        var aKeys = Object.keys(a), bKeys = Object.keys(b);
        var i = aKeys.length, length = bKeys.length;
        if (i > length)
          length = i;
        aKeys.sort();
        bKeys.sort();
        var aKey, bKey;
        for (i = 0; i < length && (aKey = aKeys[i]) === (bKey = bKeys[i]); i++) {
          aValue = a[aKey], bValue = b[bKey];
          var dif = diff(aValue, bValue, equal);
          if (dif) {
            return propexp(aKey) + dif;
          }
        }
        if (aKey !== bKey) {
          if (aKey < bKey || bKey === undefined) {
            return propexp(aKey) + ': one is ' + textify(a[aKey]) + ', the other is absent.';
          }
          if (bKey < aKey || aKey === undefined) {
            return propexp(bKey) + ': one is absent, the other is ' + textify(b[bKey]) + '.';
          }
        }
      }
      else {
        return ': one is ' + textify(a) + ', the other is ' + textify(b);
      }
    }
  
    function propexp(prop) {
      if (match(prop, /[a-zA-Z_$][\w$]*/))
        return '.' + prop;
      if (match(prop, /^0$|^[1-9]\d*$/))
        return '[' + prop + ']';
      return '[' + stringify(prop) + ']';
    }
  }
  
  
  /** -----------------------------------------------------------------------------------------------
   * go.js
   */
  
  function go(gen) {
    var self = this;
    var args = piece(arguments, 1);
  
    return new Promise(function (resolve, reject) {
      if (typeof gen === "function")
        gen = gen.apply(self, args);
      if (!gen || typeof gen.next !== "function")
        return resolve(gen);
  
      goon();
  
      function goon(value) {
        var state;
        try {
          state = gen.next(value);
        }
        catch (e) {
          return reject(e);
        }
        next(state);
      }
  
      function stop(err) {
        var state;
        try {
          state = gen.throw(err);
        }
        catch (e) {
          return reject(e);
        }
        next(state);
      }
  
      function next(state) {
        if (state.done)
          return resolve(state.value);
        var value = state.value;
        if (isPromise(value)) {
          value.then(goon, stop);
        }
        else {
          goon(value);
        }
      }
    })
  }
  
  
  /** -----------------------------------------------------------------------------------------------
   * run.js
   */
  
  function Timeout(I) {
    this.I = I;
  }
  
  function checktime(me) {
    var I = me;
    while (I) {
      if (now() - I.zero >= I.timeout) {
        throw new Timeout(I);
      }
      I = I.parent;
    }
    return me;
  }
  
  async function run() {
    var me = this, func = me.func;
    var topic = me.topic;
    if (me.timeout)
      topic += format("(#t%dms)", me.ms);
    me.zero = now();
    try {
      if (isSyncFunction(func)) {
        if (func.name !== '$') {
          print(indent(topic, me.parent.indent));
          func(me);
        }
        else {
          await new Promise(function (goon) {
            var it = newIt(me.parent, topic);
            me.parent.do = function () {
              if (!it.end) {
                reporting();
                iProto.do.apply(me, arguments);
                goon();
              }
            }
            func(done);
  
            function done(err) {
              if (!it.end) {
                reporting(err);
                goon();
              }
            }
            function reporting(err) {
              if (err) {
                it.fail = err instanceof Error ? err.message : String(err);
              }
              report(it);
            }
          });
        }
      }
      else if (isGeneratorFunction(func)) {
        print(indent(topic, me.parent.indent));
        await go(func, me);
      }
      else if (isAsyncFunction(func)) {
        print(indent(topic, me.parent.indent));
        await func(me);
      }
  
      var us = me.us;
      for (var i = 0; i < us.length; i++)
        await us[i].run();
      summarize(me);
    }
    catch (err) {
      var s;
      if (err instanceof Timeout) {
        if (err.I !== me) throw err;  // 若不是本层任务超时，则抛出至上层处理。
        s = indent(format('#e⦸ Timeout Error: %dms!', err.I.timeout), err.I.indent);
      }
      else {
        s = format('#e⦸ %s: %s', err.name, err.message);
        var trace = getTrace(err);
        if (trace)
          s += "\n  " + trace;
        s = indent(s, me.indent);
      }
      print(s);
      me.end = 1;
    }
  }
  
  function summarize(me) {
    var s = sum(me);
    var total = s.total, okey = s.okey, fail = s.fail, miss = s.miss;
    s = format("#t✈#i Total asserts: #t%d#i,", total);
    if (okey) {
      s += format(' okey: #s%d%s#i,', okey, rate(okey));
    }
    if (fail) {
      s += format(' fail: #f%d%s#i,', fail, rate(fail));
    }
    if (miss) {
      s += format(' miss: #t%d%s#i,', miss, rate(miss));
    }
  
    s += format(" duration: #t%d#ims.", now() - me.zero);
    print(indent(s, me.indent));
  
    function rate(value) {
      return Number.isInteger(value = value / total * 100) ? '(' + value + '%)' : '';
    }
  }
  
  function sum(me) {
    var its = me.its, total = its.length, okey = 0, fail = 0, miss = 0;
    for (var i = 0; i < total; i++) {
      var it = its[i];
      if (it.end) {
        if (it.fail) {
          fail++;
        }
        else {
          okey++;
        }
      }
      else {
        miss++;
      }
    }
    its = me.us;
    for(var i=0; i<its.length; i++) {
      me = sum(its[i]);
      total += me.total;
      okey += me.okey;
      fail += me.fail;
      miss += me.miss;
    }
    return {total, okey, fail, miss};
  }
  
  function errors(me) {
    var errs = 0, its = me.its, us = me.us;
    for (var i = 0; i < its.length; i++) {
      var it = its[i];
      if (it.end) {
        if (it.fail)
          errs++;
      }
      else {
        errs++;
      }
    }
    for (var i = 0; i < us.length; i++)
      errs += errors(us[i]);
    return errs;
  } 
  
  /** -----------------------------------------------------------------------------------------------
   * i.js
   */
  
  function newI(parent, topic, func, timeout) {
    var I = create(iProto);
    I.parent = parent;
    I.topic = topic;
    I.func = func;
    I.timeout = timeout;
    I.us = [];
    I.its = [];
    if (parent) {
      I.indent = parent.indent + "  ";
      I.path = parent.path;
    }
    else {
      I.indent = "";
    }
    return I;
  }
  
  const iProto = {
    do: function (topic, func, timeout) {
      push(this.us, newI(this, topic, func, timeout));
    },
  
    log: function (s) {
      var me = checktime(this);
      s = apply(format, undefined, arguments);
      print(indent(s, me.indent));
    },
  
    delay: async function (ms) {
      var me = checktime(this);
      var I = me;
      while (I) {
        var left = I.timeout + I.zero - now();
        if (left < ms)
          ms = left;
        I = I.parent;
      }
      if (ms >= 0)
        await new Promise(function (resolve) {
          setTimeout(resolve, ms);
        });
    },
    assert: assert,
    get am() {
      var me = this;
      return { sure: bind(assert, me) };
    },
    hope: hope,
    say: say,
    run: run
  };
  
  function say(topic) {
    var me = this;
    var it = newIt(me, topic);
    return {
      if: function (assert) {
        if (!assert)
          it.fail = 'Assert failure!';
        report(it);
      },
      as: function (value) {
        it.value = value;
        return it;
      },
      on: function on(func) {
        try {
          func();
        }
        catch (err) {
          it.fail = 'Throw ' + String(err);
        }
        report(it);
      }
    };
  }
  
  
  /** -----------------------------------------------------------------------------------------------
   * load.js
   */
  
  (function () {
    iProto.get = function (url) {
      url = purl(url, this.path);
      return get(url);
    };
  
    var jsed = {};
    iProto.js = function (url) {
      url = purl(url, this.path);
      if (!jsed[url]) {
        jsed[url] = 1;
        var code = get(url) + '\n//# sourceURL=' + url;
        var path = this.path;
        this.path = url;
        try {
          global.eval(code);
        }
        finally {
          this.path = path;
        }
      }
    }
  
    /** purl(url, rel)  计算相对路径并规格化 */
    var reUrl = /^(https?:\/\/[\w-.]+(?::\d+)?|)([\w\/.-]+)(.*|)/;
    var reRel = /^(https?:\/\/[\w-.]+(?::\d+)?|)(\/(?:[\w.-]+\/)*)/;
  
    function purl(url, rel) {
      var ms = match(url, reUrl);
      if (ms && !ms[1] && (rel = match(rel, reRel))) {
        url = ms[2];
        if (url[0] !== '/') {
          url = rel[2] + url;
        }
        url = rel[1] + furl(url) + ms[3];
      }
      return url;
    }
  
    /** furl(url) 路径规格化 */
    var reSlash = /\/+/;
  
    function furl(src) {
      var des = [];
      src = split(src, reSlash);
      for (var i = 0, l = src.length; i < l; i++) {
        var sym = src[i];
        if (des.length) {
          if (sym !== '.') {
            var end = des[des.length - 1];
            if (sym !== '..') {
              if (end === '.' && sym) pop(des);
              push(des, sym);
            }
            else if (end === '..') {
              push(des, sym);
            }
            else if (end) {
              pop(des);
            }
          }
        }
        else {
          push(des, sym);
        }
      }
      return des.join('/');
    }
  })();
  
  
  
  
  /** -----------------------------------------------------------------------------------------------
   * main.js
   */
  
  async function main() {
    try {
      await I.run();
      exit(errors(I));
    }
    catch (e) {
      log("#eUncaught %s: %s", e.name, e.message);
      exit(-1);
    }
  }
  
  function exit(code) {
    if (this.window) {
      remote("exit", code);
      this.window.close();
    }
    else {
      process.exit(code);
    }
  }
  
  
  const macro = function(){
  /** -------------------------------------------------------------------------------------------------------------------
   * lib.js
   */
  
  /**
   * get(path)
   *  获取指定路径的文本数据
   */
  var get = function(fs){
    if(this.window) {
      fs = new XMLHttpRequest;
      return function(path){
        fs.open('GET', path, false);
        fs.send();
        if(!(fs.status / 100 ^ 2))
          return fs.responseText;
      }
    }
    else {
      fs = require('fs');
      return function(path) {
        return fs.readFileSync(path).toString();
      }
    }
  }();
  
  /**
   * repath(path, rel)
   *  计算相对路径
   */
  var repath = function(path, rel){
    var rePath = /^(https?:\/\/[\w-.]+(?::\d+)?|)([\w\/.-]+)(.*|)/;
    var reRel = /^(https?:\/\/[\w-.]+(?::\d+)?|)(\/(?:[\w@.-]+\/)*)/;
  
    function repath(path, rel) {
      var ms = path.match(rePath);
      if (ms && !ms[1] && rel && (rel = rel.match(reRel))) {
        path = ms[2];
        if (path[0] !== '/') {
          path = rel[2] + path;
        }
        path = rel[1] + normalize(path) + ms[3];
      }
      return path;
    }
  
    /** normalize(path) 路径规格化 */
    var reSlash = /\/+/;
  
    function normalize(src) {
      var des = [];
      src = src.split(reSlash);
      for (var i = 0, l = src.length; i < l; i++) {
        var sym = src[i];
        if (des.length) {
          if (sym !== '.') {
            var end = des[des.length - 1];
            if (sym !== '..') {
              if (end === '.' && sym) des.length--;
              des.push(sym);
            }
            else if (end === '..') {
              des.push(sym);
            }
            else if (end) {
              des.length--;
            }
          }
        }
        else {
          des.push(sym);
        }
      }
      return des.join('/');
    }
  
    return repath;
  
  }();
  
  var libpath = this.window || function(){
    var fs = require("fs");
    var reLibName = /^(?:@[a-z0-9-][a-z0-9-._]*\/)?[a-z0-9-][a-z0-9-._]*(\/[^]*)?/;
  
    function libpath(name, rel) {
      var ms = name.match(reLibName);
      if (!ms)
        throw Error("Error libaray name: '" + name + "'");
      if(!ms[1]) {
        name += "/all.js";
      }
      else if(!name.endsWith(".js")) {
        name += ".js";
      }
    
      var rel = dirname(rel);
      while (rel) {
        var tryname = rel + "node_modules/" + name;
        if (fs.existsSync(tryname))
          return tryname;
        rel = dirname(rel.slice(0, -1));
      }
  
      rel = process.env.NODE_PATH;
      if (rel) {
        rel = rel.split(":");
        for (var i = 0; i < rel.length; i++) {
          var dir = rel[i];
          if (dir) {
            tryname = dir + "/" + name;
            if (fs.existsSync(tryname))
              return tryname;
          }
        }
      }
      throw Error("Can't find libaray :'"+name+"'");
    }
    
    function dirname(path) {
      return path.slice(0, path.lastIndexOf("/") + 1);
    }
    return libpath;  
  }();
  
  function isLibName(name) {
    return /^[^./]/.test(name);
  }
  
  function incpath(path, rel) {
    if(isLibName(path))
      return libpath(path, rel);
    return repath(path, rel);
  }
  /** -------------------------------------------------------------------------------------------------------------------
   * lex.js
   */
  
  const Lex = function () {
    function $() { return arguments };
  
    function regular(any, keys) {
      if (any instanceof Object) {
        if (any instanceof RegExp) {
          any = any.source;
        }
        else if (any.length) {
          var arg = [];
          for (var i = 0; i < any.length; i++)
            arg[i] = regular(any[i], keys);
          // any = arg.join(any.join ? '' : '|');
          if (any.join) {
            any = arg.join('');
          }
          else {
            any = arg.join('|');
            if (arg.length > 1)
              any = '(?:' + any + ')';
          }
        }
        else {
          arg = String(Object.keys(any));
          keys[arg] = keys.$ = (keys.$ | 0) + 1;
          any = '(' + regular(any[arg], keys) + ')';
        }
      }
      else {
        any = String(any);
      }
      return any;
    }
  
    var keys = Object.create(null);
    var lex = regular($(
      { IF: [/\/\/#if\s*\(/, { COND: /[^)]+/ }, /\)\s*{.*\n?/] },
      { END: /\/\/#}.*\n?/ },
      { INCLUDE: [/\/\/#include\s+/, { FILE: /\S+/ }, /.*/] },
      { DEFINE: [/\/\/#define\s+/, { DID: /[a-zA-Z_$][\w$]*/ }, /\s*/, $([/@\s*/, { RES: /\S+/ }, /.*/], [/=\s*/, { EXP: /.+/ }], { VAL: /.+/ })] },
      { VAR: [/\/\/#var\s+/, { VID: /[a-zA-Z_$][\w$]*/ }, /\s*=\s*/, { VEXP: /.+/ }] },
      { TEMP_HEAD: [/`(?:[^`$\\]+|\$(?!{)|\\[^])*/, $(/`|$/, { TEMP_OPEN: /\${/ })] },  //模板头（容错）
      { TEMP_TAIL: [/}(?:[^`$\\]+|\$(?!{)|\\[^])*/, $(/\${/, { TEMP_CLOSE: /`|$/ })] },  //模板尾（容错）
      { BLOCK_HEAD: /\{/ },
      { BLOCK_TAIL: /\}/ },
      { FUNC: /(?:async\s+)?function\b[^(]*\([^)]*\)/ },
      { ARROW: /(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/ },
      { ID: /[a-zA-Z_$][\w$]*/ },
      { SQ: /'(?:[^'\n\\]+|\\[^])*(?:['\n]|$)/ },  // 单引号字符串（容错）
      { DQ: /"(?:[^"\n\\]+|\\[^])*(?:["\n]|$)/ },  // 双引号字符串（容错）
      { REGEXP: /\/(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\*\n\r])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\n\r])*?\/[gimy]*/ },
      { COMMENT: /\/\/.*|\/\*[^*]*\*+(?:[^/][^*]*\*+)*\// },
      { OTHER: /(?:[^{}a-zA-Z_$'"`/]|\/(?![/*]))+/ },
      { SPECIAL: /\// }
    ), keys);
  
    lex = RegExp(lex + '|', 'g');
    Lex.$ = keys;
  
    function Lex(code) {
      var $ = keys, re = new RegExp(lex), stack = [], state = 0;
      return function () {
        var ms;
        if (ms = re.exec(code)) {
          if (ms[$.BLOCK_HEAD]) {
            stack.push(state);
            state = $.BLOCK_HEAD;
          }
          else if (ms[$.TEMP_HEAD]) {
            stack.push(state);
            state = $.TEMP_HEAD;
          }
          else if (ms[$.TEMP_TAIL]) {
            if (state === $.BLOCK_HEAD) {
              ms[0] = ms[$.BLOCK_TAIL] = "}";
              ms[$.TEMP_TAIL] = ms[$.TEMP_CLOSE] = undefined;
              re.lastIndex = ms.index + 1;
              state = stack.pop();
            }
            else if (ms[$.TEMP_CLOSE] && state === $.TEMP_HEAD) {
              state = stack.pop();
            }
          }
          else if (ms[$.BLOCK_TAIL]) {
            if (state = $.BLOCK_HEAD) {
              state = stack.pop();
            }
          }
        }
        return ms;
      }
    }
  
    return Lex;
  }();
  
  
  /** -------------------------------------------------------------------------------------------------------------------
   * make.js
   */
  
  /**
   * make(path, rel)
   */
  var makeFile = function (calc) {
    calc = this.eval("(function(){with(arguments[0])return eval(arguments[1])})");
  
    function makeFile(path, rel, includes, defines, variables, indent) {
      var code;
      path = incpath(path, rel);
      if (includes[path]) {
        code = '';
      }
      else {
        includes[path] = 1;    // 占位符，防止无限递归
        code = get(path);
        if (code)
          try {
            code = makeCode(code, path, includes, defines, variables, indent);
          }
          catch (e) {
            if (e instanceof MacroError)
              e = Error(e.message + ' at (' + path + ':' + rowcol(code, e.index) + ')');
            throw e;
          }
      }
      return code;
    }
  
    function makeCode(code, rel, includes, defines, variables, indent) {
      var lex = Lex(code), $ = Lex.$, token, codes = [], id, it;
      var skip = 0;
      while (token = lex()) {
        var s = token[0];
        if (!s) {
          if (token.index < code.length)
            throw new MacroError('Unknown token', token.index);
          break;
        }
  
        if (token[$.IF]) {
          if (skip) {
            skip++;
          }
          else {
            it = token[$.COND];
            try {
              if (!calc(variables, it))
                skip = 1;
            }
            catch (e) {
              skip = 1;
            }
          }
          continue;
        }
        if (token[$.END]) {
          if(skip>0)
            skip --;
          continue;
        }
        if (skip) continue;
  
        if (token[$.INCLUDE]) {
          var file = token[$.FILE];
          // if (file = makeFile(file, rel, includes, defines, variables, indentOf(code, token.index)))
          //   s = file;
          s = makeFile(file, rel, includes, defines, variables, indentOf(code, token.index));
        }
        else if (token[$.DEFINE]) {
          id = token[$.DID];
          if (it = token[$.VAL]) {
            it = it.trim();
          }
          else if (it = token[$.RES]) {
            it = repath(it, rel);
            try {
              s = get(it);
              if (s === undefined)
                throw Error("Read file error: " + it);
            }
            catch (e) {
              throw new MacroError(e.message, token.index);
            }
            it = JSON.stringify(s);
          }
          else if (it = token[$.EXP]) {
            it = calc(variables, it);
          }
          defines[id] = variables[id] = it;
          s = "//const " + id + " = " + String(it);
        }
        else if (token[$.VAR]) {
          id = token[$.VID];
          it = token[$.VEXP];
          it = calc(variables, it);
          variables[id] = it;
          s = "//var " + id + " = " + String(it);
        }
        else if (id = token[$.ID]) {
          if (id in defines) {
            s = "/*" + id + "*/" + String(defines[id]);
          }
        }
        else if (token[$.BLOCK_HEAD]) {
          includes = Object.create(includes);
          defines = Object.create(defines);
        }
        else if (token[$.BLOCK_TAIL]) {
          var proto = Object.getPrototypeOf(defines);
          if (proto) defines = proto;
          var proto = Object.getPrototypeOf(includes);
          if (proto) includes = proto;
        }
        codes[codes.length] = s;
      }
      code = codes.join('');
      code = code.replace(/^/gm, indent).slice(indent.length);
      return code;
    }
  
    function MacroError(message, index) {
      this.message = message;
      this.index = index;
    }
  
    function indentOf(text, index) {
      for (var i = index; ' \t'.indexOf(text[i - 1]) >= 0; i--);
      return text.slice(i, index);
    }
  
    /**
     * rowcol(text, i)
     *   计算文本 text 位置 i 的行列值。返回格式 "row:col"
     */
    function rowcol(text, index) {
      if (index < 0) return '<EOF>';
      var reLn = /[\n\u2028\u2029]|\r\n?/g;
      var row = 0, col = 0;
      while (reLn.exec(text) && index > reLn.lastIndex) {
        row++;
        col = reLn.lastIndex;
      }
      col = index - col;
      return (row + 1) + ':' + (col + 1);
    }
  
    return makeFile;
  }();
  
  
  return function (path, rel) {
    return makeFile(path, rel, Object.create(null), Object.create(null), Object.create(null), "");
  }
  }();
  
  
  /** -------------------------------------------------------------------------------------------------------------------
   * server.js
   */
  
  function Server() {
    var xhr = new XMLHttpRequest;
    var url = location.protocol + "//" + location.host + "//";
  
    return function (oper, value) {
      xhr.open("GET", url, false);
      xhr.setRequestHeader("oper", oper);
      xhr.setRequestHeader("value", encodeURIComponent(value));
      xhr.send();
    }
  };
  

  this.onerror = function(message, source, lineno, colno, error) {
    log("#e%s", message);
  }

  var I = currentScript.getAttribute("name") || "I";

  I = global[I] = newI(null, "");  // 创建全局的 I，共测试程序使用
  I.path = location.pathname;

  global.addEventListener("load", async function () {
    if (cases)
      try {
        var tests = cases.split(",");
        for (var i = 0; i < tests.length; i++)
          await execScript(tests[i]);
        await I.run();
        var errs = errors(I);
      }
      catch (e) {
        log("#eUncaught %s: %s", e.name, e.message);
        errs = -1;
      }
      finally {
        if (!debug) {
          server("exit", errs);
          this.close();
        }
      }
    else {
      await I.run();
      var errs = errors(I);
      if (errs) {
        log("#eTOTAL ERRORS: %d !", errs)
      }
      else {
        log("#sALL SUCCESSFUL!")
      }
    }

  });

  async function execScript(src) {
    return new Promise(function (resolve) {
      var script = document.createElement("script");
      script.onload = resolve;
      script.src = src;
      try { document.head.appendChild(script) }
      finally { if(!debug) document.head.removeChild(script) }
    });
  }
})(0, 0, Function, Object, String, Array, RegExp, Date, Error, Promise);

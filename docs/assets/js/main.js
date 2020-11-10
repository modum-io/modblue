!(function (e) {
	var t = {};
	function r(n) {
		if (t[n]) return t[n].exports;
		var i = (t[n] = { i: n, l: !1, exports: {} });
		return e[n].call(i.exports, i, i.exports, r), (i.l = !0), i.exports;
	}
	(r.m = e),
		(r.c = t),
		(r.d = function (e, t, n) {
			r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n });
		}),
		(r.r = function (e) {
			'undefined' != typeof Symbol &&
				Symbol.toStringTag &&
				Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
				Object.defineProperty(e, '__esModule', { value: !0 });
		}),
		(r.t = function (e, t) {
			if ((1 & t && (e = r(e)), 8 & t)) return e;
			if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
			var n = Object.create(null);
			if ((r.r(n), Object.defineProperty(n, 'default', { enumerable: !0, value: e }), 2 & t && 'string' != typeof e))
				for (var i in e)
					r.d(
						n,
						i,
						function (t) {
							return e[t];
						}.bind(null, i)
					);
			return n;
		}),
		(r.n = function (e) {
			var t =
				e && e.__esModule
					? function () {
							return e.default;
					  }
					: function () {
							return e;
					  };
			return r.d(t, 'a', t), t;
		}),
		(r.o = function (e, t) {
			return Object.prototype.hasOwnProperty.call(e, t);
		}),
		(r.p = ''),
		r((r.s = 2));
})([
	function (e, t, r) {
		var n, i;
		/**
		 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.9
		 * Copyright (C) 2020 Oliver Nightingale
		 * @license MIT
		 */ !(function () {
			var s,
				o,
				a,
				u,
				c,
				l,
				d,
				h,
				f,
				p,
				y,
				m,
				v,
				g,
				x,
				w,
				L,
				E,
				b,
				S,
				k,
				Q,
				O,
				P,
				T,
				_,
				I = function (e) {
					var t = new I.Builder();
					return (
						t.pipeline.add(I.trimmer, I.stopWordFilter, I.stemmer),
						t.searchPipeline.add(I.stemmer),
						e.call(t, t),
						t.build()
					);
				};
			(I.version = '2.3.9'),
				/*!
				 * lunr.utils
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.utils = {}),
				(I.utils.warn =
					((s = this),
					function (e) {
						s.console && console.warn && console.warn(e);
					})),
				(I.utils.asString = function (e) {
					return null == e ? '' : e.toString();
				}),
				(I.utils.clone = function (e) {
					if (null == e) return e;
					for (var t = Object.create(null), r = Object.keys(e), n = 0; n < r.length; n++) {
						var i = r[n],
							s = e[i];
						if (Array.isArray(s)) t[i] = s.slice();
						else {
							if ('string' != typeof s && 'number' != typeof s && 'boolean' != typeof s)
								throw new TypeError('clone is not deep and does not support nested objects');
							t[i] = s;
						}
					}
					return t;
				}),
				(I.FieldRef = function (e, t, r) {
					(this.docRef = e), (this.fieldName = t), (this._stringValue = r);
				}),
				(I.FieldRef.joiner = '/'),
				(I.FieldRef.fromString = function (e) {
					var t = e.indexOf(I.FieldRef.joiner);
					if (-1 === t) throw 'malformed field ref string';
					var r = e.slice(0, t),
						n = e.slice(t + 1);
					return new I.FieldRef(n, r, e);
				}),
				(I.FieldRef.prototype.toString = function () {
					return (
						null == this._stringValue && (this._stringValue = this.fieldName + I.FieldRef.joiner + this.docRef),
						this._stringValue
					);
				}),
				/*!
				 * lunr.Set
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.Set = function (e) {
					if (((this.elements = Object.create(null)), e)) {
						this.length = e.length;
						for (var t = 0; t < this.length; t++) this.elements[e[t]] = !0;
					} else this.length = 0;
				}),
				(I.Set.complete = {
					intersect: function (e) {
						return e;
					},
					union: function () {
						return this;
					},
					contains: function () {
						return !0;
					}
				}),
				(I.Set.empty = {
					intersect: function () {
						return this;
					},
					union: function (e) {
						return e;
					},
					contains: function () {
						return !1;
					}
				}),
				(I.Set.prototype.contains = function (e) {
					return !!this.elements[e];
				}),
				(I.Set.prototype.intersect = function (e) {
					var t,
						r,
						n,
						i = [];
					if (e === I.Set.complete) return this;
					if (e === I.Set.empty) return e;
					this.length < e.length ? ((t = this), (r = e)) : ((t = e), (r = this)), (n = Object.keys(t.elements));
					for (var s = 0; s < n.length; s++) {
						var o = n[s];
						o in r.elements && i.push(o);
					}
					return new I.Set(i);
				}),
				(I.Set.prototype.union = function (e) {
					return e === I.Set.complete
						? I.Set.complete
						: e === I.Set.empty
						? this
						: new I.Set(Object.keys(this.elements).concat(Object.keys(e.elements)));
				}),
				(I.idf = function (e, t) {
					var r = 0;
					for (var n in e) '_index' != n && (r += Object.keys(e[n]).length);
					var i = (t - r + 0.5) / (r + 0.5);
					return Math.log(1 + Math.abs(i));
				}),
				(I.Token = function (e, t) {
					(this.str = e || ''), (this.metadata = t || {});
				}),
				(I.Token.prototype.toString = function () {
					return this.str;
				}),
				(I.Token.prototype.update = function (e) {
					return (this.str = e(this.str, this.metadata)), this;
				}),
				(I.Token.prototype.clone = function (e) {
					return (
						(e =
							e ||
							function (e) {
								return e;
							}),
						new I.Token(e(this.str, this.metadata), this.metadata)
					);
				}),
				/*!
				 * lunr.tokenizer
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.tokenizer = function (e, t) {
					if (null == e || null == e) return [];
					if (Array.isArray(e))
						return e.map(function (e) {
							return new I.Token(I.utils.asString(e).toLowerCase(), I.utils.clone(t));
						});
					for (var r = e.toString().toLowerCase(), n = r.length, i = [], s = 0, o = 0; s <= n; s++) {
						var a = s - o;
						if (r.charAt(s).match(I.tokenizer.separator) || s == n) {
							if (a > 0) {
								var u = I.utils.clone(t) || {};
								(u.position = [o, a]), (u.index = i.length), i.push(new I.Token(r.slice(o, s), u));
							}
							o = s + 1;
						}
					}
					return i;
				}),
				(I.tokenizer.separator = /[\s\-]+/),
				/*!
				 * lunr.Pipeline
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.Pipeline = function () {
					this._stack = [];
				}),
				(I.Pipeline.registeredFunctions = Object.create(null)),
				(I.Pipeline.registerFunction = function (e, t) {
					t in this.registeredFunctions && I.utils.warn('Overwriting existing registered function: ' + t),
						(e.label = t),
						(I.Pipeline.registeredFunctions[e.label] = e);
				}),
				(I.Pipeline.warnIfFunctionNotRegistered = function (e) {
					(e.label && e.label in this.registeredFunctions) ||
						I.utils.warn(
							'Function is not registered with pipeline. This may cause problems when serialising the index.\n',
							e
						);
				}),
				(I.Pipeline.load = function (e) {
					var t = new I.Pipeline();
					return (
						e.forEach(function (e) {
							var r = I.Pipeline.registeredFunctions[e];
							if (!r) throw new Error('Cannot load unregistered function: ' + e);
							t.add(r);
						}),
						t
					);
				}),
				(I.Pipeline.prototype.add = function () {
					var e = Array.prototype.slice.call(arguments);
					e.forEach(function (e) {
						I.Pipeline.warnIfFunctionNotRegistered(e), this._stack.push(e);
					}, this);
				}),
				(I.Pipeline.prototype.after = function (e, t) {
					I.Pipeline.warnIfFunctionNotRegistered(t);
					var r = this._stack.indexOf(e);
					if (-1 == r) throw new Error('Cannot find existingFn');
					(r += 1), this._stack.splice(r, 0, t);
				}),
				(I.Pipeline.prototype.before = function (e, t) {
					I.Pipeline.warnIfFunctionNotRegistered(t);
					var r = this._stack.indexOf(e);
					if (-1 == r) throw new Error('Cannot find existingFn');
					this._stack.splice(r, 0, t);
				}),
				(I.Pipeline.prototype.remove = function (e) {
					var t = this._stack.indexOf(e);
					-1 != t && this._stack.splice(t, 1);
				}),
				(I.Pipeline.prototype.run = function (e) {
					for (var t = this._stack.length, r = 0; r < t; r++) {
						for (var n = this._stack[r], i = [], s = 0; s < e.length; s++) {
							var o = n(e[s], s, e);
							if (null != o && '' !== o)
								if (Array.isArray(o)) for (var a = 0; a < o.length; a++) i.push(o[a]);
								else i.push(o);
						}
						e = i;
					}
					return e;
				}),
				(I.Pipeline.prototype.runString = function (e, t) {
					var r = new I.Token(e, t);
					return this.run([r]).map(function (e) {
						return e.toString();
					});
				}),
				(I.Pipeline.prototype.reset = function () {
					this._stack = [];
				}),
				(I.Pipeline.prototype.toJSON = function () {
					return this._stack.map(function (e) {
						return I.Pipeline.warnIfFunctionNotRegistered(e), e.label;
					});
				}),
				/*!
				 * lunr.Vector
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.Vector = function (e) {
					(this._magnitude = 0), (this.elements = e || []);
				}),
				(I.Vector.prototype.positionForIndex = function (e) {
					if (0 == this.elements.length) return 0;
					for (
						var t = 0, r = this.elements.length / 2, n = r - t, i = Math.floor(n / 2), s = this.elements[2 * i];
						n > 1 && (s < e && (t = i), s > e && (r = i), s != e);

					)
						(n = r - t), (i = t + Math.floor(n / 2)), (s = this.elements[2 * i]);
					return s == e || s > e ? 2 * i : s < e ? 2 * (i + 1) : void 0;
				}),
				(I.Vector.prototype.insert = function (e, t) {
					this.upsert(e, t, function () {
						throw 'duplicate index';
					});
				}),
				(I.Vector.prototype.upsert = function (e, t, r) {
					this._magnitude = 0;
					var n = this.positionForIndex(e);
					this.elements[n] == e
						? (this.elements[n + 1] = r(this.elements[n + 1], t))
						: this.elements.splice(n, 0, e, t);
				}),
				(I.Vector.prototype.magnitude = function () {
					if (this._magnitude) return this._magnitude;
					for (var e = 0, t = this.elements.length, r = 1; r < t; r += 2) {
						var n = this.elements[r];
						e += n * n;
					}
					return (this._magnitude = Math.sqrt(e));
				}),
				(I.Vector.prototype.dot = function (e) {
					for (
						var t = 0, r = this.elements, n = e.elements, i = r.length, s = n.length, o = 0, a = 0, u = 0, c = 0;
						u < i && c < s;

					)
						(o = r[u]) < (a = n[c])
							? (u += 2)
							: o > a
							? (c += 2)
							: o == a && ((t += r[u + 1] * n[c + 1]), (u += 2), (c += 2));
					return t;
				}),
				(I.Vector.prototype.similarity = function (e) {
					return this.dot(e) / this.magnitude() || 0;
				}),
				(I.Vector.prototype.toArray = function () {
					for (var e = new Array(this.elements.length / 2), t = 1, r = 0; t < this.elements.length; t += 2, r++)
						e[r] = this.elements[t];
					return e;
				}),
				(I.Vector.prototype.toJSON = function () {
					return this.elements;
				}),
				/*!
				 * lunr.stemmer
				 * Copyright (C) 2020 Oliver Nightingale
				 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
				 */ (I.stemmer =
					((o = {
						ational: 'ate',
						tional: 'tion',
						enci: 'ence',
						anci: 'ance',
						izer: 'ize',
						bli: 'ble',
						alli: 'al',
						entli: 'ent',
						eli: 'e',
						ousli: 'ous',
						ization: 'ize',
						ation: 'ate',
						ator: 'ate',
						alism: 'al',
						iveness: 'ive',
						fulness: 'ful',
						ousness: 'ous',
						aliti: 'al',
						iviti: 'ive',
						biliti: 'ble',
						logi: 'log'
					}),
					(a = { icate: 'ic', ative: '', alize: 'al', iciti: 'ic', ical: 'ic', ful: '', ness: '' }),
					(u = '[aeiouy]'),
					(c = '[^aeiou][^aeiouy]*'),
					(l = new RegExp('^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*')),
					(d = new RegExp(
						'^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*'
					)),
					(h = new RegExp('^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$')),
					(f = new RegExp('^([^aeiou][^aeiouy]*)?[aeiouy]')),
					(p = /^(.+?)(ss|i)es$/),
					(y = /^(.+?)([^s])s$/),
					(m = /^(.+?)eed$/),
					(v = /^(.+?)(ed|ing)$/),
					(g = /.$/),
					(x = /(at|bl|iz)$/),
					(w = new RegExp('([^aeiouylsz])\\1$')),
					(L = new RegExp('^' + c + u + '[^aeiouwxy]$')),
					(E = /^(.+?[^aeiou])y$/),
					(b = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/),
					(S = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/),
					(k = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/),
					(Q = /^(.+?)(s|t)(ion)$/),
					(O = /^(.+?)e$/),
					(P = /ll$/),
					(T = new RegExp('^' + c + u + '[^aeiouwxy]$')),
					(_ = function (e) {
						var t, r, n, i, s, u, c;
						if (e.length < 3) return e;
						if (
							('y' == (n = e.substr(0, 1)) && (e = n.toUpperCase() + e.substr(1)),
							(s = y),
							(i = p).test(e) ? (e = e.replace(i, '$1$2')) : s.test(e) && (e = e.replace(s, '$1$2')),
							(s = v),
							(i = m).test(e))
						) {
							var _ = i.exec(e);
							(i = l).test(_[1]) && ((i = g), (e = e.replace(i, '')));
						} else
							s.test(e) &&
								((t = (_ = s.exec(e))[1]),
								(s = f).test(t) &&
									((u = w),
									(c = L),
									(s = x).test((e = t))
										? (e += 'e')
										: u.test(e)
										? ((i = g), (e = e.replace(i, '')))
										: c.test(e) && (e += 'e')));
						return (
							(i = E).test(e) && (e = (t = (_ = i.exec(e))[1]) + 'i'),
							(i = b).test(e) && ((t = (_ = i.exec(e))[1]), (r = _[2]), (i = l).test(t) && (e = t + o[r])),
							(i = S).test(e) && ((t = (_ = i.exec(e))[1]), (r = _[2]), (i = l).test(t) && (e = t + a[r])),
							(s = Q),
							(i = k).test(e)
								? ((t = (_ = i.exec(e))[1]), (i = d).test(t) && (e = t))
								: s.test(e) && ((t = (_ = s.exec(e))[1] + _[2]), (s = d).test(t) && (e = t)),
							(i = O).test(e) &&
								((t = (_ = i.exec(e))[1]), (s = h), (u = T), ((i = d).test(t) || (s.test(t) && !u.test(t))) && (e = t)),
							(s = d),
							(i = P).test(e) && s.test(e) && ((i = g), (e = e.replace(i, ''))),
							'y' == n && (e = n.toLowerCase() + e.substr(1)),
							e
						);
					}),
					function (e) {
						return e.update(_);
					})),
				I.Pipeline.registerFunction(I.stemmer, 'stemmer'),
				/*!
				 * lunr.stopWordFilter
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.generateStopWordFilter = function (e) {
					var t = e.reduce(function (e, t) {
						return (e[t] = t), e;
					}, {});
					return function (e) {
						if (e && t[e.toString()] !== e.toString()) return e;
					};
				}),
				(I.stopWordFilter = I.generateStopWordFilter([
					'a',
					'able',
					'about',
					'across',
					'after',
					'all',
					'almost',
					'also',
					'am',
					'among',
					'an',
					'and',
					'any',
					'are',
					'as',
					'at',
					'be',
					'because',
					'been',
					'but',
					'by',
					'can',
					'cannot',
					'could',
					'dear',
					'did',
					'do',
					'does',
					'either',
					'else',
					'ever',
					'every',
					'for',
					'from',
					'get',
					'got',
					'had',
					'has',
					'have',
					'he',
					'her',
					'hers',
					'him',
					'his',
					'how',
					'however',
					'i',
					'if',
					'in',
					'into',
					'is',
					'it',
					'its',
					'just',
					'least',
					'let',
					'like',
					'likely',
					'may',
					'me',
					'might',
					'most',
					'must',
					'my',
					'neither',
					'no',
					'nor',
					'not',
					'of',
					'off',
					'often',
					'on',
					'only',
					'or',
					'other',
					'our',
					'own',
					'rather',
					'said',
					'say',
					'says',
					'she',
					'should',
					'since',
					'so',
					'some',
					'than',
					'that',
					'the',
					'their',
					'them',
					'then',
					'there',
					'these',
					'they',
					'this',
					'tis',
					'to',
					'too',
					'twas',
					'us',
					'wants',
					'was',
					'we',
					'were',
					'what',
					'when',
					'where',
					'which',
					'while',
					'who',
					'whom',
					'why',
					'will',
					'with',
					'would',
					'yet',
					'you',
					'your'
				])),
				I.Pipeline.registerFunction(I.stopWordFilter, 'stopWordFilter'),
				/*!
				 * lunr.trimmer
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.trimmer = function (e) {
					return e.update(function (e) {
						return e.replace(/^\W+/, '').replace(/\W+$/, '');
					});
				}),
				I.Pipeline.registerFunction(I.trimmer, 'trimmer'),
				/*!
				 * lunr.TokenSet
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.TokenSet = function () {
					(this.final = !1), (this.edges = {}), (this.id = I.TokenSet._nextId), (I.TokenSet._nextId += 1);
				}),
				(I.TokenSet._nextId = 1),
				(I.TokenSet.fromArray = function (e) {
					for (var t = new I.TokenSet.Builder(), r = 0, n = e.length; r < n; r++) t.insert(e[r]);
					return t.finish(), t.root;
				}),
				(I.TokenSet.fromClause = function (e) {
					return 'editDistance' in e
						? I.TokenSet.fromFuzzyString(e.term, e.editDistance)
						: I.TokenSet.fromString(e.term);
				}),
				(I.TokenSet.fromFuzzyString = function (e, t) {
					for (var r = new I.TokenSet(), n = [{ node: r, editsRemaining: t, str: e }]; n.length; ) {
						var i = n.pop();
						if (i.str.length > 0) {
							var s,
								o = i.str.charAt(0);
							o in i.node.edges ? (s = i.node.edges[o]) : ((s = new I.TokenSet()), (i.node.edges[o] = s)),
								1 == i.str.length && (s.final = !0),
								n.push({ node: s, editsRemaining: i.editsRemaining, str: i.str.slice(1) });
						}
						if (0 != i.editsRemaining) {
							if ('*' in i.node.edges) var a = i.node.edges['*'];
							else {
								a = new I.TokenSet();
								i.node.edges['*'] = a;
							}
							if (
								(0 == i.str.length && (a.final = !0),
								n.push({ node: a, editsRemaining: i.editsRemaining - 1, str: i.str }),
								i.str.length > 1 && n.push({ node: i.node, editsRemaining: i.editsRemaining - 1, str: i.str.slice(1) }),
								1 == i.str.length && (i.node.final = !0),
								i.str.length >= 1)
							) {
								if ('*' in i.node.edges) var u = i.node.edges['*'];
								else {
									u = new I.TokenSet();
									i.node.edges['*'] = u;
								}
								1 == i.str.length && (u.final = !0),
									n.push({ node: u, editsRemaining: i.editsRemaining - 1, str: i.str.slice(1) });
							}
							if (i.str.length > 1) {
								var c,
									l = i.str.charAt(0),
									d = i.str.charAt(1);
								d in i.node.edges ? (c = i.node.edges[d]) : ((c = new I.TokenSet()), (i.node.edges[d] = c)),
									1 == i.str.length && (c.final = !0),
									n.push({ node: c, editsRemaining: i.editsRemaining - 1, str: l + i.str.slice(2) });
							}
						}
					}
					return r;
				}),
				(I.TokenSet.fromString = function (e) {
					for (var t = new I.TokenSet(), r = t, n = 0, i = e.length; n < i; n++) {
						var s = e[n],
							o = n == i - 1;
						if ('*' == s) (t.edges[s] = t), (t.final = o);
						else {
							var a = new I.TokenSet();
							(a.final = o), (t.edges[s] = a), (t = a);
						}
					}
					return r;
				}),
				(I.TokenSet.prototype.toArray = function () {
					for (var e = [], t = [{ prefix: '', node: this }]; t.length; ) {
						var r = t.pop(),
							n = Object.keys(r.node.edges),
							i = n.length;
						r.node.final && (r.prefix.charAt(0), e.push(r.prefix));
						for (var s = 0; s < i; s++) {
							var o = n[s];
							t.push({ prefix: r.prefix.concat(o), node: r.node.edges[o] });
						}
					}
					return e;
				}),
				(I.TokenSet.prototype.toString = function () {
					if (this._str) return this._str;
					for (var e = this.final ? '1' : '0', t = Object.keys(this.edges).sort(), r = t.length, n = 0; n < r; n++) {
						var i = t[n];
						e = e + i + this.edges[i].id;
					}
					return e;
				}),
				(I.TokenSet.prototype.intersect = function (e) {
					for (var t = new I.TokenSet(), r = void 0, n = [{ qNode: e, output: t, node: this }]; n.length; ) {
						r = n.pop();
						for (
							var i = Object.keys(r.qNode.edges), s = i.length, o = Object.keys(r.node.edges), a = o.length, u = 0;
							u < s;
							u++
						)
							for (var c = i[u], l = 0; l < a; l++) {
								var d = o[l];
								if (d == c || '*' == c) {
									var h = r.node.edges[d],
										f = r.qNode.edges[c],
										p = h.final && f.final,
										y = void 0;
									d in r.output.edges
										? ((y = r.output.edges[d]).final = y.final || p)
										: (((y = new I.TokenSet()).final = p), (r.output.edges[d] = y)),
										n.push({ qNode: f, output: y, node: h });
								}
							}
					}
					return t;
				}),
				(I.TokenSet.Builder = function () {
					(this.previousWord = ''),
						(this.root = new I.TokenSet()),
						(this.uncheckedNodes = []),
						(this.minimizedNodes = {});
				}),
				(I.TokenSet.Builder.prototype.insert = function (e) {
					var t,
						r = 0;
					if (e < this.previousWord) throw new Error('Out of order word insertion');
					for (var n = 0; n < e.length && n < this.previousWord.length && e[n] == this.previousWord[n]; n++) r++;
					this.minimize(r),
						(t =
							0 == this.uncheckedNodes.length ? this.root : this.uncheckedNodes[this.uncheckedNodes.length - 1].child);
					for (n = r; n < e.length; n++) {
						var i = new I.TokenSet(),
							s = e[n];
						(t.edges[s] = i), this.uncheckedNodes.push({ parent: t, char: s, child: i }), (t = i);
					}
					(t.final = !0), (this.previousWord = e);
				}),
				(I.TokenSet.Builder.prototype.finish = function () {
					this.minimize(0);
				}),
				(I.TokenSet.Builder.prototype.minimize = function (e) {
					for (var t = this.uncheckedNodes.length - 1; t >= e; t--) {
						var r = this.uncheckedNodes[t],
							n = r.child.toString();
						n in this.minimizedNodes
							? (r.parent.edges[r.char] = this.minimizedNodes[n])
							: ((r.child._str = n), (this.minimizedNodes[n] = r.child)),
							this.uncheckedNodes.pop();
					}
				}),
				/*!
				 * lunr.Index
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.Index = function (e) {
					(this.invertedIndex = e.invertedIndex),
						(this.fieldVectors = e.fieldVectors),
						(this.tokenSet = e.tokenSet),
						(this.fields = e.fields),
						(this.pipeline = e.pipeline);
				}),
				(I.Index.prototype.search = function (e) {
					return this.query(function (t) {
						new I.QueryParser(e, t).parse();
					});
				}),
				(I.Index.prototype.query = function (e) {
					for (
						var t = new I.Query(this.fields),
							r = Object.create(null),
							n = Object.create(null),
							i = Object.create(null),
							s = Object.create(null),
							o = Object.create(null),
							a = 0;
						a < this.fields.length;
						a++
					)
						n[this.fields[a]] = new I.Vector();
					e.call(t, t);
					for (a = 0; a < t.clauses.length; a++) {
						var u = t.clauses[a],
							c = null,
							l = I.Set.empty;
						c = u.usePipeline ? this.pipeline.runString(u.term, { fields: u.fields }) : [u.term];
						for (var d = 0; d < c.length; d++) {
							var h = c[d];
							u.term = h;
							var f = I.TokenSet.fromClause(u),
								p = this.tokenSet.intersect(f).toArray();
							if (0 === p.length && u.presence === I.Query.presence.REQUIRED) {
								for (var y = 0; y < u.fields.length; y++) {
									s[(R = u.fields[y])] = I.Set.empty;
								}
								break;
							}
							for (var m = 0; m < p.length; m++) {
								var v = p[m],
									g = this.invertedIndex[v],
									x = g._index;
								for (y = 0; y < u.fields.length; y++) {
									var w = g[(R = u.fields[y])],
										L = Object.keys(w),
										E = v + '/' + R,
										b = new I.Set(L);
									if (
										(u.presence == I.Query.presence.REQUIRED &&
											((l = l.union(b)), void 0 === s[R] && (s[R] = I.Set.complete)),
										u.presence != I.Query.presence.PROHIBITED)
									) {
										if (
											(n[R].upsert(x, u.boost, function (e, t) {
												return e + t;
											}),
											!i[E])
										) {
											for (var S = 0; S < L.length; S++) {
												var k,
													Q = L[S],
													O = new I.FieldRef(Q, R),
													P = w[Q];
												void 0 === (k = r[O]) ? (r[O] = new I.MatchData(v, R, P)) : k.add(v, R, P);
											}
											i[E] = !0;
										}
									} else void 0 === o[R] && (o[R] = I.Set.empty), (o[R] = o[R].union(b));
								}
							}
						}
						if (u.presence === I.Query.presence.REQUIRED)
							for (y = 0; y < u.fields.length; y++) {
								s[(R = u.fields[y])] = s[R].intersect(l);
							}
					}
					var T = I.Set.complete,
						_ = I.Set.empty;
					for (a = 0; a < this.fields.length; a++) {
						var R;
						s[(R = this.fields[a])] && (T = T.intersect(s[R])), o[R] && (_ = _.union(o[R]));
					}
					var C = Object.keys(r),
						j = [],
						F = Object.create(null);
					if (t.isNegated()) {
						C = Object.keys(this.fieldVectors);
						for (a = 0; a < C.length; a++) {
							O = C[a];
							var D = I.FieldRef.fromString(O);
							r[O] = new I.MatchData();
						}
					}
					for (a = 0; a < C.length; a++) {
						var N = (D = I.FieldRef.fromString(C[a])).docRef;
						if (T.contains(N) && !_.contains(N)) {
							var A,
								z = this.fieldVectors[D],
								V = n[D.fieldName].similarity(z);
							if (void 0 !== (A = F[N])) (A.score += V), A.matchData.combine(r[D]);
							else {
								var B = { ref: N, score: V, matchData: r[D] };
								(F[N] = B), j.push(B);
							}
						}
					}
					return j.sort(function (e, t) {
						return t.score - e.score;
					});
				}),
				(I.Index.prototype.toJSON = function () {
					var e = Object.keys(this.invertedIndex)
							.sort()
							.map(function (e) {
								return [e, this.invertedIndex[e]];
							}, this),
						t = Object.keys(this.fieldVectors).map(function (e) {
							return [e, this.fieldVectors[e].toJSON()];
						}, this);
					return {
						version: I.version,
						fields: this.fields,
						fieldVectors: t,
						invertedIndex: e,
						pipeline: this.pipeline.toJSON()
					};
				}),
				(I.Index.load = function (e) {
					var t = {},
						r = {},
						n = e.fieldVectors,
						i = Object.create(null),
						s = e.invertedIndex,
						o = new I.TokenSet.Builder(),
						a = I.Pipeline.load(e.pipeline);
					e.version != I.version &&
						I.utils.warn(
							"Version mismatch when loading serialised index. Current version of lunr '" +
								I.version +
								"' does not match serialized index '" +
								e.version +
								"'"
						);
					for (var u = 0; u < n.length; u++) {
						var c = (d = n[u])[0],
							l = d[1];
						r[c] = new I.Vector(l);
					}
					for (u = 0; u < s.length; u++) {
						var d,
							h = (d = s[u])[0],
							f = d[1];
						o.insert(h), (i[h] = f);
					}
					return (
						o.finish(),
						(t.fields = e.fields),
						(t.fieldVectors = r),
						(t.invertedIndex = i),
						(t.tokenSet = o.root),
						(t.pipeline = a),
						new I.Index(t)
					);
				}),
				/*!
				 * lunr.Builder
				 * Copyright (C) 2020 Oliver Nightingale
				 */ (I.Builder = function () {
					(this._ref = 'id'),
						(this._fields = Object.create(null)),
						(this._documents = Object.create(null)),
						(this.invertedIndex = Object.create(null)),
						(this.fieldTermFrequencies = {}),
						(this.fieldLengths = {}),
						(this.tokenizer = I.tokenizer),
						(this.pipeline = new I.Pipeline()),
						(this.searchPipeline = new I.Pipeline()),
						(this.documentCount = 0),
						(this._b = 0.75),
						(this._k1 = 1.2),
						(this.termIndex = 0),
						(this.metadataWhitelist = []);
				}),
				(I.Builder.prototype.ref = function (e) {
					this._ref = e;
				}),
				(I.Builder.prototype.field = function (e, t) {
					if (/\//.test(e)) throw new RangeError("Field '" + e + "' contains illegal character '/'");
					this._fields[e] = t || {};
				}),
				(I.Builder.prototype.b = function (e) {
					this._b = e < 0 ? 0 : e > 1 ? 1 : e;
				}),
				(I.Builder.prototype.k1 = function (e) {
					this._k1 = e;
				}),
				(I.Builder.prototype.add = function (e, t) {
					var r = e[this._ref],
						n = Object.keys(this._fields);
					(this._documents[r] = t || {}), (this.documentCount += 1);
					for (var i = 0; i < n.length; i++) {
						var s = n[i],
							o = this._fields[s].extractor,
							a = o ? o(e) : e[s],
							u = this.tokenizer(a, { fields: [s] }),
							c = this.pipeline.run(u),
							l = new I.FieldRef(r, s),
							d = Object.create(null);
						(this.fieldTermFrequencies[l] = d), (this.fieldLengths[l] = 0), (this.fieldLengths[l] += c.length);
						for (var h = 0; h < c.length; h++) {
							var f = c[h];
							if ((null == d[f] && (d[f] = 0), (d[f] += 1), null == this.invertedIndex[f])) {
								var p = Object.create(null);
								(p._index = this.termIndex), (this.termIndex += 1);
								for (var y = 0; y < n.length; y++) p[n[y]] = Object.create(null);
								this.invertedIndex[f] = p;
							}
							null == this.invertedIndex[f][s][r] && (this.invertedIndex[f][s][r] = Object.create(null));
							for (var m = 0; m < this.metadataWhitelist.length; m++) {
								var v = this.metadataWhitelist[m],
									g = f.metadata[v];
								null == this.invertedIndex[f][s][r][v] && (this.invertedIndex[f][s][r][v] = []),
									this.invertedIndex[f][s][r][v].push(g);
							}
						}
					}
				}),
				(I.Builder.prototype.calculateAverageFieldLengths = function () {
					for (var e = Object.keys(this.fieldLengths), t = e.length, r = {}, n = {}, i = 0; i < t; i++) {
						var s = I.FieldRef.fromString(e[i]),
							o = s.fieldName;
						n[o] || (n[o] = 0), (n[o] += 1), r[o] || (r[o] = 0), (r[o] += this.fieldLengths[s]);
					}
					var a = Object.keys(this._fields);
					for (i = 0; i < a.length; i++) {
						var u = a[i];
						r[u] = r[u] / n[u];
					}
					this.averageFieldLength = r;
				}),
				(I.Builder.prototype.createFieldVectors = function () {
					for (
						var e = {}, t = Object.keys(this.fieldTermFrequencies), r = t.length, n = Object.create(null), i = 0;
						i < r;
						i++
					) {
						for (
							var s = I.FieldRef.fromString(t[i]),
								o = s.fieldName,
								a = this.fieldLengths[s],
								u = new I.Vector(),
								c = this.fieldTermFrequencies[s],
								l = Object.keys(c),
								d = l.length,
								h = this._fields[o].boost || 1,
								f = this._documents[s.docRef].boost || 1,
								p = 0;
							p < d;
							p++
						) {
							var y,
								m,
								v,
								g = l[p],
								x = c[g],
								w = this.invertedIndex[g]._index;
							void 0 === n[g] ? ((y = I.idf(this.invertedIndex[g], this.documentCount)), (n[g] = y)) : (y = n[g]),
								(m =
									(y * ((this._k1 + 1) * x)) /
									(this._k1 * (1 - this._b + this._b * (a / this.averageFieldLength[o])) + x)),
								(m *= h),
								(m *= f),
								(v = Math.round(1e3 * m) / 1e3),
								u.insert(w, v);
						}
						e[s] = u;
					}
					this.fieldVectors = e;
				}),
				(I.Builder.prototype.createTokenSet = function () {
					this.tokenSet = I.TokenSet.fromArray(Object.keys(this.invertedIndex).sort());
				}),
				(I.Builder.prototype.build = function () {
					return (
						this.calculateAverageFieldLengths(),
						this.createFieldVectors(),
						this.createTokenSet(),
						new I.Index({
							invertedIndex: this.invertedIndex,
							fieldVectors: this.fieldVectors,
							tokenSet: this.tokenSet,
							fields: Object.keys(this._fields),
							pipeline: this.searchPipeline
						})
					);
				}),
				(I.Builder.prototype.use = function (e) {
					var t = Array.prototype.slice.call(arguments, 1);
					t.unshift(this), e.apply(this, t);
				}),
				(I.MatchData = function (e, t, r) {
					for (var n = Object.create(null), i = Object.keys(r || {}), s = 0; s < i.length; s++) {
						var o = i[s];
						n[o] = r[o].slice();
					}
					(this.metadata = Object.create(null)),
						void 0 !== e && ((this.metadata[e] = Object.create(null)), (this.metadata[e][t] = n));
				}),
				(I.MatchData.prototype.combine = function (e) {
					for (var t = Object.keys(e.metadata), r = 0; r < t.length; r++) {
						var n = t[r],
							i = Object.keys(e.metadata[n]);
						null == this.metadata[n] && (this.metadata[n] = Object.create(null));
						for (var s = 0; s < i.length; s++) {
							var o = i[s],
								a = Object.keys(e.metadata[n][o]);
							null == this.metadata[n][o] && (this.metadata[n][o] = Object.create(null));
							for (var u = 0; u < a.length; u++) {
								var c = a[u];
								null == this.metadata[n][o][c]
									? (this.metadata[n][o][c] = e.metadata[n][o][c])
									: (this.metadata[n][o][c] = this.metadata[n][o][c].concat(e.metadata[n][o][c]));
							}
						}
					}
				}),
				(I.MatchData.prototype.add = function (e, t, r) {
					if (!(e in this.metadata)) return (this.metadata[e] = Object.create(null)), void (this.metadata[e][t] = r);
					if (t in this.metadata[e])
						for (var n = Object.keys(r), i = 0; i < n.length; i++) {
							var s = n[i];
							s in this.metadata[e][t]
								? (this.metadata[e][t][s] = this.metadata[e][t][s].concat(r[s]))
								: (this.metadata[e][t][s] = r[s]);
						}
					else this.metadata[e][t] = r;
				}),
				(I.Query = function (e) {
					(this.clauses = []), (this.allFields = e);
				}),
				(I.Query.wildcard = new String('*')),
				(I.Query.wildcard.NONE = 0),
				(I.Query.wildcard.LEADING = 1),
				(I.Query.wildcard.TRAILING = 2),
				(I.Query.presence = { OPTIONAL: 1, REQUIRED: 2, PROHIBITED: 3 }),
				(I.Query.prototype.clause = function (e) {
					return (
						'fields' in e || (e.fields = this.allFields),
						'boost' in e || (e.boost = 1),
						'usePipeline' in e || (e.usePipeline = !0),
						'wildcard' in e || (e.wildcard = I.Query.wildcard.NONE),
						e.wildcard & I.Query.wildcard.LEADING && e.term.charAt(0) != I.Query.wildcard && (e.term = '*' + e.term),
						e.wildcard & I.Query.wildcard.TRAILING && e.term.slice(-1) != I.Query.wildcard && (e.term = e.term + '*'),
						'presence' in e || (e.presence = I.Query.presence.OPTIONAL),
						this.clauses.push(e),
						this
					);
				}),
				(I.Query.prototype.isNegated = function () {
					for (var e = 0; e < this.clauses.length; e++)
						if (this.clauses[e].presence != I.Query.presence.PROHIBITED) return !1;
					return !0;
				}),
				(I.Query.prototype.term = function (e, t) {
					if (Array.isArray(e))
						return (
							e.forEach(function (e) {
								this.term(e, I.utils.clone(t));
							}, this),
							this
						);
					var r = t || {};
					return (r.term = e.toString()), this.clause(r), this;
				}),
				(I.QueryParseError = function (e, t, r) {
					(this.name = 'QueryParseError'), (this.message = e), (this.start = t), (this.end = r);
				}),
				(I.QueryParseError.prototype = new Error()),
				(I.QueryLexer = function (e) {
					(this.lexemes = []),
						(this.str = e),
						(this.length = e.length),
						(this.pos = 0),
						(this.start = 0),
						(this.escapeCharPositions = []);
				}),
				(I.QueryLexer.prototype.run = function () {
					for (var e = I.QueryLexer.lexText; e; ) e = e(this);
				}),
				(I.QueryLexer.prototype.sliceString = function () {
					for (var e = [], t = this.start, r = this.pos, n = 0; n < this.escapeCharPositions.length; n++)
						(r = this.escapeCharPositions[n]), e.push(this.str.slice(t, r)), (t = r + 1);
					return e.push(this.str.slice(t, this.pos)), (this.escapeCharPositions.length = 0), e.join('');
				}),
				(I.QueryLexer.prototype.emit = function (e) {
					this.lexemes.push({ type: e, str: this.sliceString(), start: this.start, end: this.pos }),
						(this.start = this.pos);
				}),
				(I.QueryLexer.prototype.escapeCharacter = function () {
					this.escapeCharPositions.push(this.pos - 1), (this.pos += 1);
				}),
				(I.QueryLexer.prototype.next = function () {
					if (this.pos >= this.length) return I.QueryLexer.EOS;
					var e = this.str.charAt(this.pos);
					return (this.pos += 1), e;
				}),
				(I.QueryLexer.prototype.width = function () {
					return this.pos - this.start;
				}),
				(I.QueryLexer.prototype.ignore = function () {
					this.start == this.pos && (this.pos += 1), (this.start = this.pos);
				}),
				(I.QueryLexer.prototype.backup = function () {
					this.pos -= 1;
				}),
				(I.QueryLexer.prototype.acceptDigitRun = function () {
					var e, t;
					do {
						t = (e = this.next()).charCodeAt(0);
					} while (t > 47 && t < 58);
					e != I.QueryLexer.EOS && this.backup();
				}),
				(I.QueryLexer.prototype.more = function () {
					return this.pos < this.length;
				}),
				(I.QueryLexer.EOS = 'EOS'),
				(I.QueryLexer.FIELD = 'FIELD'),
				(I.QueryLexer.TERM = 'TERM'),
				(I.QueryLexer.EDIT_DISTANCE = 'EDIT_DISTANCE'),
				(I.QueryLexer.BOOST = 'BOOST'),
				(I.QueryLexer.PRESENCE = 'PRESENCE'),
				(I.QueryLexer.lexField = function (e) {
					return e.backup(), e.emit(I.QueryLexer.FIELD), e.ignore(), I.QueryLexer.lexText;
				}),
				(I.QueryLexer.lexTerm = function (e) {
					if ((e.width() > 1 && (e.backup(), e.emit(I.QueryLexer.TERM)), e.ignore(), e.more()))
						return I.QueryLexer.lexText;
				}),
				(I.QueryLexer.lexEditDistance = function (e) {
					return e.ignore(), e.acceptDigitRun(), e.emit(I.QueryLexer.EDIT_DISTANCE), I.QueryLexer.lexText;
				}),
				(I.QueryLexer.lexBoost = function (e) {
					return e.ignore(), e.acceptDigitRun(), e.emit(I.QueryLexer.BOOST), I.QueryLexer.lexText;
				}),
				(I.QueryLexer.lexEOS = function (e) {
					e.width() > 0 && e.emit(I.QueryLexer.TERM);
				}),
				(I.QueryLexer.termSeparator = I.tokenizer.separator),
				(I.QueryLexer.lexText = function (e) {
					for (;;) {
						var t = e.next();
						if (t == I.QueryLexer.EOS) return I.QueryLexer.lexEOS;
						if (92 != t.charCodeAt(0)) {
							if (':' == t) return I.QueryLexer.lexField;
							if ('~' == t) return e.backup(), e.width() > 0 && e.emit(I.QueryLexer.TERM), I.QueryLexer.lexEditDistance;
							if ('^' == t) return e.backup(), e.width() > 0 && e.emit(I.QueryLexer.TERM), I.QueryLexer.lexBoost;
							if ('+' == t && 1 === e.width()) return e.emit(I.QueryLexer.PRESENCE), I.QueryLexer.lexText;
							if ('-' == t && 1 === e.width()) return e.emit(I.QueryLexer.PRESENCE), I.QueryLexer.lexText;
							if (t.match(I.QueryLexer.termSeparator)) return I.QueryLexer.lexTerm;
						} else e.escapeCharacter();
					}
				}),
				(I.QueryParser = function (e, t) {
					(this.lexer = new I.QueryLexer(e)), (this.query = t), (this.currentClause = {}), (this.lexemeIdx = 0);
				}),
				(I.QueryParser.prototype.parse = function () {
					this.lexer.run(), (this.lexemes = this.lexer.lexemes);
					for (var e = I.QueryParser.parseClause; e; ) e = e(this);
					return this.query;
				}),
				(I.QueryParser.prototype.peekLexeme = function () {
					return this.lexemes[this.lexemeIdx];
				}),
				(I.QueryParser.prototype.consumeLexeme = function () {
					var e = this.peekLexeme();
					return (this.lexemeIdx += 1), e;
				}),
				(I.QueryParser.prototype.nextClause = function () {
					var e = this.currentClause;
					this.query.clause(e), (this.currentClause = {});
				}),
				(I.QueryParser.parseClause = function (e) {
					var t = e.peekLexeme();
					if (null != t)
						switch (t.type) {
							case I.QueryLexer.PRESENCE:
								return I.QueryParser.parsePresence;
							case I.QueryLexer.FIELD:
								return I.QueryParser.parseField;
							case I.QueryLexer.TERM:
								return I.QueryParser.parseTerm;
							default:
								var r = 'expected either a field or a term, found ' + t.type;
								throw (
									(t.str.length >= 1 && (r += " with value '" + t.str + "'"), new I.QueryParseError(r, t.start, t.end))
								);
						}
				}),
				(I.QueryParser.parsePresence = function (e) {
					var t = e.consumeLexeme();
					if (null != t) {
						switch (t.str) {
							case '-':
								e.currentClause.presence = I.Query.presence.PROHIBITED;
								break;
							case '+':
								e.currentClause.presence = I.Query.presence.REQUIRED;
								break;
							default:
								var r = "unrecognised presence operator'" + t.str + "'";
								throw new I.QueryParseError(r, t.start, t.end);
						}
						var n = e.peekLexeme();
						if (null == n) {
							r = 'expecting term or field, found nothing';
							throw new I.QueryParseError(r, t.start, t.end);
						}
						switch (n.type) {
							case I.QueryLexer.FIELD:
								return I.QueryParser.parseField;
							case I.QueryLexer.TERM:
								return I.QueryParser.parseTerm;
							default:
								r = "expecting term or field, found '" + n.type + "'";
								throw new I.QueryParseError(r, n.start, n.end);
						}
					}
				}),
				(I.QueryParser.parseField = function (e) {
					var t = e.consumeLexeme();
					if (null != t) {
						if (-1 == e.query.allFields.indexOf(t.str)) {
							var r = e.query.allFields
									.map(function (e) {
										return "'" + e + "'";
									})
									.join(', '),
								n = "unrecognised field '" + t.str + "', possible fields: " + r;
							throw new I.QueryParseError(n, t.start, t.end);
						}
						e.currentClause.fields = [t.str];
						var i = e.peekLexeme();
						if (null == i) {
							n = 'expecting term, found nothing';
							throw new I.QueryParseError(n, t.start, t.end);
						}
						switch (i.type) {
							case I.QueryLexer.TERM:
								return I.QueryParser.parseTerm;
							default:
								n = "expecting term, found '" + i.type + "'";
								throw new I.QueryParseError(n, i.start, i.end);
						}
					}
				}),
				(I.QueryParser.parseTerm = function (e) {
					var t = e.consumeLexeme();
					if (null != t) {
						(e.currentClause.term = t.str.toLowerCase()),
							-1 != t.str.indexOf('*') && (e.currentClause.usePipeline = !1);
						var r = e.peekLexeme();
						if (null != r)
							switch (r.type) {
								case I.QueryLexer.TERM:
									return e.nextClause(), I.QueryParser.parseTerm;
								case I.QueryLexer.FIELD:
									return e.nextClause(), I.QueryParser.parseField;
								case I.QueryLexer.EDIT_DISTANCE:
									return I.QueryParser.parseEditDistance;
								case I.QueryLexer.BOOST:
									return I.QueryParser.parseBoost;
								case I.QueryLexer.PRESENCE:
									return e.nextClause(), I.QueryParser.parsePresence;
								default:
									var n = "Unexpected lexeme type '" + r.type + "'";
									throw new I.QueryParseError(n, r.start, r.end);
							}
						else e.nextClause();
					}
				}),
				(I.QueryParser.parseEditDistance = function (e) {
					var t = e.consumeLexeme();
					if (null != t) {
						var r = parseInt(t.str, 10);
						if (isNaN(r)) {
							var n = 'edit distance must be numeric';
							throw new I.QueryParseError(n, t.start, t.end);
						}
						e.currentClause.editDistance = r;
						var i = e.peekLexeme();
						if (null != i)
							switch (i.type) {
								case I.QueryLexer.TERM:
									return e.nextClause(), I.QueryParser.parseTerm;
								case I.QueryLexer.FIELD:
									return e.nextClause(), I.QueryParser.parseField;
								case I.QueryLexer.EDIT_DISTANCE:
									return I.QueryParser.parseEditDistance;
								case I.QueryLexer.BOOST:
									return I.QueryParser.parseBoost;
								case I.QueryLexer.PRESENCE:
									return e.nextClause(), I.QueryParser.parsePresence;
								default:
									n = "Unexpected lexeme type '" + i.type + "'";
									throw new I.QueryParseError(n, i.start, i.end);
							}
						else e.nextClause();
					}
				}),
				(I.QueryParser.parseBoost = function (e) {
					var t = e.consumeLexeme();
					if (null != t) {
						var r = parseInt(t.str, 10);
						if (isNaN(r)) {
							var n = 'boost must be numeric';
							throw new I.QueryParseError(n, t.start, t.end);
						}
						e.currentClause.boost = r;
						var i = e.peekLexeme();
						if (null != i)
							switch (i.type) {
								case I.QueryLexer.TERM:
									return e.nextClause(), I.QueryParser.parseTerm;
								case I.QueryLexer.FIELD:
									return e.nextClause(), I.QueryParser.parseField;
								case I.QueryLexer.EDIT_DISTANCE:
									return I.QueryParser.parseEditDistance;
								case I.QueryLexer.BOOST:
									return I.QueryParser.parseBoost;
								case I.QueryLexer.PRESENCE:
									return e.nextClause(), I.QueryParser.parsePresence;
								default:
									n = "Unexpected lexeme type '" + i.type + "'";
									throw new I.QueryParseError(n, i.start, i.end);
							}
						else e.nextClause();
					}
				}),
				void 0 ===
					(i =
						'function' ==
						typeof (n = function () {
							return I;
						})
							? n.call(t, r, t, e)
							: n) || (e.exports = i);
		})();
	},
	function (e, t, r) {},
	function (e, t, r) {
		'use strict';
		r.r(t);
		var n = [];
		function i(e, t) {
			n.push({ selector: t, constructor: e });
		}
		var s,
			o = (function () {
				function e() {
					this.createComponents(document.body);
				}
				return (
					(e.prototype.createComponents = function (e) {
						n.forEach(function (t) {
							e.querySelectorAll(t.selector).forEach(function (e) {
								e.dataset.hasInstance || (new t.constructor({ el: e }), (e.dataset.hasInstance = String(!0)));
							});
						});
					}),
					e
				);
			})(),
			a = function (e) {
				this.el = e.el;
			},
			u = (function () {
				function e() {
					this.listeners = {};
				}
				return (
					(e.prototype.addEventListener = function (e, t) {
						e in this.listeners || (this.listeners[e] = []), this.listeners[e].push(t);
					}),
					(e.prototype.removeEventListener = function (e, t) {
						if (e in this.listeners)
							for (var r = this.listeners[e], n = 0, i = r.length; n < i; n++)
								if (r[n] === t) return void r.splice(n, 1);
					}),
					(e.prototype.dispatchEvent = function (e) {
						if (!(e.type in this.listeners)) return !0;
						for (var t = this.listeners[e.type].slice(), r = 0, n = t.length; r < n; r++) t[r].call(this, e);
						return !e.defaultPrevented;
					}),
					e
				);
			})(),
			c = function (e, t) {
				void 0 === t && (t = 100);
				var r = Date.now();
				return function () {
					for (var n = [], i = 0; i < arguments.length; i++) n[i] = arguments[i];
					r + t - Date.now() < 0 && (e.apply(void 0, n), (r = Date.now()));
				};
			},
			l =
				((s = function (e, t) {
					return (s =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (e, t) {
								e.__proto__ = t;
							}) ||
						function (e, t) {
							for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
						})(e, t);
				}),
				function (e, t) {
					function r() {
						this.constructor = e;
					}
					s(e, t), (e.prototype = null === t ? Object.create(t) : ((r.prototype = t.prototype), new r()));
				}),
			d = (function (e) {
				function t() {
					var t = e.call(this) || this;
					return (
						(t.scrollTop = 0),
						(t.lastY = 0),
						(t.width = 0),
						(t.height = 0),
						(t.showToolbar = !0),
						(t.toolbar = document.querySelector('.tsd-page-toolbar')),
						(t.secondaryNav = document.querySelector('.tsd-navigation.secondary')),
						window.addEventListener(
							'scroll',
							c(function () {
								return t.onScroll();
							}, 10)
						),
						window.addEventListener(
							'resize',
							c(function () {
								return t.onResize();
							}, 10)
						),
						t.onResize(),
						t.onScroll(),
						t
					);
				}
				return (
					l(t, e),
					(t.prototype.triggerResize = function () {
						var e = new CustomEvent('resize', { detail: { width: this.width, height: this.height } });
						this.dispatchEvent(e);
					}),
					(t.prototype.onResize = function () {
						(this.width = window.innerWidth || 0), (this.height = window.innerHeight || 0);
						var e = new CustomEvent('resize', { detail: { width: this.width, height: this.height } });
						this.dispatchEvent(e);
					}),
					(t.prototype.onScroll = function () {
						this.scrollTop = window.scrollY || 0;
						var e = new CustomEvent('scroll', { detail: { scrollTop: this.scrollTop } });
						this.dispatchEvent(e), this.hideShowToolbar();
					}),
					(t.prototype.hideShowToolbar = function () {
						var e = this.showToolbar;
						(this.showToolbar = this.lastY >= this.scrollTop || 0 === this.scrollTop),
							e !== this.showToolbar &&
								(this.toolbar.classList.toggle('tsd-page-toolbar--hide'),
								this.secondaryNav.classList.toggle('tsd-navigation--toolbar-hide')),
							(this.lastY = this.scrollTop);
					}),
					(t.instance = new t()),
					t
				);
			})(u),
			h = (function () {
				var e = function (t, r) {
					return (e =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (e, t) {
								e.__proto__ = t;
							}) ||
						function (e, t) {
							for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
						})(t, r);
				};
				return function (t, r) {
					function n() {
						this.constructor = t;
					}
					e(t, r), (t.prototype = null === r ? Object.create(r) : ((n.prototype = r.prototype), new n()));
				};
			})(),
			f = (function (e) {
				function t(t) {
					var r = e.call(this, t) || this;
					return (
						(r.anchors = []),
						(r.index = -1),
						d.instance.addEventListener('resize', function () {
							return r.onResize();
						}),
						d.instance.addEventListener('scroll', function (e) {
							return r.onScroll(e);
						}),
						r.createAnchors(),
						r
					);
				}
				return (
					h(t, e),
					(t.prototype.createAnchors = function () {
						var e = this,
							t = window.location.href;
						-1 != t.indexOf('#') && (t = t.substr(0, t.indexOf('#'))),
							this.el.querySelectorAll('a').forEach(function (r) {
								var n = r.href;
								if (-1 != n.indexOf('#') && n.substr(0, t.length) == t) {
									var i = n.substr(n.indexOf('#') + 1),
										s = document.querySelector('a.tsd-anchor[name=' + i + ']'),
										o = r.parentNode;
									s && o && e.anchors.push({ link: o, anchor: s, position: 0 });
								}
							}),
							this.onResize();
					}),
					(t.prototype.onResize = function () {
						for (var e, t = 0, r = this.anchors.length; t < r; t++) {
							var n = (e = this.anchors[t]).anchor.getBoundingClientRect();
							e.position = n.top + document.body.scrollTop;
						}
						this.anchors.sort(function (e, t) {
							return e.position - t.position;
						});
						var i = new CustomEvent('scroll', { detail: { scrollTop: d.instance.scrollTop } });
						this.onScroll(i);
					}),
					(t.prototype.onScroll = function (e) {
						for (
							var t = e.detail.scrollTop + 5, r = this.anchors, n = r.length - 1, i = this.index;
							i > -1 && r[i].position > t;

						)
							i -= 1;
						for (; i < n && r[i + 1].position < t; ) i += 1;
						this.index != i &&
							(this.index > -1 && this.anchors[this.index].link.classList.remove('focus'),
							(this.index = i),
							this.index > -1 && this.anchors[this.index].link.classList.add('focus'));
					}),
					t
				);
			})(a),
			p = r(0);
		function y(e, t) {
			var r = e.querySelector('.current');
			if (r) {
				var n = 1 == t ? r.nextElementSibling : r.previousElementSibling;
				n && (r.classList.remove('current'), n.classList.add('current'));
			} else (r = e.querySelector(1 == t ? 'li:first-child' : 'li:last-child')) && r.classList.add('current');
		}
		function m(e, t) {
			if ('' === t) return e;
			for (var r = e.toLocaleLowerCase(), n = t.toLocaleLowerCase(), i = [], s = 0, o = r.indexOf(n); -1 != o; )
				i.push(g(e.substring(s, o)), '<b>' + g(e.substring(o, o + n.length)) + '</b>'),
					(s = o + n.length),
					(o = r.indexOf(n, s));
			return i.push(g(e.substring(s))), i.join('');
		}
		var v = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' };
		function g(e) {
			return e.replace(/[&<>"'"]/g, function (e) {
				return v[e];
			});
		}
		var x = (function () {
				var e = function (t, r) {
					return (e =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (e, t) {
								e.__proto__ = t;
							}) ||
						function (e, t) {
							for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
						})(t, r);
				};
				return function (t, r) {
					function n() {
						this.constructor = t;
					}
					e(t, r), (t.prototype = null === r ? Object.create(r) : ((n.prototype = r.prototype), new n()));
				};
			})(),
			w = (function () {
				function e(e, t) {
					(this.signature = e), (this.description = t);
				}
				return (
					(e.prototype.addClass = function (e) {
						return this.signature.classList.add(e), this.description.classList.add(e), this;
					}),
					(e.prototype.removeClass = function (e) {
						return this.signature.classList.remove(e), this.description.classList.remove(e), this;
					}),
					e
				);
			})(),
			L = (function (e) {
				function t(t) {
					var r = e.call(this, t) || this;
					return (
						(r.groups = []),
						(r.index = -1),
						r.createGroups(),
						r.container &&
							(r.el.classList.add('active'),
							Array.from(r.el.children).forEach(function (e) {
								e.addEventListener('touchstart', function (e) {
									return r.onClick(e);
								}),
									e.addEventListener('click', function (e) {
										return r.onClick(e);
									});
							}),
							r.container.classList.add('active'),
							r.setIndex(0)),
						r
					);
				}
				return (
					x(t, e),
					(t.prototype.setIndex = function (e) {
						if ((e < 0 && (e = 0), e > this.groups.length - 1 && (e = this.groups.length - 1), this.index != e)) {
							var t = this.groups[e];
							if (this.index > -1) {
								var r = this.groups[this.index];
								r.removeClass('current').addClass('fade-out'),
									t.addClass('current'),
									t.addClass('fade-in'),
									d.instance.triggerResize(),
									setTimeout(function () {
										r.removeClass('fade-out'), t.removeClass('fade-in');
									}, 300);
							} else t.addClass('current'), d.instance.triggerResize();
							this.index = e;
						}
					}),
					(t.prototype.createGroups = function () {
						var e = this.el.children;
						if (!(e.length < 2)) {
							this.container = this.el.nextElementSibling;
							var t = this.container.children;
							this.groups = [];
							for (var r = 0; r < e.length; r++) this.groups.push(new w(e[r], t[r]));
						}
					}),
					(t.prototype.onClick = function (e) {
						var t = this;
						this.groups.forEach(function (r, n) {
							r.signature === e.currentTarget && t.setIndex(n);
						});
					}),
					t
				);
			})(a),
			E = 'mousedown',
			b = 'mousemove',
			S = 'mouseup',
			k = { x: 0, y: 0 },
			Q = !1,
			O = !1,
			P = !1,
			T = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		document.documentElement.classList.add(T ? 'is-mobile' : 'not-mobile'),
			T && 'ontouchstart' in document.documentElement && (!0, (E = 'touchstart'), (b = 'touchmove'), (S = 'touchend')),
			document.addEventListener(E, function (e) {
				(O = !0), (P = !1);
				var t = 'touchstart' == E ? e.targetTouches[0] : e;
				(k.y = t.pageY || 0), (k.x = t.pageX || 0);
			}),
			document.addEventListener(b, function (e) {
				if (O && !P) {
					var t = 'touchstart' == E ? e.targetTouches[0] : e,
						r = k.x - (t.pageX || 0),
						n = k.y - (t.pageY || 0);
					P = Math.sqrt(r * r + n * n) > 10;
				}
			}),
			document.addEventListener(S, function () {
				O = !1;
			}),
			document.addEventListener('click', function (e) {
				Q && (e.preventDefault(), e.stopImmediatePropagation(), (Q = !1));
			});
		var _ = (function () {
				var e = function (t, r) {
					return (e =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (e, t) {
								e.__proto__ = t;
							}) ||
						function (e, t) {
							for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
						})(t, r);
				};
				return function (t, r) {
					function n() {
						this.constructor = t;
					}
					e(t, r), (t.prototype = null === r ? Object.create(r) : ((n.prototype = r.prototype), new n()));
				};
			})(),
			I = (function (e) {
				function t(t) {
					var r = e.call(this, t) || this;
					return (
						(r.className = r.el.dataset.toggle || ''),
						r.el.addEventListener(S, function (e) {
							return r.onPointerUp(e);
						}),
						r.el.addEventListener('click', function (e) {
							return e.preventDefault();
						}),
						document.addEventListener(E, function (e) {
							return r.onDocumentPointerDown(e);
						}),
						document.addEventListener(S, function (e) {
							return r.onDocumentPointerUp(e);
						}),
						r
					);
				}
				return (
					_(t, e),
					(t.prototype.setActive = function (e) {
						if (this.active != e) {
							(this.active = e),
								document.documentElement.classList.toggle('has-' + this.className, e),
								this.el.classList.toggle('active', e);
							var t = (this.active ? 'to-has-' : 'from-has-') + this.className;
							document.documentElement.classList.add(t),
								setTimeout(function () {
									return document.documentElement.classList.remove(t);
								}, 500);
						}
					}),
					(t.prototype.onPointerUp = function (e) {
						P || (this.setActive(!0), e.preventDefault());
					}),
					(t.prototype.onDocumentPointerDown = function (e) {
						if (this.active) {
							if (e.target.closest('.col-menu, .tsd-filter-group')) return;
							this.setActive(!1);
						}
					}),
					(t.prototype.onDocumentPointerUp = function (e) {
						var t = this;
						if (!P && this.active && e.target.closest('.col-menu')) {
							var r = e.target.closest('a');
							if (r) {
								var n = window.location.href;
								-1 != n.indexOf('#') && (n = n.substr(0, n.indexOf('#'))),
									r.href.substr(0, n.length) == n &&
										setTimeout(function () {
											return t.setActive(!1);
										}, 250);
							}
						}
					}),
					t
				);
			})(a),
			R = (function () {
				var e = function (t, r) {
					return (e =
						Object.setPrototypeOf ||
						({ __proto__: [] } instanceof Array &&
							function (e, t) {
								e.__proto__ = t;
							}) ||
						function (e, t) {
							for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
						})(t, r);
				};
				return function (t, r) {
					function n() {
						this.constructor = t;
					}
					e(t, r), (t.prototype = null === r ? Object.create(r) : ((n.prototype = r.prototype), new n()));
				};
			})(),
			C = (function () {
				function e(e, t) {
					(this.key = e),
						(this.value = t),
						(this.defaultValue = t),
						this.initialize(),
						window.localStorage[this.key] && this.setValue(this.fromLocalStorage(window.localStorage[this.key]));
				}
				return (
					(e.prototype.initialize = function () {}),
					(e.prototype.setValue = function (e) {
						if (this.value != e) {
							var t = this.value;
							(this.value = e), (window.localStorage[this.key] = this.toLocalStorage(e)), this.handleValueChange(t, e);
						}
					}),
					e
				);
			})(),
			j = (function (e) {
				function t() {
					return (null !== e && e.apply(this, arguments)) || this;
				}
				return (
					R(t, e),
					(t.prototype.initialize = function () {
						var e = this,
							t = document.querySelector('#tsd-filter-' + this.key);
						t &&
							((this.checkbox = t),
							this.checkbox.addEventListener('change', function () {
								e.setValue(e.checkbox.checked);
							}));
					}),
					(t.prototype.handleValueChange = function (e, t) {
						this.checkbox &&
							((this.checkbox.checked = this.value),
							document.documentElement.classList.toggle('toggle-' + this.key, this.value != this.defaultValue));
					}),
					(t.prototype.fromLocalStorage = function (e) {
						return 'true' == e;
					}),
					(t.prototype.toLocalStorage = function (e) {
						return e ? 'true' : 'false';
					}),
					t
				);
			})(C),
			F = (function (e) {
				function t() {
					return (null !== e && e.apply(this, arguments)) || this;
				}
				return (
					R(t, e),
					(t.prototype.initialize = function () {
						var e = this;
						document.documentElement.classList.add('toggle-' + this.key + this.value);
						var t = document.querySelector('#tsd-filter-' + this.key);
						if (t) {
							this.select = t;
							var r = function () {
								e.select.classList.add('active');
							};
							this.select.addEventListener(E, r),
								this.select.addEventListener('mouseover', r),
								this.select.addEventListener('mouseleave', function () {
									e.select.classList.remove('active');
								}),
								this.select.querySelectorAll('li').forEach(function (r) {
									r.addEventListener(S, function (r) {
										t.classList.remove('active'), e.setValue(r.target.dataset.value || '');
									});
								}),
								document.addEventListener(E, function (t) {
									e.select.contains(t.target) || e.select.classList.remove('active');
								});
						}
					}),
					(t.prototype.handleValueChange = function (e, t) {
						this.select.querySelectorAll('li.selected').forEach(function (e) {
							e.classList.remove('selected');
						});
						var r = this.select.querySelector('li[data-value="' + t + '"]'),
							n = this.select.querySelector('.tsd-select-label');
						r && n && (r.classList.add('selected'), (n.textContent = r.textContent)),
							document.documentElement.classList.remove('toggle-' + e),
							document.documentElement.classList.add('toggle-' + t);
					}),
					(t.prototype.fromLocalStorage = function (e) {
						return e;
					}),
					(t.prototype.toLocalStorage = function (e) {
						return e;
					}),
					t
				);
			})(C),
			D = (function (e) {
				function t(t) {
					var r = e.call(this, t) || this;
					return (
						(r.optionVisibility = new F('visibility', 'private')),
						(r.optionInherited = new j('inherited', !0)),
						(r.optionExternals = new j('externals', !0)),
						r
					);
				}
				return (
					R(t, e),
					(t.isSupported = function () {
						try {
							return void 0 !== window.localStorage;
						} catch (e) {
							return !1;
						}
					}),
					t
				);
			})(a);
		r(1);
		!(function () {
			var e = document.getElementById('tsd-search');
			if (e) {
				var t = document.getElementById('search-script');
				t &&
					(t.addEventListener('error', function () {
						e.classList.remove('loading'), e.classList.add('failure');
					}),
					t.addEventListener('load', function () {
						e.classList.remove('loading'), e.classList.add('ready');
					})),
					e.classList.add('loading');
				var r = document.querySelector('#tsd-search-field'),
					n = document.querySelector('.results');
				if (!r || !n) throw new Error('The input field or the result list wrapper was not found');
				r.addEventListener('focus', function () {
					return e.classList.add('has-focus');
				}),
					r.addEventListener('blur', function () {
						setTimeout(function () {
							return e.classList.remove('has-focus');
						}, 100);
					});
				var i = { base: e.dataset.base + '/' };
				!(function (e, t, r, n) {
					r.addEventListener('input', function () {
						!(function (e, t, r, n) {
							if (
								((function (e, t) {
									if (e.index) return;
									window.searchData &&
										(t.classList.remove('loading'),
										t.classList.add('ready'),
										(e.data = window.searchData),
										(e.index = p.Index.load(window.searchData.index)));
								})(n, e),
								!n.index || !n.data)
							)
								return;
							t.textContent = '';
							var i = r.value.trim(),
								s = n.index.search('*' + i + '*');
							0 === s.length && (s = n.index.search('*' + i + '~1*'));
							for (var o = 0, a = Math.min(10, s.length); o < a; o++) {
								var u = n.data.rows[Number(s[o].ref)],
									c = m(u.name, i);
								u.parent && (c = '<span class="parent">' + m(u.parent, i) + '.</span>' + c);
								var l = document.createElement('li');
								l.classList.value = u.classes;
								var d = document.createElement('a');
								(d.href = n.base + u.url),
									d.classList.add('tsd-kind-icon'),
									(d.innerHTML = c),
									l.append(d),
									t.appendChild(l);
							}
						})(e, t, r, n);
					});
					var i = !1;
					r.addEventListener('keydown', function (e) {
						(i = !0),
							'Enter' == e.key
								? (function (e, t) {
										var r = e.querySelector('.current');
										r || (r = e.querySelector('li:first-child'));
										if (r) {
											var n = r.querySelector('a');
											n && (window.location.href = n.href), t.blur();
										}
								  })(t, r)
								: 'Escape' == e.key
								? r.blur()
								: 'ArrowUp' == e.key
								? y(t, -1)
								: 'ArrowDown' === e.key
								? y(t, 1)
								: (i = !1);
					}),
						r.addEventListener('keypress', function (e) {
							i && e.preventDefault();
						}),
						document.body.addEventListener('keydown', function (e) {
							e.altKey ||
								e.ctrlKey ||
								e.metaKey ||
								r.matches(':focus') ||
								'/' !== e.key ||
								(r.focus(), e.preventDefault());
						});
				})(e, n, r, i);
			}
		})(),
			i(f, '.menu-highlight'),
			i(L, '.tsd-signatures'),
			i(I, 'a[data-toggle]'),
			D.isSupported() ? i(D, '#tsd-filter') : document.documentElement.classList.add('no-filter');
		var N = new o();
		Object.defineProperty(window, 'app', { value: N });
	}
]);

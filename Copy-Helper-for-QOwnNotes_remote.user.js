// ==UserScript==
// @name            Copy Helper for QOwnNotes
// @description     Helper to convert selected HTML to markdown for next using in QOwnNotes.
// @version         2.1
// @author          vanleo2001
// @license         GPL
// @include         *
// @grant           GM_setClipboard
// @require         https://raw.githubusercontent.com/vanleo2001/Copy-Helper-for-QOwnNotes-script/master/dist/to-markdown.js
// ==/UserScript==


// *** convert
if (!("contextMenu" in document.documentElement &&
		"HTMLMenuItemElement" in window))
	return;

var body = document.body;
body.addEventListener("contextmenu", initMenu, false);

var menu = body.appendChild(document.createElement("menu"));
menu.outerHTML = '<menu id="userscript-html-to-markdown" type="context">\
	<menuitem label="Copy Helper for QOwnNotes"></menuitem>\
	</menu>';

document.querySelector("#userscript-html-to-markdown menuitem")
.addEventListener("click", convertHTML, false);

function initMenu(aEvent) {
	// Executed when user right click on web page body
	var node = aEvent.target;
	var item = document.querySelector("#userscript-html-to-markdown menuitem");
	body.setAttribute("contextmenu", "userscript-html-to-markdown");
}

function addParamsToForm(aForm, aKey, aValue) {
	var hiddenField = document.createElement("input");
	hiddenField.setAttribute("type", "hidden");
	hiddenField.setAttribute("name", aKey);
	hiddenField.setAttribute("value", aValue);
	aForm.appendChild(hiddenField);
}

// **** convert from https://github.com/aqxa/atom-to-markdown v3.1.0 released on 5 July, 2017 ****

// *** language-guesswork.coffee -> js ***
function languageGuesswork(code) {
	var htmlBlocks,
	htmlVoids;
	if ((code.indexOf('$')) === 0) {
		return 'bash';
	}
	if ((code.indexOf('System.out.print')) !== -1) {
		return 'java';
	}
	if ((code.indexOf('public')) !== -1) {
		return 'java';
	}
	if ((code.indexOf('private')) !== -1) {
		return 'java';
	}
	if ((code.indexOf('protected')) !== -1) {
		return 'java';
	}
	htmlBlocks = ['address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas', 'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav', 'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'];
	htmlVoids = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
	htmlBlocks.some(function (name) {
		return (code.indexOf("<" + name + ">")) !== -1;
	});
	htmlVoids.some(function (name) {
		return (code.indexOf("<" + name)) !== -1;
	});
	if ((code.indexOf('var')) !== -1) {
		return 'js';
	}
	if ((code.indexOf('function')) !== -1) {
		return 'js';
	}
	if ((code.indexOf('let')) !== -1) {
		return 'js';
	}
	return '';
}

// *** markdownfiy.coffee -> js ***
function keepWhitespace(node, mark, content) {
	var nextNode,
	nextNodeText,
	prefix,
	prevNode,
	prevNodeText,
	suffix;
	prevNode = node.previousSibling;
	nextNode = node.nextSibling;
	prevNodeText = prevNode != null ? prevNode.textContent : void 0;
	nextNodeText = nextNode != null ? nextNode.textContent : void 0;
	prefix = prevNode && (!toMarkdown.isBlock(prevNode)) && ((prevNodeText != null ? prevNodeText.charAt(prevNodeText.length - 1) : void 0) !== ' ') ? " " + mark : mark;
	suffix = nextNode && (!toMarkdown.isBlock(nextNode)) && ((nextNodeText != null ? nextNodeText.charAt(nextNodeText.length - 1) : void 0) !== ' ') ? mark + " " : mark;
	return prefix + content + suffix;
}

function guessLanguage(content, node) {
	var language;
	// get via 'data-code-language'
	language = node.getAttribute('data-code-language');
	if (language) {
		return language;
	}

	// get via 'class (highlight-source-<language>/language-<language>/prettyprint)'
	Array.prototype.some.call(node.classList, function (className) {
		var match,
		ref;
		match = className.match(/highlight-source-(\w+)/);
		if (match === null) {
			match = className.match(/language-(\w+)/);
		}
		if (match === null && className === 'prettyprint' && ((ref = node.children[0]) != null ? ref.tagName : void 0) === 'CODE') {
			match = [void 0, node.children[0].getAttribute('data-lang')];
		}
		if (!match) {
			return false;
		}
		language = match[1];
		return true;
	});
	if (language) {
		return language;
	}
	return languageGuesswork(content);
};

function closest(el, parentNodeName) {
	var parent;
	parentNodeName = parentNodeName.toUpperCase();
	while (el !== null) {
		parent = el.parentNode;
		if (parent !== null && parent.nodeName === parentNodeName) {
			return parent;
		}
		el = parent;
	}
	return null;
}

function getAbsoluteUrl(url) {
	var a = document.createElement('A');
	a.href = url;
	url = a.href;
	return url;
}

options = {
	gfm: true,

	converters: [{
			// *** <img>.src, <a>.href : convert relative path to absolute path, otherwise QOwnNotes will not recognize it ***
			// preserve 'img', so QOwnNotes can download the images and store into local 'media' folder
			filter: 'img',
			replacement: function (content, node) {
				var src = node.getAttribute('src');
				node.setAttribute('src', getAbsoluteUrl(src));
				return this.outer(node, content);
			}
		}, {
			// <a>.href: convert relative path to absolute 
			filter: function (node) {
				return node.nodeName === 'A' && node.getAttribute('href')
			},
			replacement: function (content, node) {
				var src = node.getAttribute('href');
				node.setAttribute('href', getAbsoluteUrl(src));
				var titlePart = node.title ? ' "' + node.title + '"' : ''
					return '[' + content + '](' + node.getAttribute('href') + titlePart + ')'
			}
		}, {
			// 'pre' as code block
			filter: 'pre',
			replacement: function (content, node) {
				var language;
				language = guessLanguage(content, node);
				return "\n\n```" + language + "\n" + content + "\n```\n\n";
			}
		}, {
			// preserve <span>/<section>/<div>/<cite>/<time>/<header>/<footer>/<figure>/<figcaption>/<small>/<dl>/<dd>
			filter: ['span', 'section', 'div', 'cite', 'time', 'header', 'footer', 'figure', 'figcaption', 'small', 'dl', 'dd'],
			replacement: function (content, node) {
				if (this.isBlock(node)) {
					return "\n\n" + content + "\n\n";
				} else {
					return content;
				}
			}
		}, {
			// child Element of <code> is <a>
			filter: function (node) {
				var ref;
				return node.tagName === 'CODE' && node.children && ((ref = node.children[0]) != null ? ref.tagName : void 0) === 'A';
			},
			replacement: function (content) {
				return content;
			}
		}, {
			// hyperlink with no href as plain text
			filter: 'a',
			replacement: function (content, node) {
				var href,
				ref,
				titlePart;
				if (((ref = node.parentNode) != null ? ref.tagName : void 0) === 'CODE') {
					content = "`" + content + "`";
				}
				href = node.getAttribute('href');
				if (!href) {
					return content;
				}
				titlePart = node.title ? " \"" + content + "\"" : '';
				return "[" + content + "](" + href + titlePart + ")";
			}
		}, {
			// preserve <code> in <pre> node
			filter: function (node) {
				if (node.tagName !== 'CODE') {
					return false;
				}
				return (closest(node, 'PRE')) !== null;
			},
			replacement: function (content) {
				return content;
			}
		}, {
			// remove element <a> with no textContext
			filter: function (node) {
				if (node.nodeName !== 'A') {
					return false;
				}
				if (!node.textContent) {
					return true;
				}
			},
			replacement: function () {
				return '';
			}
		}, {
			// keep one blankspace before list
			filter: 'li',
			replacement: function (content, node) {
				var child,
				i,
				index,
				len,
				parent,
				prefix,
				ref;
				ref = node.children;
				for (i = 0, len = ref.length; i < len; i++) {
					child = ref[i];
					if (child.tagName.match(/H[1-6]/)) {
						return content;
					}
				}
				content = content.replace(/^\s+/, '').replace(/\n/gm, '\n  ');
				prefix = '* ';
				parent = node.parentNode;
				index = Array.prototype.indexOf.call(parent.children, node) + 1;
				prefix = /ol/i.test(parent.nodeName) ? index + '. ' : '* ';
				return prefix + content;
			}
		}, {
			// <hr> as ---
			filter: 'hr',
			replacement: function () {
				return '\n\n---\n\n';
			}
		}, {
			// <em>/<i> as _
			filter: ['em', 'i'],
			replacement: function (content, node) {
				return keepWhitespace(node, '_', content);
			}
		}, {
			// <strong>/<b> as **
			filter: ['strong', 'b'],
			replacement: function (content, node) {
				return keepWhitespace(node, '**', content);
			}
		}, {
			// <dt> as **
			filter: 'dt',
			replacement: function (content, node) {
				return '\n\n**' + content + '**\n\n';
			}
		}
	]
}

function markdownfiy(html) {
	return toMarkdown(html, options);
}

// **** end *****

function convertHTML(aEvent) {
	var range = window.getSelection().getRangeAt(0);
	fragment = range.cloneContents();
	span = document.createElement('SPAN');
	span.appendChild(fragment);
	content = span.innerHTML;
	var md = markdownfiy(content);
	GM_setClipboard(md + '\n\nFrom: ' + document.URL, 'html');
}

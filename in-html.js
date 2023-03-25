
/*
TODO Escape
  https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references
	&	=> &amp;
  <	=> &lt;
  > => &gt;
  " =>  &quot;
*/

/**
 * tagged template litteral tag`text` => 'text'
 * @param {Array} strings
 * @returns {string}
 */
export function tag(strings) {
	let t = strings[0]
	for (let i=1; i<arguments.length; ++i) t += arguments[i] + strings[i]
	return t
}

/**
 * querySelector $`sel` | $(`sel`) | $(`sel`, parent)
 * @param {string|Array} selector
 * @param {Node} element
 * @returns {Element}
 */
export function $(selector, parent=document) {
	return parent.querySelector( Array.isArray(selector) ? tag.apply(null, arguments) : selector)
}

/**
 * querySelectorAll $$`sel` | $$(`sel`) | $$(`sel`, parent)
 * @param {string|Array} selector
 * @param {Node} parent
 * @returns {Array<Element>}
 */
export function $$(selector, parent=document) {
	return parent.querySelectorAll(Array.isArray(selector) ? tag.apply(null, arguments) : selector)
}

/**
 * html`text` | html(`text`)
 * @param {string|Array} txt
 * @returns {DocumentFragment}
 */
export function html(txt) {
	return document.createRange().createContextualFragment(
		Array.isArray(txt) ? tag.apply(null, arguments) : txt
	)
}

/**
 * load(`./text.html`)
 * @param {string} txt
 * @returns {Promise<DocumentFragment>}
 */
export function load(path) {
	return fetch(path).then( res => res.text().then( txt => html( txt ) ) )
}

function getNode(selection) {
	const node = selection.nodeName ? selection : selection[0] === '<' ? html(selection) : $(selection)
	return node.content || node
}

function $ids(el) {
	const ids = Object.create(null)
	if (el.id) (ids[el.id] = el).removeAttribute('id')
	for (const kid of el.querySelectorAll('[id]')) (ids[kid.id] = kid).removeAttribute('id')
	return ids
}

/**
 *
 * @param {string|Element|DocumentFragment} template
 * @param {Function} decorator
 * @returns {Function}
 */
export function cast(template, decorator) {
	const model = getNode(template)

	return function(v,k) {
		const el = model.cloneNode(true),
					res = decorator.call(this, $ids(el), v, k)
		return res?.nodeType ? res : el
	}
}

/**
 *
 * @param {string|Element|DocumentFragment} parent
 * @param {Function} factory
 * @param {Object} param2
 * @returns {Element|DocumentFragment}
 */
export function list(parent, factory, { getKey, after=null, before=null }={} ) {
	const kin = getNode(parent)

	let last = Object.create(null),
			updater = kin.update

	kin.update = !updater ? updateList
		: function(...args) { updateList.call(this, ...args); updater.call(this, ...args) }

	function updateList(arr) {
		const kids = Object.create(null)
		let spot = after ? after.nextSibling : kin.firstChild
		if (!arr.length && !before && !after) kin.textContent = ''
		else {
			for (let i = 0; i < arr.length; ++i) {
				const key = getKey?.(arr[i], i, arr) || i
				let kid = last[key]
				//create or update kid
				if (kid) kid.update && kid.update(arr[i], key, arr)
				else kid = factory(arr[i], i, arr)
				kids[key] = kid

				//place kid
				if (!spot) kin.appendChild(kid)
				else if (kid === spot.nextSibling) kin.removeChild(spot)
				else if (kid !== spot) kin.insertBefore(kid, spot)
				spot = kid.nextSibling
			}
			//delete remaining
			while (spot !== before) {
				const next = spot.nextSibling
				kin.removeChild(spot)
				spot = next
			}
		}
		last = kids
		return this
	}
	return kin
}

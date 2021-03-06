/*
TODO
	tests
TODO
  https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references
	&	=> &amp;
  <	=> &lt;
  > => &gt;
  " =>  &quot;
*/

const D = document,
			ID = 'id'

export const TW = D.createTreeWalker(D, 1)
export const $ = (sel, elm) => (elm || D).querySelector(sel)
export const $$ = (sel, elm) => (elm || D).querySelectorAll(sel)

export function $ids(el) {
	let spot = TW.currentNode = el
	const next = el.nextSibling?.() || null,
				ids = Object.create(null)
	while ( (spot = TW.nextNode()) !== next)
		if (spot.hasAttribute(ID))
			(ids[spot.getAttribute(ID)] = spot).removeAttribute(ID)
	return ids
}

export function cast(template, decorator) {
	template = template.nodeName ? template : template[0] === '<' ? html(template) : $(template)
	if (template.nodeName === 'TEMPLATE') template = template.content

	return function(v,k) {
		const el = template.cloneNode(true)
		const res = decorator.call(this, $ids(el), v, k)
		return res?.nodeType ? res : el
	}
}

export function html(base, ...args) {
	const T = D.createElement('template')
	T.innerHTML = typeof base === 'string' ? base : String.raw(base, ...args)
	return T.content
}

export function list(parent, factory, { getKey, after=null, before=null }={} ) {
	if (!parent.nodeType) parent = $(parent)

	let last = Object.create(null),
			updater = parent.update

	parent.update = !updater ? updateList
		: function(...args) { updateList.call(this, ...args); updater.call(this, ...args) }

	function updateList(arr) {
		const kids = Object.create(null)
		let spot = after ? after.nextSibling : parent.firstChild
		if (!arr.length && !before && !after) parent.textContent = ''
		else {
			for (let i = 0; i < arr.length; ++i) {
				const key = getKey?.(arr[i], i, arr) || i
				let kid = last[key]
				//create or update kid
				if (kid) kid.update && kid.update(arr[i], key, arr)
				else kid = factory(arr[i], i, arr)
				kids[key] = kid

				//place kid
				if (!spot) parent.appendChild(kid)
				else if (kid === spot.nextSibling) parent.removeChild(spot)
				else if (kid !== spot) parent.insertBefore(kid, spot)
				spot = kid.nextSibling
			}
			//delete remaining
			while (spot !== before) {
				const next = spot.nextSibling
				parent.removeChild(spot)
				spot = next
			}
		}
		last = kids
		return this
	}

	return parent
}

//TODO not tested or documented
const DELEGATES = {}
export function delegate(eventType) {
	if (!DELEGATES[eventType]) {
		DELEGATES[eventType] = 'on' + eventType[0].toUpperCase() + eventType.slice(1)
		D.addEventListener(eventType, listener)
	}
}
function listener(event) {
	let tgt = event.target,
			evt = DELEGATES[event.type]
	do if (tgt[evt]) return tgt[evt](e)
	while(tgt = tgt.parentNode)
}

//TODO not tested or documented
const ISMOD = /^[\s]*import[\s'"`*{;]/
export function frame(func, init='', attributes=ISMOD.test(init) ? 'type=module' : '') {
	const frm = D.createElement('iframe')
	frm.hidden = true
	frm.sandbox = 'allow-scripts allow-same-origin'
	frm.srcdoc = `<script ${ attributes }>${''+init}; window.framedFunction=${''+func}<\/script>` //escape closing tag for html inserts
	const framed = new Promise( (p, f) => {
		frm.onload = () => p(frm.contentWindow.framedFunction.bind(frm.contentWindow))
		frm.onerror = f
	})
	D.body.appendChild(frm)

	return {
		run: async (...args) => (await framed)(...args),
		end: () => void frm.remove()
	}
}

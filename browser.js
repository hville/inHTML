/*
TODO
	documentation
TODO
  https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references
	&	=> &amp;
  <	=> &lt;
  > => &gt;
  " =>  &quot;
*/

const D = document

export function tag(strings) {
	let t = strings[0]
	for (let i=1; i<arguments.length; ++i) t += arguments[i] + strings[i]
	return t
}

export function $(sel, elm) {
	return Array.isArray(sel) ? D.querySelector(tag.apply(null, arguments)) : (elm || D).querySelector(sel)
}

export function $$(sel, elm) {
	return Array.isArray(sel) ? D.querySelectorAll(tag.apply(null, arguments)) : (elm || D).querySelectorAll(sel)
}

export function html(txt) {
	const T = D.createElement('template')
	T.innerHTML = Array.isArray(txt) ? tag.apply(null, arguments) : txt
	return T.content
}

function getNode(selection) {
	const node = selection.nodeName ? selection : selection[0] === '<' ? html(selection) : $(selection)
	return node.content || node
}

export function $ids(el) {
	const ids = Object.create(null)
	if (el.id) (ids[el.id] = el).removeAttribute('id')
	for (const kid of el.querySelectorAll('[id]')) (ids[kid.id] = kid).removeAttribute('id')
	return ids
}

export function cast(template, decorator) {
	const model = getNode(template)

	return function(v,k) {
		const el = model.cloneNode(true),
					res = decorator.call(this, $ids(el), v, k)
		return res?.nodeType ? res : el
	}
}

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

//EVENT DELEGATION
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

//TODO not documented
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

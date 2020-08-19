function inHTML(cb) {
	const code = document.currentScript,
				last = code.previousElementSibling,
				tmps = {}
	for (let tmpl of last.getElementsByTagName('template')) {
		for (let item of tmpl.content.children)
			if (item.id) (tmps[item.id] = item).removeAttribute('id')
		tmpl.remove()
	}
	code.remove()
	return cb(last, tmps)
}

(function() {
	const TW = document.createTreeWalker(document, 1),
				EVENTS = {}
	inHTML.data = {}
	inHTML.refs = {}
	//inHTML.update = null
	inHTML.clone = function(kin) {
		const cln = kin.cloneNode(true)
		cln.refs = {}
		TW.currentNode = cln
		let kid
		while((kid = TW.nextNode())) if(kid.id) (cln.refs[kid.id] = kid).removeAttribute('id')
		return cln
	}
	inHTML.delegate = function(event) {
		if (!EVENTS[event]) {
			const prop = 'on' + event[0].toUpperCase() + event.slice(1)
			document.addEventListener(event, function(e) {
				let tgt = e.target
				do if (tgt[prop]) return tgt[prop](e)
				while((tgt = tgt.parentNode))
			})
			EVENTS[event] = true
		}
	}
	inHTML.list = function(parent, getKey, factory, after=null, before=null) {
		return {parent, getKey, factory, after, before,
			map: Object.create(null),
			update: function(arr) {
				const	kin = this.parent,
							kids = Object.create(null)
				let spot = this.after ? this.after.nextSibling : kin.firstChild
				if (!arr.length && !this.before && !this.after) kin.textContent = ''
				else {
					for (let i = 0; i < arr.length; ++i) {
						const key = this.getKey(arr[i], i, arr)
						let kid = this.map[key]
						//create or update kid
						if (kid) kid.update && kid.update(arr[i], key, arr)
						else kid = this.factory(arr[i], i, arr)
						kids[key] = kid

						//place kid
						if (!spot) kin.appendChild(kid)
						else if (kid === spot.nextSibling) kin.removeChild(spot)
						else if (kid !== spot) kin.insertBefore(kid, spot)
						spot = kid.nextSibling
					}
					//delete remaining
					while (spot !== this.before) {
						const next = spot.nextSibling
						kin.removeChild(spot)
						spot = next
					}
				}
				this.map = kids
				return this
			}
		}
	}
}())

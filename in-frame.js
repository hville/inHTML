const ISMOD = /^[\s]*import[\s'"`*{;]/
export function frame(code, init='', attributes=ISMOD.test(init) ? 'type=module' : '') {

	// create the iframe - note: no attempts to escape user input
	const iframeEl = document.createElement('iframe')
	iframeEl.style.display = 'none' //takes no space vs iframeEl.hidden = true
	iframeEl.sandbox = 'allow-scripts allow-same-origin'
	iframeEl.srcdoc =`<script ${
		attributes
	// complicate access to the parent window:
	}>Object.defineProperties(window,{parent:{value:window},frameElement:{value:null}});${
		init
	};dispatchEvent(new CustomEvent('resolve',{detail:(${
		code
	}).bind(this)}))<\/script>`

	// get the evaluated code
	const framed = Promise.all([
		new Promise( (p,f) => {
			iframeEl.onload = p
			iframeEl.onerror = f
		} ),
		new Promise( (p,f)=>{
			document.body.appendChild(iframeEl).contentWindow.addEventListener('resolve', e => {
				if (typeof e.detail === 'function') p(e.detail)
				else f(new Error('not a function'))
			}, {once:true, passive:true})
		})
	])
	framed.finally( () => iframeEl.remove() )
	return framed.then( all => { iframeEl.remove(); return all[1]	} )
}

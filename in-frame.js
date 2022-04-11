const ISMOD = /^[\s]*import[\s'"`*{;]/
/**
 * create a function that runs in an iframe
 * @param {string} code for the iframe exported function
 * @param {string} [init] initiation code in the iframe
 * @param {string} [attributes] iframe script tag attributes
 * @returns {Promise}
 */
export function frame(code, init='', attributes=ISMOD.test(init) ? 'type=module' : '') {
	const uid = '_'+Math.floor(Math.random()*28e11).toString(36)

	// create the iframe - note: no attempts to escape user input
	const iframeEl = document.createElement('iframe')
	iframeEl.style.display = 'none'
	iframeEl.sandbox = 'allow-scripts allow-same-origin'
	iframeEl.srcdoc =`<script ${ attributes
	// complicate access to the parent window:
	}>Object.defineProperties(window,{parent:{value:window},frameElement:{value:null}});${ init
	};window.${ uid }=(${ code }).bind(window)<\/script>`

	// get the evaluated code
	const framed = new Promise( (p,f) => {
		iframeEl.onerror = f
		iframeEl.onload = () => {
			const fcn = iframeEl.contentWindow[uid]
			if (typeof fcn === 'function') p(fcn)
			else f(new Error('not a function'))
		}
		document.body.appendChild(iframeEl)
	})
	framed.finally( () => iframeEl.remove() )
	return framed
}

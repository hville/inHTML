const ISMOD = /^[\s]*import[\s'"`*{;]/
/**
 * create a function that runs in an iframe
 * @param {string} code for the iframe exported function
 * @param {string} [init] initiation code in the iframe
 * @param {string} [attributes] iframe script tag attributes
 * @returns {Promise<function>}
 */
export function frame(code, init='', attributes=ISMOD.test(init) ? 'type=module' : '') {
	const uid = '$'+Math.floor(Math.random()*(2**(5*6))).toString(32).padStart(6,0),
				iframeEl = document.createElement('iframe'),
				{port1, port2} = new MessageChannel()

	// create the iframe - note: no attempts to escape user input
	iframeEl.style.display = 'none'
	iframeEl.sandbox = 'allow-scripts'
	iframeEl.srcdoc = `<script ${ attributes}>${init}; onmessage = ({ports:[port2]}) => {
	port2.onmessage = evt => {
		port2.postMessage(window.${ uid }(...evt.data))
	}
};
window.${ uid }=${ code };
<\/script>`
	return new Promise( (pass,fail) => {
		iframeEl.onerror = e => {
			fail(e)
			iframeEl.remove()
		}
		iframeEl.onload = () => {
			let ret, err
			iframeEl.contentWindow.postMessage('', '*', [port2])
			port1.onmessage = evt => ret(evt.data)
			port1.onerror = evt => err(evt)
			function framedFunction(...args) {
				return new Promise( (p,f) => {
					ret = p
					err = f
					port1.postMessage(args)
				} )
			}
			framedFunction.remove = iframeEl.remove.bind(iframeEl)
			pass(framedFunction)
		}
		document.body.appendChild(iframeEl)
	})
}

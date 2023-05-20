const ISMOD = /^[\s]*import[\s'"`*{;]/
/**
 * create a function that runs in an iframe
 * frame( init, a => {data:a, transfer:[a.buffer]})({data:b, transfer:[b.buffer]}).then( r => console.log(r) )
 * frame( init, a => a)(b).then( r => console.log(r) )
 *
 * @param {string|Function} lambda for the iframe exported function
 * @param {{context:string, scriptAttributes:string, transfer1:string|Function, transfer2:string|Function}} options
 * @returns { * => Promise<*> }
 */
export function frame(lambda,	{context='', transfer1, transfer2, scriptAttributes = ISMOD.test(context) ? 'type=module' : ''}={}) {
	const uid = '$'+Math.floor(Math.random()*(2**(5*6))).toString(32).padStart(6,0),
				iframeEl = document.createElement('iframe'),
				{port1, port2} = new MessageChannel()

	// create the iframe - note: no attempts to escape user input
	iframeEl.style.display = 'none'
	iframeEl.sandbox = 'allow-scripts'
	iframeEl.srcdoc = `<script ${ scriptAttributes }>${ context
		}; const ${ uid }={ f:${ lambda.toString() }, t:${ transfer2?.toString()
		} }; onmessage = ({ports:[port2]}) => { port2.onmessage = async evt => { const result = await ${ uid
		}.f(...evt.data); port2.postMessage( result${ transfer2 ? `, ${ uid }.t(result)` : ''
		} ) } }<\/script>`

	const framed = new Promise( (p,f) => {
		iframeEl.onload = p
		iframeEl.onerror = f
	}).then( () => {
		iframeEl.contentWindow.postMessage('', '*', [port2])
	})

	async function framedFunction(...args) {
		await framed
		return  new Promise( (p,f) => {
			port1.onmessage = evt => p(evt.data)
			port1.onerror = f
			port1.postMessage(args, transfer1?.(...args) || [])
		} )
	}
	framedFunction.remove = iframeEl.remove.bind(iframeEl)
	document.body.appendChild(iframeEl)
	return framedFunction
}

/**
 * Event Delegation
 * listens to 'onEvent' insteat of 'onevent'
 * TODO: test & document
 */
const onAlias = {} // event:onEvent
export function delegate(eventType) {
	if (!onAlias[eventType]) { // only once per type, D.event = 'onEvent'
		onAlias[eventType] = 'on' + eventType[0].toUpperCase() + eventType.slice(1)
		document.addEventListener(eventType, listener)
	}
}
function listener(event) {
	let tgt = event.target,
			onE = onAlias[event.type]
	do if (tgt[onE]) return tgt[onE](e)
	while(tgt = tgt.parentNode)
}

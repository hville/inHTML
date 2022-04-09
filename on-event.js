/**
 * EVENT DELEGATION
 * TODO not tested or documented
 * event('type') --> listens to 'type' --> target.onType(e) --> target.parentNode.onType(e)
 */
const DELEGATES = {}
export function delegate(eventType) {
	if (!DELEGATES[eventType]) {
		DELEGATES[eventType] = 'on' + eventType[0].toUpperCase() + eventType.slice(1)
		document.addEventListener(eventType, listener)
	}
}
function listener(event) {
	let tgt = event.target,
			evt = DELEGATES[event.type]
	do if (tgt[evt]) return tgt[evt](e)
	while(tgt = tgt.parentNode)
}

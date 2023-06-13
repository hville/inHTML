/**
 * @param {string} code
 * @param {{type:string, crecentials:string}} options
 * @returns { Worker }
 */
export function worker(code,	options={type:'module'}) {
	return new Worker(
		URL.createObjectURL(
			new Blob([code], {type: 'text/javascript'})
		),
		options
	)
}

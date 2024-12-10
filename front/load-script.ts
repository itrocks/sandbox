
export default (fileName: string, onLoad?: (link: HTMLScriptElement) => void) =>
{
	const exists = document.head.querySelector<HTMLScriptElement>('script[src="' + fileName + '"]')
	if (exists) return onLoad?.(exists)

	const script  = document.createElement('script')
	script.src    = fileName
	if (onLoad) {
		script.addEventListener('load', function() { onLoad(this) })
	}
	document.head.appendChild(script)
}


export default (fileName: string, onLoad?: (link: HTMLScriptElement) => void) =>
{
	const exists = document.head.querySelector('script[src="' + fileName + '"]') as HTMLScriptElement
	if (exists) return onLoad?.(exists)

	const script  = document.createElement('script')
	script.src    = fileName
	if (onLoad) {
		script.addEventListener('load', function() { onLoad(this) })
	}
	document.head.appendChild(script)
}

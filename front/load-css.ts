
export default (fileName: string, onLoad?: (link: HTMLLinkElement) => void) =>
{
	const exists = document.head.querySelector('link[href="' + fileName + '"]') as HTMLLinkElement
	if (exists) return onLoad?.(exists)

	const link = document.createElement('link')
	link.setAttribute('href', fileName)
	link.setAttribute('rel', 'stylesheet')
	if (onLoad) {
		link.addEventListener('load', function() { onLoad(this) })
	}
	document.head.appendChild(link)
}

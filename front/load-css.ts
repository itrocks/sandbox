
const loaded = new Map<string, HTMLLinkElement>

export default function loadCss(fileName: string, onLoad?: (link: HTMLLinkElement) => void)
{
	const exists = loaded.get(fileName) ?? document.head.querySelector<HTMLLinkElement>('link[href="' + fileName + '"]')
	if (exists) return onLoad?.(exists)

	const link = document.createElement('link')
	link.setAttribute('href', fileName)
	link.setAttribute('rel', 'stylesheet')
	if (onLoad) {
		link.addEventListener('load', function() { onLoad(this) })
	}
	document.head.appendChild(link)
	loaded.set(fileName, link)
}

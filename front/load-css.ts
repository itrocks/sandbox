
export default (fileName: string) => new Promise<void>(resolve =>
{
	if (!fileName.endsWith('.css')) {
		fileName = fileName.substring(0, fileName.lastIndexOf('.')) + '.css'
	}
	if (!fileName.startsWith('http')) {
		fileName = (new URL(fileName)).href
	}
	const links = document.head.querySelectorAll(':scope > link[rel="stylesheet"]') as NodeListOf<HTMLLinkElement>
	let   link  = Array.from(links).filter(link => link.href === fileName)[0]
	if (!link) {
		const origin = new URL(fileName).origin
		if (origin === new URL(document.location.href).origin) {
			fileName = fileName.substring(origin.length)
		}
		link = document.createElement('link')
		link.setAttribute('href', fileName)
		link.setAttribute('rel', 'stylesheet')
		document.head.insertBefore(link, document.head.querySelectorAll(':scope > link:first-of-type')[0])
	}
	if (link.sheet) {
		resolve()
	}
	else {
		link.onload = () => resolve()
	}
})

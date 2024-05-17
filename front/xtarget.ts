import { formFetchOnSubmit } from './form-fetch.js'

export type XhrInfo = {
	screenHeight:  number,
	screenWidth:   number,
	targetHeight?: number,
	targetWidth?:  number,
	windowHeight:  number,
	windowWidth:   number
}

export type XTargetElement = HTMLAnchorElement | HTMLButtonElement | HTMLFormElement | HTMLInputElement

export function requestHeaders(headers: Headers, target?: HTMLElement)
{
	const info: XhrInfo = {
		screenHeight: screen.height,
		screenWidth:  screen.width,
		windowHeight: window.innerHeight,
		windowWidth:  window.innerWidth
	}
	if (target) {
		info.targetHeight = target.clientHeight
		info.targetWidth  = target.clientWidth
	}
	headers.set('XHR-Info', JSON.stringify(info))
	return headers
}

function responseTextFilter(responseText: string)
{
	const begin = responseText.indexOf('<!--BEGIN-->') + 12
	return (begin > 11) ? responseText.substring(begin, responseText.indexOf('<!--END-->', begin)) : responseText
}

function responseTextHead(responseText: string)
{
	const addHead     = document.createElement('head')
	const position    = responseText.indexOf('>', responseText.indexOf('<head') + 5) + 1
	addHead.innerHTML = responseText.substring(position, responseText.indexOf('</head>', position))

	const head = document.head
	for (const element of Array.from(addHead.children)) {
		if (
			(element instanceof HTMLLinkElement)
			&& (element.getAttribute('rel') === 'stylesheet')
			&& !head.querySelector('link[href="' + element.getAttribute('href') + '"]')
		) {
			head.append(element)
		}
		if (
			(element instanceof HTMLScriptElement)
			&& !head.querySelector('script[src="' + element.getAttribute('src') + '"]')
		) {
			const script = document.createElement('script')
			for (const attributeName of element.getAttributeNames()) {
				const attributeValue = element.getAttribute(attributeName)
				if (!attributeValue) continue
				script.setAttribute(attributeName, attributeValue)
			}
			head.append(script)
		}
	}
}

async function setResponse(response: Response, targetString: string)
{
	const target = targetString.startsWith('#')
		? document.getElementById(targetString.substring(1))
		: document.querySelector<HTMLElement>(targetString)
	if (!target) return undefined
	const text = await response.text()
	responseTextHead(text)
	target.innerHTML = responseTextFilter(text)
	return target
}

export function xTarget(element: XTargetElement)
{
	if (element instanceof HTMLAnchorElement) element.addEventListener('click', async function(event) {
		event.preventDefault()
		await setResponse(await fetch(this.href, { headers: requestHeaders(new Headers) }), this.target)
	})
	else formFetchOnSubmit(element, setResponse)
}
export default xTarget

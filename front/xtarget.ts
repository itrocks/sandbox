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

async function setResponse(response: Response, targetString: string)
{
	const target = targetString.startsWith('#')
		? document.getElementById(targetString.substring(1))
		: document.querySelector<HTMLElement>(targetString)
	if (!target) return undefined
	target.innerHTML = responseTextFilter(await response.text())
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

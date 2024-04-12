import { formFetchOnSubmit } from './form-fetch.js'

export type XhrInfo = {
	screenHeight:  number,
	screenWidth:   number,
	targetHeight?: number,
	targetWidth?:  number,
	windowHeight:  number,
	windowWidth:   number
}

export type XTargetElement = HTMLAnchorElement | HTMLFormElement

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

async function setResponse(response: Response, targetString: string)
{
	const target = targetString.startsWith('#')
		? document.getElementById(targetString.substring(1))
		: document.querySelector<HTMLElement>(targetString)
	if (!target) return undefined
	target.innerHTML = await response.text()
	return target
}

export function xTarget(element: XTargetElement)
{
	if (element instanceof HTMLAnchorElement) element.addEventListener('click', async function(event) {
		event.preventDefault()
		await setResponse(await fetch(this.href, { headers: requestHeaders(new Headers) }), this.target)
	})
	if (element instanceof HTMLFormElement) formFetchOnSubmit(element, setResponse)
}
export default xTarget

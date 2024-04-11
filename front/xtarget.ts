import formFetch from './form-fetch.js'

export type XhrSize = {
	screenHeight:  number,
	screenWidth:   number,
	targetHeight?: number,
	targetWidth?:  number,
	windowHeight:  number,
	windowWidth:   number
}

export type XTargetElement = HTMLAnchorElement | HTMLFormElement

export function requestHeaders(request: Headers, target?: HTMLElement)
{
	const size: XhrSize = {
		screenHeight: screen.height,
		screenWidth:  screen.width,
		windowHeight: window.innerHeight,
		windowWidth:  window.innerWidth
	}
	if (target) {
		size.targetHeight = target.clientHeight
		size.targetWidth  = target.clientWidth
	}
	request.set('XHR-Size', JSON.stringify(size))
	return request
}

async function setResponse(targetString: string, response: Response)
{
	const target = document.getElementById(targetString.substring(1))
	if (!target) return undefined
	target.innerHTML = await response.text()
	return target
}

export function xTarget(element: XTargetElement)
{
	if (!element.getAttribute('target')?.startsWith('#')) return
	if (element instanceof HTMLAnchorElement) element.addEventListener('click', async function(event) {
		event.preventDefault()
		await setResponse(this.target, await fetch(this.href, { headers: requestHeaders(new Headers) }))
	})
	if (element instanceof HTMLFormElement) element.addEventListener('submit', async function(event) {
		event.preventDefault()
		await setResponse(this.target, await formFetch(this, this.action, { headers: requestHeaders(new Headers) }))
	})
}
export default xTarget

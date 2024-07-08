import { formFetchOnSubmit }   from './form-fetch.js'
import { HasPlugins, Options } from './plugin.js'

let defaultOptions = {}

export default class XTarget extends HasPlugins<XTarget>
{

	constructor(public element: XTargetElement, options: Partial<Options<XTarget>> = defaultOptions)
	{
		super(options)
		this.constructPlugins()
		this.initPlugins()
		this.activate(element)
	}

	activate(element: XTargetElement)
	{
		(element instanceof HTMLAnchorElement)
			? this.activateAnchorElement(element)
			: this.activateFormElement(element)
	}

	activateAnchorElement(element: HTMLAnchorElement)
	{
		element.addEventListener('click', async event => {
			event.preventDefault()
			await this.call(element.href, element.target)
		})
	}

	activateFormElement(element: Exclude<XTargetElement, HTMLAnchorElement>)
	{
		formFetchOnSubmit(
			element,
			(response, targetString) => this.setResponse(response, this.targetElement(targetString)),
			this.requestInit()
		)
	}

	async call(action: string, target: string)
	{
		await this.setResponse(await fetch(action, this.requestInit()), this.targetElement(target))
	}

	requestInit(): RequestInit
	{
		return {}
	}

	setHTML(text: string, target: HTMLElement)
	{
		target.innerHTML = text
	}

	async setResponse(response: Response, target?: HTMLElement)
	{
		if (!target) return
		const text = await response.text()
		this.setHTML(text, target)
	}

	targetElement(targetString: string)
	{
		if (targetString === '') {
			return undefined
		}
		return targetString.startsWith('#')
			? (document.getElementById(targetString.substring(1)) ?? undefined)
			: (document.querySelector<HTMLElement>(targetString) ?? undefined)
	}

	targetString(element: XTargetElement)
	{
		return ((element instanceof HTMLAnchorElement) || (element instanceof HTMLFormElement))
			? element.target
			: (element.formTarget ?? element.form?.target)
	}

}
export { XTarget }

export async function xTargetCall(action: string, target: string, options: Partial<Options<XTarget>> = defaultOptions)
{
	const anchor = document.createElement('a')
	anchor.setAttribute('href',   action)
	anchor.setAttribute('target', target)
	const xTarget = new XTarget(anchor, options)
	await xTarget.call(action, target)
}

export function XTargetDefaultOptions(options: Partial<Options<XTarget>>)
{
	defaultOptions = options
}

export type XTargetElement = HTMLAnchorElement | HTMLButtonElement | HTMLFormElement | HTMLInputElement

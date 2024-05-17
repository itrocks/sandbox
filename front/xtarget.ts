import { formFetchOnSubmit }   from './form-fetch.js'
import { HasPlugins, Options } from './plugin.js'

export type XTargetElement = HTMLAnchorElement | HTMLButtonElement | HTMLFormElement | HTMLInputElement

export default class XTarget extends HasPlugins<XTarget>
{

	constructor(public element: XTargetElement, options: Partial<Options<XTarget>> = {})
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
			await this.setResponse(await fetch(element.href, this.requestInit()), this.targetElement(element.target))
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

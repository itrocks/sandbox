import Plugin  from './plugin.js'
import XTarget from './xtarget.js'

export default class XTargetHead extends Plugin<XTarget>
{

	constructor(xTarget: XTarget)
	{
		super(xTarget)

		const superSetHTML = xTarget.setHTML
		xTarget.setHTML    = function(text, target)
		{
			const addHead     = document.createElement('head')
			const position    = text.indexOf('>', text.indexOf('<head') + 5) + 1
			addHead.innerHTML = text.substring(position, text.indexOf('</head>', position))

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

			return superSetHTML.call(this, text, target)
		}
	}

}

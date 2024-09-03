import { formMethod } from './form-fetch.js'
import Plugin         from './plugin.js'
import XTarget        from './xtarget.js'

export default class XTargetHistory extends Plugin<XTarget>
{

	constructor(xTarget: XTarget)
	{
		super(xTarget)

		let postMethod = false

		const superActivateFormElement = xTarget.activateFormElement
		xTarget.activateFormElement    = function(element)
		{
			postMethod = formMethod(element.form ?? element).toLowerCase() === 'post'
			superActivateFormElement.call(this, element)
		}

		let response: Response

		const superSetHTML = xTarget.setHTML
		xTarget.setHTML    = function(text, target)
		{
			if (postMethod) return superSetHTML.call(this, text, target)

			const position = text.indexOf('>', text.indexOf('<title') + 6) + 1
			const title    = position ? text.substring(position, text.indexOf('</title>', position)) : document.title
			document.title = title
			window.history.pushState({ reload: true }, title, response.url)
			return superSetHTML.call(this, text, target)
		}

		const superSetResponse = xTarget.setResponse
		xTarget.setResponse    = function(responseCall, target)
		{
			response = responseCall
			return superSetResponse.call(this, responseCall, target)
		}
	}

}

window.addEventListener('popstate', event => {
	if (event.state && event.state.reload) {
		window.location.href = document.location.href
	}
})

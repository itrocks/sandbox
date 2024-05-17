import Plugin  from './plugin.js'
import XTarget from './xtarget.js'

export default class XTargetBeginEnd extends Plugin<XTarget>
{

	constructor(xTarget: XTarget)
	{
		super(xTarget)

		const superSetHTML = xTarget.setHTML
		xTarget.setHTML    = function(text, target)
		{
			const begin = text.indexOf('<!--BEGIN-->') + 12
			text = (begin > 11) ? text.substring(begin, text.indexOf('<!--END-->', begin)) : text
			return superSetHTML.call(this, text, target)
		}
	}

}

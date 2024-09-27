import Plugin  from './plugin.js'
import XTarget from './xtarget.js'

export type XhrInfo = {
	screenHeight:  number,
	screenWidth:   number,
	target?:       string,
	targetHeight?: number,
	targetWidth?:  number,
	windowHeight:  number,
	windowWidth:   number
}

export default class XTargetHeadersSize extends Plugin<XTarget>
{

	constructor(xTarget: XTarget)
	{
		super(xTarget)

		const superRequestInit = xTarget.requestInit

		xTarget.requestInit = function()
		{
			const requestInit = superRequestInit.call(this)
			if (!requestInit.headers) {
				requestInit.headers = new Headers
			}
			const headers = requestInit.headers as Headers
			const xhrInfo: XhrInfo = Object.assign(JSON.parse(headers.get('XHR-Info') ?? '{}'), {
				screenHeight: screen.height,
				screenWidth:  screen.width,
				windowHeight: window.innerHeight,
				windowWidth:  window.innerWidth
			})
			const targetString = this.targetString(this.element)
			const target       = this.targetElement(targetString)
			if (target) {
				xhrInfo.target       = targetString
				xhrInfo.targetHeight = target.clientHeight
				xhrInfo.targetWidth  = target.clientWidth
			}
			headers.set('XHR-Info', JSON.stringify(xhrInfo))
			return requestInit
		}
	}

}

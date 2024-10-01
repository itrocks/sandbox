import Plugin             from './plugin.js'
import XTarget            from './xtarget.js'
import { XTargetElement } from './xtarget.js'

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

		xTarget.requestInit = function(element: XTargetElement)
		{
			const requestInit = superRequestInit.call(this, element)
			if (!requestInit.headers) {
				requestInit.headers = new Headers
			}
			const headers          = requestInit.headers as Headers
			const targetSelector   = this.targetSelector(element)
			const xhrInfo: XhrInfo = Object.assign(JSON.parse(headers.get('XHR-Info') ?? '{}'), {
				screenHeight: screen.height,
				screenWidth:  screen.width,
				target:       targetSelector,
				windowHeight: window.innerHeight,
				windowWidth:  window.innerWidth
			})
			const target = this.targetElement(targetSelector)
			if (target) {
				xhrInfo.targetHeight = target.clientHeight
				xhrInfo.targetWidth  = target.clientWidth
			}
			headers.set('XHR-Info', JSON.stringify(xhrInfo))
			return requestInit
		}
	}

}

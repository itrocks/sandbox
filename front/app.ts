import build                       from './build.js'
import { Options }                 from './plugin.js'
import { XTarget, XTargetElement } from './xtarget.js'
import XTargetBeginEnd             from './xtarget-begin-end.js'
import XTargetHead                 from './xtarget-head.js'
import XTargetHeadersSize          from './xtarget-headers-size.js'

const options: Partial<Options<XTarget>> = {
	plugins: [
		XTargetBeginEnd,
		XTargetHead,
		XTargetHeadersSize
	]
}

build<XTargetElement>(
	'a[target=main], a[target^="#"],'
	+ ' button[type=submit][formtarget=main], button[type=submit][formtarget^="#"],'
	+ ' form[target=main], form[target^="#"],'
	+ ' input[type=submit][formtarget=main], input[type=submit][formtarget^="#"]',
	element => new XTarget(element, options)
)

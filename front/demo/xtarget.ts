import build              from '../build.js'
import { Options }        from '../plugin.js'
import XTarget            from '../xtarget.js'
import XTargetBeginEnd    from '../xtarget-begin-end.js'
import XTargetHead        from '../xtarget-head.js'
import XTargetHeadersSize from '../xtarget-headers-size.js'

const options: Partial<Options<XTarget>> = {
	plugins: [
		XTargetBeginEnd,
		XTargetHead,
		XTargetHeadersSize
	]
}

build<HTMLAnchorElement|HTMLFormElement>('a[target^="#"], form[target^="#"]', element => new XTarget(element, options))

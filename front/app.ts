import autoFocus                   from './auto-focus.js'
import autoRedirect                from './auto-redirect.js'
import build                       from './build.js'
import { XTarget, XTargetElement } from './xtarget.js'
import { XTargetDefaultOptions }   from './xtarget.js'
import XTargetBeginEnd             from './xtarget-begin-end.js'
import XTargetHead                 from './xtarget-head.js'
import XTargetHeadersSize          from './xtarget-headers-size.js'
import XTargetHistory              from './xtarget-history.js'

XTargetDefaultOptions({ plugins: [ XTargetBeginEnd, XTargetHead, XTargetHeadersSize, XTargetHistory ] })

build<HTMLAnchorElement>('a.auto-redirect', element => autoRedirect(element))

build<HTMLFormElement>('form', element => autoFocus(element))

build<XTargetElement>(
	'a[target="main"], a[target^="#"],'
	+ ' form[target="main"], form[target^="#"],'
	+ ' form button[type="submit"][formtarget="main"], form button[type="submit"][formtarget^="#"],'
	+ ' form input[type="submit"][formtarget="main"], form input[type="submit"][formtarget^="#"]',
	element => new XTarget(element)
)

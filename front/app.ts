import autoFocus                 from './auto-focus.js'
import build                     from './build.js'
import Notification              from './notifications.js'
import { Notifications }         from './notifications.js'
import XTarget                   from './xtarget.js'
import { XTargetDefaultOptions } from './xtarget.js'
import { XTargetElement }        from './xtarget.js'
import XTargetBeginEnd           from './xtarget-begin-end.js'
import XTargetHead               from './xtarget-head.js'
import XTargetHeadersSize        from './xtarget-headers-size.js'
import XTargetHistory            from './xtarget-history.js'

build<HTMLAnchorElement>('a.auto-redirect', async anchor => (await import('./auto-redirect.js')).default(anchor))

build<HTMLFormElement>('form', form => autoFocus(form))

XTargetDefaultOptions({ plugins: [ XTargetBeginEnd, XTargetHead, XTargetHeadersSize, XTargetHistory ] })
build<XTargetElement>(
	'a[target="main"], a[target^="#"],'
	+ ' form[target="main"], form[target^="#"],'
	+ ' form button[type="submit"][formtarget="main"], form button[type="submit"][formtarget^="#"],'
	+ ' form input[type="submit"][formtarget="main"], form input[type="submit"][formtarget^="#"]',
	element => new XTarget(element)
)

build<HTMLFormElement>('#modal form', async form => new (await import('./modal.js')).default(form))

build<HTMLElement>('#notification', element => new Notification(element))
build<HTMLOListElement>('ol#notifications', list => new Notifications(list))

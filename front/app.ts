import build                     from '../node_modules/@itrocks/build/build.js'
import buildXTarget              from '../node_modules/@itrocks/xtarget/build.js'
import XTargetBeginEnd           from '../node_modules/@itrocks/xtarget/begin-end.js'
import XTargetComposite          from '../node_modules/@itrocks/xtarget/composite.js'
import XTargetDefaultTarget      from '../node_modules/@itrocks/xtarget/default-target.js'
import XTargetHead               from '../node_modules/@itrocks/xtarget/head.js'
import XTargetHeadersSize        from '../node_modules/@itrocks/xtarget/headers-size.js'
import XTargetHistory            from '../node_modules/@itrocks/xtarget/history.js'
import XTargetMainTarget         from '../node_modules/@itrocks/xtarget/main-target.js'
import XTargetModifier           from '../node_modules/@itrocks/xtarget/modifier.js'
import { XTargetDefaultOptions } from '../node_modules/@itrocks/xtarget/xtarget.js'
import autoFocus                 from '../node_modules/@itrocks/auto-focus/auto-focus.js'
import                                '../node_modules/@itrocks/auto-redirect/build.js'
import breadcrumb                from '../node_modules/@itrocks/breadcrumb/breadcrumb.js'
import collapse                  from '../node_modules/@itrocks/collapse/collapse.js'
import containedAutoWidth        from '../node_modules/@itrocks/contained-auto-width/contained-auto-width.js'
import notification              from '../node_modules/@itrocks/notifications/notifications.js'
import { notifications }         from '../node_modules/@itrocks/notifications/notifications.js'
import                                '../node_modules/@itrocks/real-viewport-height/real-viewport-height.js'

let selector: string

selector = 'input[data-type=object], ul[data-type=objects] > li > input'
build<HTMLInputElement>(selector, async input =>
	(await import('../node_modules/@itrocks/autocompleter/autocompleter.js')).default(input)
)

build<HTMLHeadingElement>('main > * > h2, main > * > header > h2', breadcrumb)

build<HTMLButtonElement>('button.collapse', button => collapse(button, 'body'))

build<HTMLInputElement>('input[data-type=date]', async input =>
	(await import('../node_modules/@itrocks/air-datepicker/air-datepicker.js')).default(input)
)

build<HTMLFormElement>('form', autoFocus)

selector = '[data-contained-auto-width], [data-multiple-contained-auto-width] > li'
build<HTMLLIElement>(selector, async container => containedAutoWidth(container))

build<HTMLElement>('#notifications > li', notification)
build<HTMLOListElement>('#notifications', notifications)

XTargetDefaultOptions({ plugins: [
	XTargetBeginEnd, XTargetComposite, XTargetDefaultTarget, XTargetHead, XTargetHeadersSize, XTargetHistory,
	XTargetMainTarget, XTargetModifier
] })
buildXTarget()

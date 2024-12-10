import build                     from '../node_modules/@itrocks/build/build.js'
import buildXTarget              from '../node_modules/@itrocks/xtarget/build.js'
import XTargetBeginEnd           from '../node_modules/@itrocks/xtarget/begin-end.js'
import XTargetComposite          from '../node_modules/@itrocks/xtarget/composite.js'
import XTargetDefaultTarget      from '../node_modules/@itrocks/xtarget/default-target.js'
import XTargetHead               from '../node_modules/@itrocks/xtarget/head.js'
import XTargetHeadersSize        from '../node_modules/@itrocks/xtarget/headers-size.js'
import XTargetHistory            from '../node_modules/@itrocks/xtarget/history.js'
import XTargetModifier           from '../node_modules/@itrocks/xtarget/modifier.js'
import { XTargetDefaultOptions } from '../node_modules/@itrocks/xtarget/xtarget.js'
import autoFocus                 from './auto-focus.js'
import breadcrumb                from './breadcrumb.js'
import collapse                  from './collapse.js'
import containedAutoWidth        from './contained-auto-width.js'
import notification              from './notifications.js'
import { notifications }         from './notifications.js'
import                                './real-viewport-height.js'

let selector: string

build<HTMLAnchorElement>('a.auto-redirect', async anchor => (await import('./auto-redirect.js')).default(anchor))

selector = 'input[data-type=object], ul[data-type=objects] > li > input'
build<HTMLInputElement>(selector, async input => (await import('./autocompleter.js')).default(input))

build<HTMLHeadingElement>('main > * > h2, main > * > header > h2', breadcrumb)

build<HTMLButtonElement>('button.collapse', button => collapse(button, 'body'))

build<HTMLInputElement>('input[data-type=date]', async input => (await import('./air-datepicker.js')).default(input))

build<HTMLFormElement>('form', autoFocus)

selector = '[data-contained-auto-width], [data-multiple-contained-auto-width] > li'
build<HTMLLIElement>(selector, async container => containedAutoWidth(container))

build<HTMLFormElement>('#modal form', async form => (await import('./modal.js')).default(form))

build<HTMLElement>('#notifications > li', notification)
build<HTMLOListElement>('#notifications', notifications)

XTargetDefaultOptions({ plugins: [
	XTargetBeginEnd, XTargetComposite, XTargetDefaultTarget, XTargetHead, XTargetHeadersSize, XTargetHistory,
	XTargetModifier
] })
buildXTarget()

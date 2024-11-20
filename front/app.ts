import build                     from '../node_modules/@itrocks/build/build.js'
import buildXTarget              from '../node_modules/@itrocks/xtarget/build.js'
import XTargetBeginEnd           from '../node_modules/@itrocks/xtarget/begin-end.js'
import XTargetHead               from '../node_modules/@itrocks/xtarget/head.js'
import XTargetHeadersSize        from '../node_modules/@itrocks/xtarget/headers-size.js'
import XTargetHistory            from '../node_modules/@itrocks/xtarget/history.js'
import { XTargetDefaultOptions } from '../node_modules/@itrocks/xtarget/xtarget.js'
import autoFocus                 from './auto-focus.js'
import breadcrumb                from './breadcrumb.js'
import collapse                  from './collapse.js'
import notification              from './notifications.js'
import { notifications }         from './notifications.js'
import                                './real-viewport-height.js'

build<HTMLAnchorElement>('a.auto-redirect', async anchor => (await import('./auto-redirect.js')).default(anchor))

build<HTMLHeadingElement>('main > * > h2, main > * > header > h2', breadcrumb)

build<HTMLButtonElement>('button.collapse', button => collapse(button, 'body'))

build<HTMLInputElement>('input[data-type=date]', async input => (await import('./air-datepicker.js')).default(input))

build<HTMLFormElement>('form', autoFocus)

XTargetDefaultOptions({ plugins: [ XTargetBeginEnd, XTargetHead, XTargetHeadersSize, XTargetHistory ] })
buildXTarget()

build<HTMLFormElement>('#modal form', async form => (await import('./modal.js')).default(form))

build<HTMLElement>('#notification', notification)
build<HTMLOListElement>('ol#notifications', notifications)

build<HTMLInputElement>('input[data-type=object]', async input => (await import('./autocompleter.js')).default(input))

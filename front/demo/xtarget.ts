import build   from '../build.js'
import xTarget from '../xtarget.js'

build(
	'a[target^="#"], form[target^="#"]',
	(element: Element) => xTarget(element as HTMLAnchorElement | HTMLFormElement)
)

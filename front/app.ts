import build   from './build.js'
import xTarget from './xtarget.js'

build(
	'a[target=main], a[target^="#"],'
	+ ' button[type=submit][formtarget=main], button[type=submit][formtarget^="#"],'
	+ ' form[target=main], form[target^="#"],'
	+ ' input[type=submit][formtarget=main], input[type=submit][formtarget^="#"]',
	xTarget as (element: Element) => void
)

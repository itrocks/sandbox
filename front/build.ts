import { SortedArrayBy } from '../node_modules/@itrocks/sorted-array/esm/sorted-array.js'

export const ALWAYS = 'always'
export const CALL   = 'call'

class Callback
{

	constructor(
		public event:      keyof GlobalEventHandlersEventMap | typeof CALL,
		public selectors:  string[],
		public callback:   (...args: any[]) => any,
		public priority:   number,
		public parameters: any[]
	) {
	}

	applyInto(containerElement: Element)
	{
		for (const element of this.matchingElementsInto(containerElement)) {
			if (this.event === CALL) {
				this.callback(element, ...this.parameters)
			}
			else {
				element.addEventListener(this.event, this.callback)
			}
		}
	}

	matchingElementsInto(element: Element): Set<Element>
	{
		const elements = new Set<Element>
		for (const selector of this.selectors) {
			if ((selector[0] === ALWAYS[0]) && (selector === ALWAYS)) {
				elements.add(element)
				continue
			}
			if (element.matches(selector)) {
				elements.add(element)
			}
			element.querySelectorAll(selector).forEach(element => elements.add(element))
		}
		return elements
	}

}

const callbacks = new SortedArrayBy<Callback>('priority')

const chainedSelectors = (selector: string[]) =>
{
	const selectors = ['']
	for (const sourcePart of selector) {
		const addParts = sourcePart.split(',')
		const addPart  = addParts.pop()
		const length   = selectors.length
		for (const oldPart of selectors) {
			for (const addPart of addParts) {
				selectors.push(oldPart + ' ' + addPart)
			}
		}
		for (let index = 0; index < length; index ++) {
			selectors[index] += ' ' + addPart
		}
	}
	return selectors
}

const observer = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		mutation.addedNodes.forEach(addedNode => {
			if ((addedNode instanceof HTMLElement) && addedNode.closest('html')) {
				for (const callback of callbacks) {
					callback.applyInto(addedNode)
				}
			}
		})
	}
})

observer.observe(document.body, { childList: true, subtree: true })

type BuildElementCallback<E extends Element> = (element: E) => void
type BuildEventCallback                      = (event:   Event) => void
type BuildEventCall                          = typeof CALL
type BuildEventName                          = keyof GlobalEventHandlersEventMap

export type BuildEvent<E extends Element> = {
	callback:    BuildElementCallback<E> | BuildEventCallback,
	name?:       BuildEventCall | BuildEventName,
	parameters?: any[],
	priority?:   number,
	selector?:   string | string[]
}

export function build<E extends Element>(callback: BuildElementCallback<E>): void
export function build<E extends Element>(event: BuildEvent<E>): void
export function build<E extends Element>(selector: string | string[], callback: BuildElementCallback<E>): void
export function build<E extends Element>(selector: string | string[], event: BuildEventCall, callback: BuildElementCallback<E>): void
export function build(selector: string | string[], event: BuildEventName, callback: BuildEventCallback): void
export function build<E extends Element>(
	event:     BuildElementCallback<E> | BuildEvent<E> | string | string[],
	name?:     BuildElementCallback<E> | BuildEventCall | BuildEventName,
	callback?: BuildElementCallback<E> | BuildEventCallback
) {
	if (typeof event === 'function') {
		event = { callback: event }
	}
	else if ((typeof event === 'string') || Array.isArray(event)) {
		event = callback
			? { callback, name, selector: event } as BuildEvent<E>
			: { callback: name, selector: event } as BuildEvent<E>
	}
	if (!event.name)       event.name       = CALL
	if (!event.parameters) event.parameters = []
	if (!event.priority)   event.priority   = 1000
	if (!event.selector)   event.selector   = ALWAYS

	event.priority = (event.priority * 1000000) + callbacks.length
	event.selector = (typeof event.selector === 'string') ? [event.selector] : chainedSelectors(event.selector)

	const buildCallback = new Callback(event.name, event.selector, event.callback, event.priority ?? 0, event.parameters)
	buildCallback.applyInto(document.body)
	callbacks.push(buildCallback)
}
export default build

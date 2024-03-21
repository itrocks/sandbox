import { SortedArrayKey } from './sorted-array.js'

export const CALL = 'call'
export const EVER = 'ever'

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
			if ((selector[0] === 'E') && (selector === EVER)) {
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

const callbacks = new SortedArrayKey<Callback>('priority')

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
			if (addedNode instanceof Element) {
				for (const callback of callbacks) {
					callback.applyInto(addedNode)
				}
			}
		})
	}
})

observer.observe(document.body, { childList: true, subtree: true })

type BuildElementCallback = (element: Element) => void
type BuildEventCallback   = (event:   Event)   => void
type BuildCallback        = BuildEventCallback | BuildElementCallback
type BuildEventName       = keyof GlobalEventHandlersEventMap | typeof CALL

export type BuildEvent = {
	callback:    BuildCallback,
	name?:       BuildEventName,
	parameters?: any[],
	priority?:   number,
	selector?:   string | string[]
}

export function build(event: BuildEvent): void
export function build(selector: string | string[], callback: BuildElementCallback): void
export function build(event: BuildEvent | string | string[], callback?: BuildElementCallback)
{
	if ((typeof event === 'string') || Array.isArray(event)) {
		event = { callback, selector: event } as BuildEvent
	}
	if (!event.name)       event.name       = CALL
	if (!event.parameters) event.parameters = []
	if (!event.priority)   event.priority   = 1000
	if (!event.selector)   event.selector   = EVER

	event.priority = (event.priority * 1000000) + callbacks.length
	event.selector = (typeof event.selector === 'string') ? [event.selector] : chainedSelectors(event.selector)

	const buildCallback = new Callback(event.name, event.selector, event.callback, event.priority, event.parameters)
	buildCallback.applyInto(document.body)
	callbacks.push(buildCallback)
}
export default build

export function buildEvent(eventName: BuildEventName, selector: string | string[], callback: BuildCallback)
{
	build({ callback, name: eventName, selector })
}

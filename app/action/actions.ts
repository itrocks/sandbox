import { ObjectOrType }          from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/class'

const ACTIONS = Symbol('actions')

const DEFAULT = ['add', 'delete', 'edit', 'json', 'list', 'output', 'save', 'summary']

let defaultActions = DEFAULT

export default Actions
export function Actions(value: string[] = [])
{
	return decorate(ACTIONS, value)
}

export function actionsOf(target: ObjectOrType)
{
	return decoratorOf(target, ACTIONS, defaultActions)
}

export function setDefaultActions(actions: string[] = DEFAULT)
{
	defaultActions = actions
}

import { ObjectOrType }          from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/class'

const ACTIONS = Symbol('actions')

export default Actions
export function Actions(value: string[] = [])
{
	return decorate(ACTIONS, value)
}

export function actionsOf(target: ObjectOrType)
{
	return decoratorOf(target, ACTIONS, ['add', 'delete', 'edit', 'json', 'list', 'output', 'save'])
}

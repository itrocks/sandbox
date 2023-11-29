import 'reflect-metadata'
import Type from '../class/type'

function decorate(name: string, value: any)
{
	return (target: Type) => Reflect.defineMetadata(name, value, target.prototype)
}

function decorateCallback(name: string, callback: (target:Type)=>any)
{
	return (target: Type) => Reflect.defineMetadata(name, callback(target), target.prototype)
}

function decoratorOf<T>(target: object|Type, name: string, undefinedValue: T): T
{
	if (typeof target !== 'object') {
		target = new target
	}
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedValue : result
}

function decoratorOfCallback<T>(target: object|Type, name: string, undefinedValue: (target:object)=>T): T
{
	if (typeof target !== 'object') {
		target = new target
	}
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedValue(target) : result
}

export { decorate, decorateCallback, decoratorOf, decoratorOfCallback }

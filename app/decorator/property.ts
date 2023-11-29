import 'reflect-metadata'
import Type from '../class/type'

function decorate(name: string, value: any)
{
	return (target: object, property: string) => Reflect.defineMetadata(name, value, target, property)
}

function decorateCallback(name: string, callback: (target:Type,property:string)=>any)
{
	return (target: Type, property: string) => Reflect.defineMetadata(name, callback(target, property), target, property)
}

function decoratorOf<T>(target: object|Type, property: string, name: string, undefinedValue: T): T
{
	if (typeof target !== 'object') {
		target = new target
	}
	const result = Reflect.getMetadata(name, target, property)
	return (result === undefined) ? undefinedValue : result
}

export { decorate, decorateCallback, decoratorOf }

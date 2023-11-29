import Type from './type';

const propertyNames = (object: object|Type) => Object.getOwnPropertyNames(
	new ((typeof object === 'object') ? Object.getPrototypeOf(object).constructor : object)
)

export { propertyNames }

import { decorate, decoratorOf } from '../decorator/class'
import { Entity }                from '../dao/dao'
import { Filter, HTML, OUTPUT }  from '../property/filter/filter'
import { setPropertyTypeFilter } from '../property/filter/filter'
import { CollectionType }        from '../property/type'
import { representativeValueOf } from '../view/class/representative'
import { ObjectOrType } from './type'

const COLLECTION = Symbol('collection')

export const Collection = (value = true) => decorate(COLLECTION, value)
export default Collection

export const collectionOf = (target: ObjectOrType) => decoratorOf(target, COLLECTION, false)

Collection(true)(Array)
Collection(true)(Set)

const collectionOutput: Filter = (value: (object & Entity)[]) =>
{
	return value.map(object => representativeValueOf(object)).join(', ')
}

setPropertyTypeFilter(CollectionType, HTML, OUTPUT, collectionOutput)

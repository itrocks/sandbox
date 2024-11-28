import { decorate, decoratorOf } from '../decorator/class'
import { ObjectOrType }          from './type'

const COLLECTION = Symbol('collection')

export const Collection = (value = true) => decorate(COLLECTION, value)
export default Collection

export const collectionOf = (target: ObjectOrType) => decoratorOf(target, COLLECTION, false)

Collection(true)(Array)
Collection(true)(Set)

import { KeyOf }                     from '../../class/type'
import { DecorateCaller }            from '../../decorator/property'
import { Direction, Format }         from './transformer'
import { Transformer, Transformers } from './transformer'
import { setPropertyTransformer }    from './transformer'
import { setPropertyTransformers }   from './transformer'

export function Transform<T extends object>(transformers: Transformers): DecorateCaller<T>
export function Transform<T extends object>(format: Format, transformer: Transformer<T> | false): DecorateCaller<T>
export function Transform<T extends object>(format: Format, direction: Direction, transformer: Transformer<T> | false)
	: DecorateCaller<T>
export function Transform<T extends object>(
	format: Format | Transformers<T>, direction?: Direction | Transformer<T> | false, transformer?: Transformer<T> | false
) {
	if (typeof format !== 'string') {
		return (target: T, property: KeyOf<T>) =>
			setPropertyTransformers(target, property, format)
	}
	if ((typeof direction === 'function') || (direction === false)) {
		return (target: T, property: KeyOf<T>) =>
			setPropertyTransformer(target, property, format, '', direction)
	}
	if (transformer === undefined) return
	return (target: T, property: KeyOf<T>) =>
		setPropertyTransformer(target, property, format, direction ?? '', transformer)
}
export default Transform

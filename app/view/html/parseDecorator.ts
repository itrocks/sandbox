import { displayOf as classDisplayOf }    from '@itrocks/class-view'
import { trOutputOf }                     from '@itrocks/class-view'
import { displayOf as propertyDisplayOf } from '@itrocks/property-view'
import { ReflectClass }                   from '@itrocks/reflect'
import { ReflectProperty }                from '@itrocks/reflect'
import { Str }                            from '@itrocks/rename'
import { objectRouteOf, routeOf }         from '@itrocks/route'
import { tr }                             from '@itrocks/translate'

export default function parseDecorator(variable: string, data: any)
{
	if ((typeof data !== 'function') && (typeof data !== 'object')) {
		console.error('Bad data for variable', variable, 'data', data)
	}
	switch (variable) {
		case '@display':
			if (data instanceof ReflectProperty) return tr(propertyDisplayOf(data.class.object ?? data.class.type, data.name))
			if (data instanceof ReflectClass)    return tr(classDisplayOf(data.type))
			if (typeof data === 'object')        return classDisplayOf(data)
			return data
		case '@objectRoute':
			return objectRouteOf(data)
		case '@output':
			return new Str(trOutputOf(data))
		case '@route':
			return routeOf(data)
	}
	return '?'
}

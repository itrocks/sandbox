import { objectRouteOf, routeOf }         from '../../action/route'
import tr                                 from '../../locale/translate'
import ReflectProperty                    from '../../property/reflect'
import { displayOf as classDisplayOf }    from '../class/display'
import { trOutputOf }                     from '../class/output'
import { displayOf as propertyDisplayOf } from '../property/display'

export default function parseDecorator(variable: string, data: any)
{
	if ((typeof data !== 'function') && (typeof data !== 'object')) {
		console.error('Bad data for variable', variable, 'data', data)
	}
	switch (variable) {
		case '@display':
			return (data instanceof ReflectProperty)
				? tr(propertyDisplayOf(data.class.object ?? data.class.type, data.name))
				: tr(classDisplayOf(data))
		case '@objectRoute':
			return objectRouteOf(data)
		case '@output':
			return trOutputOf(data)
		case '@route':
			return routeOf(data)
	}
	return '?'
}

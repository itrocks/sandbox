import tr              from '../../locale/translate'
import ReflectProperty from '../../property/reflect'
import { passwordOf }  from '../../property/filter/password'
import { displayOf }   from '../property/display'

const tab = '\n\t\t\t\t'

export const widgetOf = (property: ReflectProperty) =>
{
	const label = `<label for="${property.name}">`
		+ tr(displayOf(property.class.object ?? property.class.type, property.name))
		+ '</label>'
	const name = `id="${property.name}" name="${property.name}"`
	if (property.object) {
		if (property.object[property.name].length) {
			if (passwordOf(property.object, property.name)) {
				return label + tab + `<input ${name} type="password" value="¤~!~!~!~!~¤">`
			}
			return label + tab + '<input ' + name + ' value="' + property.object[property.name] + '">'
		}
		if (property.class.propertyTypes[property.name] === 'boolean') {
			return label
				+ tab + `<input name="${property.name}" type="hidden" value="0">`
				+ tab + `<input ${property.object[property.name] ? 'checked ' : ''}${name} type="checkbox" value="1">`
		}
	}
	return label + tab + '<input ' + name + '">'
}
export default widgetOf

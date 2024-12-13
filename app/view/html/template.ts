import { Template as T, VariableParser } from '@itrocks/template'
import tr              from '../../locale/translate'
import parseDecorator  from './parseDecorator'
import parseReflect    from './parseReflect'

export default class Template extends T
{
	doLiteral = true

	parsers: VariableParser[] = [
		['@', parseDecorator],
		['%', parseReflect]
	]

	applyLiterals(text: string, parts: string[] = [])
	{
		return tr(text, parts)
	}

}

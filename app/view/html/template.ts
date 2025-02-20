import { Template as T }  from '@itrocks/template'
import { VariableParser } from '@itrocks/template'
import tr                 from '@itrocks/translate'
import parseDecorator     from './parseDecorator'
import parseReflect       from './parseReflect'

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

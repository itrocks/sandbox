import { properties } from '../../class/reflect'

export default function parseReflect(variable: string, data: any)
{
	switch (variable) {
		case '%properties':
			return properties(data)
	}
	return '?'
}

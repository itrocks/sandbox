
export function lcFirst(string: string)
{
	return string[0].toLowerCase() + string.slice(1)
}

export function toClass(string: string)
{
	return string[0].toUpperCase() + string.slice(1).replace(
		/([a-zA-Z0-9_])[ -]([a-zA-Z0-9_])/g,
		(_match, low: string, high: string) => low + high.toUpperCase()
	)
}

export function toFunction(string: string)
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-zA-Z0-9_])[ -]([a-zA-Z0-9_])/g,
		(_match, low: string, high: string) => low + high.toUpperCase()
	)
}

export function toVar(string: string)
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-zA-Z0-9_])[ -]([a-zA-Z0-9_])/g,
		(_match, low: string, high: string) => low + high.toUpperCase()
	)
}

export function toDisplay(string: string)
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-z0-9_])([A-Z])/g,
		(_match, low: string, high: string) => low + ' ' + high.toLowerCase()
	)
}

export function toRoute(string: string)
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-z0-9_])([A-Z])/g,
		(_match, low: string, high: string) => low + '-' + high.toLowerCase()
	)
}

export function ucFirst(string: string)
{
	return string[0].toUpperCase() + string.slice(1)
}

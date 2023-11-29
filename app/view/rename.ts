
function lcFirst(string: string): string
{
	return string[0].toLowerCase() + string.slice(1)
}

function toClass(string: string): string
{
	return string[0].toUpperCase() + string.slice(1).replace(
		/([a-zA-Z0-9_])[ -]([a-zA-Z0-9_])/g,
		(_match, low: string, high: string) => low + high.toUpperCase()
	)
}

function toVar(string: string): string
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-zA-Z0-9_])[ -]([a-zA-Z0-9_])/g,
		(_match, low: string, high: string) => low + high.toUpperCase()
	)
}

function toDisplay(string: string): string
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-z0-9_])([A-Z])/g,
		(_match, low: string, high: string) => low + ' ' + high.toLowerCase()
	)
}

function toRoute(string: string): string
{
	return string[0].toLowerCase() + string.slice(1).replace(
		/([a-z0-9_])([A-Z])/g,
		(_match, low: string, high: string) => low + '-' + high.toLowerCase()
	)
}

function ucFirst(string: string): string
{
	return string[0].toUpperCase() + string.slice(1)
}

export { lcFirst, toClass, toDisplay, toRoute, toVar, ucFirst }

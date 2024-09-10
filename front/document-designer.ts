
export class DocumentDesigner
{

	constructor(public readonly element: HTMLElement)
	{
	}

}
export default DocumentDesigner

export function documentDesignerByElement(element: HTMLElement)
{
	return new DocumentDesigner(element)
}

export function documentDesignerByElements(elements: Array<HTMLElement>|NodeListOf<HTMLElement>)
{
	return Array.from(elements).map(element => documentDesignerByElement(element))
}

export function documentDesignerBySelector(selector: string)
{
	return documentDesignerByElements(document.body.querySelectorAll<HTMLElement>(selector))
}

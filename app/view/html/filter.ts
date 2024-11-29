import { HTML, HtmlContainer, setFormatFilter } from '../../property/filter/filter'

setFormatFilter(HTML, (value: string, askFor: HtmlContainer) =>
	(askFor.container && askFor.mandatoryContainer) ? ('<div>' + value + '</div>') : value
)

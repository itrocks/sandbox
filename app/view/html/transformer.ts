import { HTML, HtmlContainer, setFormatTransformer } from '../../property/transform/transformer'

setFormatTransformer(HTML, (value: string, askFor: HtmlContainer) =>
	(askFor.container && askFor.mandatoryContainer) ? ('<div>' + value + '</div>') : value
)

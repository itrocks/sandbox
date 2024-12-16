import { HTML, HtmlContainer, setFormatTransformer } from '../../property/transform/transform'

setFormatTransformer(HTML, (value: string, askFor: HtmlContainer) =>
	(askFor.container && askFor.mandatoryContainer) ? ('<div>' + value + '</div>') : value
)

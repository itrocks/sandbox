import PDFDocument     from 'pdfkit'
import { PassThrough } from 'stream'
import Action          from '../../../action/action'
import Need            from '../../../action/need'
import PdfResponse     from '../../../server/response/pdf'

@Need('objects')
export default class Print extends Action
{

	async pdf()
	{
		const document = new PDFDocument()
		const stream   = new PassThrough()
		const chunks   = <any>[]
		document.pipe(stream)
		stream.on('data', chunk => { chunks.push(chunk) })

		for (let i = 0; i < 5000; i ++) {
			document.font('Times-Roman')
				.fontSize(25)
				.text('Bonjour, ô seigneur et maître !', 100, 100)
			document.addPage()
		}
		document.end()

		await new Promise(resolve => stream.on('end', resolve))
		return new PdfResponse(Buffer.concat(chunks))
	}

}

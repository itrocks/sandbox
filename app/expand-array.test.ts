import './expand'

describe('replaceIn', () => {
	it('stackOverflow1', () => {
		expect(/([a-zA-Z]{2})-([0-9]{3})/.replaceIn('ab-123_foo', ['ZX', '321'])).toEqual('ZX-321_foo')
	})
	it('stackOverflow2', () => {
		expect(/([a-zA-Z]{2})-([0-9]{3})/.replaceIn('ab_ab-123', ['ZX', '321'])).toEqual('ab_ZX-321')
	})
})

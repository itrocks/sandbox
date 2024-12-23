import { performance } from 'perf_hooks'

// Compare perfs : string += '...' versus strings.push('...')

const iterations = 10000
const tests = 10000
{
	const start = performance.now()
	for (let i = 0; i < tests; i++) {
		let target = ''
		for (let j = 0; j < iterations; j++) {
			target += 'dsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0e'
		}
	}
	const end = performance.now()
	console.log(`+= ${end - start} ms`)
}

{
	const start = performance.now()
	for (let i = 0; i < tests; i++) {
		let target: string | string[] = new Array(iterations)
		for (let j = 0; j < iterations; j++) {
			target[j] = 'dsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0edsgjsjzeoihsisd41s0e'
		}
		const result = target.join('')
	}
	const end = performance.now()
	console.log(`[] ${end - start} ms`)
}

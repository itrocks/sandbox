
let index: number
let start: number
let str = ''

for (let i = 0; i < 1000000; i++) {
	str += String.fromCharCode(32 + Math.floor(Math.random() * 100))
}

for (let n = 0; n < 1; n++) {
	let index
	for (index = 1000; index < 1000000; index ++) if (str[index] === 'A') break
	console.log(str.indexOf('A', 1000), 1000 + str.slice(1000).search(/[A]/), index)
}

console.log('NO SLICE')

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.indexOf('A')
}
console.log(`- indexOf: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.search(/A/)
}
console.log(`- search1: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.search(/[AB]/)
}
console.log(`- search2: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.search(/[ABC]/)
}
console.log(`- search3: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	for (let index = 0; index < 1000000; index ++) if (str[index] === 'A') break
}
console.log(`- loop: ${performance.now() - start}`)

console.log('SLICE')

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.indexOf('A', 1000)
}
console.log(`- indexOf: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.slice(1000).search(/A/)
}
console.log(`- search: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.slice(1000).search(/[AB]/)
}
console.log(`- search2: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	str.slice(1000).search(/[ABC]/)
}
console.log(`- search3: ${performance.now() - start}`)

start = performance.now()
for (let n = 0; n < 1000000; n++) {
	for (let index = 1000; index < 1000000; index ++) if (str[index] === 'A') break
}
console.log(`- loop: ${performance.now() - start}`)

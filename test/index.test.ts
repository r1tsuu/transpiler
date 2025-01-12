// sum.test.js
import { expect, test } from 'vitest'

import { tokenizeAndTranspile } from '../src/index.js'

test('sum', () => {
  expect(tokenizeAndTranspile('5 + 10')).toBe(15)
})

test('sub', () => {
  expect(tokenizeAndTranspile('5 - 10')).toBe(-5)
})

test('multiple', () => {
  expect(tokenizeAndTranspile('5 * 10')).toBe(50)
})

test('divide', () => {
  expect(tokenizeAndTranspile('5 / 10')).toBe(0.5)
})

test('numbers with floating point', () => {
  expect(tokenizeAndTranspile('10.5 + 0.5')).toBe(11)
})

test('multiple should be prioritized over sum', () => {
  expect(tokenizeAndTranspile('2+5*3')).toBe(17)
})

test('sum in braces should be prioritized over multiple', () => {
  expect(tokenizeAndTranspile('(2+5)*3')).toBe(21)
})

test('nested complex braces', () => {
  expect(tokenizeAndTranspile('((2+3)*4+(6/2))*(5+1)')).toBe(138)
})

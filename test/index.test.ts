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

test('variables', () => {
  expect(tokenizeAndTranspile('x = 3+10; y=5; x +y;')).toBe(18)
  expect(tokenizeAndTranspile('x = 2; y = x * 3; y + x;')).toBe(8)
  expect(tokenizeAndTranspile('x=3.14; sin(x / 2);')).toBeCloseTo(1, 5)
})

test('functions', () => {
  expect(tokenizeAndTranspile('x=3;function someFunc(y) { 3+y; }; someFunc(5)')).toBe(8)
})

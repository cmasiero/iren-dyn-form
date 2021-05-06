"use strict"
const example = require('../app/example');

test('adds 1 + 2 to equal 3', () => {
  expect(example.exampleFunction(1, 2)).toBe(3);
});
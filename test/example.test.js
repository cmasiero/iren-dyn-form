"use strict"
const example = require('../app/example');

// test('adds 1 + 2 to equal 3', () => {
//   expect(example.exampleFunction(1, 2)).toBe(3);
// });

test('reg ex', () => {

  const paragraph = "mandatory if 01_id == '10'|visible if 02_id == 'hard coded       '";
  const regex = /\'(.*?)\'/g;
  const found = paragraph.match(regex);

  console.log("FOUND %s: ", found);

  let resultMarked = paragraph;
  found.forEach((str,i) => {
    resultMarked = resultMarked.replace(str,"mark_".concat(i));
  });
  console.log("-> %s", resultMarked);


  let result = resultMarked;
  found.forEach((str,i) => {
    result = result.replace("mark_".concat(i),str);
  });
  console.log("-> %s", result);





  expect(1).toBe(1);
});
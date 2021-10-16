const expect = require("chai").expect;
const threeWayMerge = require("../object-merge");

let o = {};
let a = {};
let b = {};

const tests = [
  {
    name: "Empty objects should have no changes",
    values: {
      o: {},
      a: {},
      b: {},
    },
    expected: {
      added: {
        a: {},
        b: {},
      },
      merged: {},
      updated: {
        a: {},
        b: {},
      },
    },
  },
  {
    name: "Original test from source repo",
    values: {
      o: {
        name: "rsms",
        following: ["abc", "d,ef"],
        modified: 12345678,
        aliases: { abc: "Abc" },
      },
      a: {
        age: 12,
        location: "sto",
        sex: "m",
        name: "rsms",
        modified: 12345679,
        following: ["abc", "cat", "xyz"],
        aliases: { abc: "Abc", def: "Def" },
      },
      b: {
        age: 13,
        name: "rsms",
        sex: "m",
        following: ["abc", "ooo"],
        modified: 12345679,
        aliases: { abc: "Abc", aab: "Aab" },
      },
    },
    expected: {
      merged: {
        age: 13,
        name: "rsms",
        sex: "m",
        following: ["abc", "ooo", "xyz"],
        modified: 12345679,
        aliases: { abc: "Abc", aab: "Aab", def: "Def" },
        location: "sto",
      },
      added: {
        a: {
          age: 12,
          location: "sto",
          sex: "m",
          aliases: { def: "Def" },
          following: { _t: "Array", 2: "xyz" },
        },
        b: { age: 13, sex: "m", aliases: { aab: "Aab" } },
      },
      updated: {
        a: {
          modified: 12345679,
          following: { _t: "Array", 1: "cat" },
        },
        b: {
          modified: 12345679,
          following: { _t: "Array", 1: "ooo" },
        },
      },
      conflicts: {
        age: { a: 12, b: 13 },
        following: {
          conflicts: { 1: { a: "cat", o: "d,ef", b: "ooo" } },
        },
      },
    },
  },
  {
    name: "Unchanged sub objects shouldn't be added or updated",
    values: {
      o: {
        first: "ok",
        nested: {
          x: 0,
          y: 1,
        },
      },
      a: {
        first: "ok",
        nested: {
          x: 0,
          y: 1,
        },
      },
      b: {
        first: "ok",
        nested: {
          x: 0,
          y: 1,
        },
      },
    },
    expected: {
      added: {
        a: {},
        b: {},
      },
      merged: {
        first: "ok",
        nested: {
          x: 0,
          y: 1,
        },
      },
      updated: {
        a: {},
        b: {},
      },
    },
  },
];

describe("Object-merge", function () {
  tests.forEach((test) => {
    it(test.name, function () {
      expect(
        threeWayMerge(test.values.o, test.values.a, test.values.b)
      ).to.deep.equal(test.expected);
    });
  });
});

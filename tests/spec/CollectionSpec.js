describe("Collection", function() {

  var fixtures = [
    { // 0
      name: 'A',
      age: 28,
      code: ['js', 'html'],
      details: {
        city: 'munich'
      }
    },
    { // 1
      name: 'B',
      age: 20,
      code: ['html', 'java']
    },
    { // 2
      name: 'C',
      age: 28
    },
    { // 3
      name: 'D',
      age: 38,
      code: ['python', 'ruby']
    },
    { // 4
      name: 'E',
      code: ['js', 'css', 'java']
    },
    { // 5
      name: 'F',
      age: 16
    }
  ];
  var testCollection = null;

  /**
   * Helper method to compare result with fixtures
   * @param {Array} expected_indexes - List of expected fixtures indexes E.g. [2, 3]
   * @param {Array} result - List of actual found objects
   */
  var assertObjects = function(expected_indexes, result, fixtures_arr) {
    fixtures_arr = fixtures_arr || fixtures;
    expect(result.length).toEqual(expected_indexes.length);
    for (var i = 0; i < expected_indexes.length; i++) {
      expect(result[i].name).toEqual(fixtures_arr[expected_indexes[i]].name);
    }
  };

  beforeEach(function() {
    testCollection = new Collection('test');
    for (var i = 0; i < fixtures.length; i++) {
      testCollection.insert(fixtures[i]);
    };
  });

  it ("should find all", function() {
    var expectedAmountToFind = fixtures.length;
    var result = testCollection.find();
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by equal operator", function() {
    var result = testCollection.find({
      age: 28
    });
    assertObjects([0, 2], result);
  });

  it ("should find by $gt greater-than operator", function() {
    var result = testCollection.find({
      age: { $gt : 28 }
    });
    assertObjects([3], result);
  });

  it ("should find by $gte greater-equal operator", function() {
    var result = testCollection.find({
      age: { $gte : 28 }
    });
    assertObjects([0, 2, 3], result);
  });

  it ("should find by $lt greater-than operator", function() {
    var result = testCollection.find({
      age: { $lt : 28 }
    });
    assertObjects([1, 5], result);
  });

  it ("should find by $lte lower-equal operator", function() {
    var result = testCollection.find({
      age: { $lte : 28 }
    });
    assertObjects([0, 1, 2, 5], result);
  });

  it ("should find by $ne not-equal operator", function() {
    var result = testCollection.find({
      age: { $ne : 28 }
    });
    assertObjects([1, 3, 5], result);
  });

  it ("should find by $in operator", function() {
    var result = testCollection.find({
      name: { $in : ['A', 'B', 'G'] }
    });
    assertObjects([0, 1], result);
  });

  it ("should limit result", function() {
    var expectedAmountToFind = 3;
    var result = testCollection.find({
      limit: expectedAmountToFind
    });
    expect(result.length).toEqual(expectedAmountToFind);
    assertObjects([0, 1, 2], result);
  });

  it ("should find by multiple operators", function() {
    var result = testCollection.find({
      name: 'C',
      age: { $gte : 28 }
    });
    assertObjects([2], result);

    var result = testCollection.find({
      name: { $in: ['C', 'A', 'D'] },
      age: { $gte : 28 },
      limit: 2
    });
    assertObjects([0, 2], result);
  });

  it ("should return result from cache", function() {
    var conditions = {
      age: { $gte: 28 }
    };
    spyOn(testCollection, 'addToCache').and.callThrough();

    var noCacheResult = testCollection.find(conditions);
    var cachedResult = testCollection.find(conditions);
    var hash_code = 1673641321; // TODO: do not hard code this!
    expect(testCollection.addToCache.calls.count()).toEqual(1);
  });

  it ("should clear cache after insert", function() {
    var conditions = {
      age: { $gte: 28 }
    };
    spyOn(testCollection, 'addToCache').and.callThrough();

    var noCacheResult = testCollection.find(conditions);
    var cachedResult = testCollection.find(conditions);
    testCollection.insert({ name: 'Z', age: 44 });
    var noCacheResult2 = testCollection.find(conditions);
    var hash_code = 1673641321;
    expect(testCollection.addToCache.calls.count()).toEqual(2);
  });

  it ("should remove items", function() {
    testCollection.clear();
    var data = [
      {
        name: 'Stay'
      },
      {
        name: 'remove',
        num: 1
      },
      {
        name: 'remove',
        num: 2
      }
    ];
    for (var i = 0; i < data.length; i++) {
      testCollection.insert(data[i]);
    }
    var result = testCollection.find();
    assertObjects([0, 1, 2], result, data);

    // Remove
    testCollection.remove({name: 'remove'});
    var result_remove = testCollection.find();
    assertObjects([0], result_remove, data);
  });

});

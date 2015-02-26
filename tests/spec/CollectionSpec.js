describe("Collection", function() {

  var fixtures = [
    {
      name: 'A',
      age: 28,
      code: ['js', 'html'],
      details: {
        city: 'munich'
      }
    },
    {
      name: 'B',
      age: 20,
      code: ['html', 'java']
    },
    {
      name: 'C',
      age: 28
    },
    {
      name: 'D',
      age: 38,
      code: ['python', 'ruby']
    },
    {
      name: 'E',
      code: ['js', 'css', 'java']
    },
    {
      name: 'F',
      age: 16
    }
  ];
  var testCollection = null;

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
    var expectedAmountToFind = 2;
    var result = testCollection.find({
      age: 28
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by $gt greater-than operator", function() {
    var expectedAmountToFind = 1;
    var result = testCollection.find({
      age: { $gt : 28 }
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by $gte greater-equal operator", function() {
    var expectedAmountToFind = 3;
    var result = testCollection.find({
      age: { $gte : 28 }
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by $lt greater-than operator", function() {
    var expectedAmountToFind = 2;
    var result = testCollection.find({
      age: { $lt : 28 }
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by $lte lower-equal operator", function() {
    var expectedAmountToFind = 4;
    var result = testCollection.find({
      age: { $lte : 28 }
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by $ne not-equal operator", function() {
    var expectedAmountToFind = 3;
    var result = testCollection.find({
      age: { $ne : 28 }
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by $in operator", function() {
    var expectedAmountToFind = 2;
    var result = testCollection.find({
      name: { $in : ['A', 'B', 'G'] }
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should limit result", function() {
    var expectedAmountToFind = 3;
    var result = testCollection.find({
      limit: expectedAmountToFind
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should find by multiple operators", function() {
    var expectedAmountToFind = 1;
    var result = testCollection.find({
      name: 'C',
      age: { $gte : 28 }
    });
    expect(result.length).toEqual(expectedAmountToFind);

    var expectedAmountToFind = 2;
    var result = testCollection.find({
      name: { $in: ['C', 'A', 'D'] },
      age: { $gte : 28 },
      limit: 2
    });
    expect(result.length).toEqual(expectedAmountToFind);
  });

  it ("should return result from cache", function() {
    var conditions = {
      age: { $gte: 28 }
    };
    spyOn(testCollection, 'addToCache').and.callThrough();

    var noCacheResult = testCollection.find(conditions);
    var cachedResult = testCollection.find(conditions);

    expect(testCollection.addToCache.calls.count()).toEqual(1);
    expect(testCollection.result_cache['age$gte28'].length).toEqual(3);
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

    expect(testCollection.addToCache.calls.count()).toEqual(2);
    expect(testCollection.result_cache['age$gte28'].length).toEqual(4);
  });

});

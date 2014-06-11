/**
 * @author francois weber - webarbeit@gmail.com
 *
 * Description: 
 *  A collection holds an array of objects
 *  - Find objects by properties
 *  - Store it to localStorage
 * 
 * TODO: 
 *  [ ] write tests
 *  [ ] Implement remove method
 *  [ ] Find deep nested properties - like: { prop.propX : value }
 * 
 * E.g.
 *  var users = new Collection('users');
 *  users.insert({ name: "Foo", age: 28 });
 *  users.insert({ name: "Bar", age: 18 });
 * 
 *  // All users with name "Bar"
 *  var result = users.find({ name: "Bar" });
 *  // => [{ name: "Bar", age: 18 }]
 * 
 *  // All users with age greater 20
 *  var result = users.find({ age: { $gt : 20 } });
 *  // => [{ name: "Foo", age: 28 }]
 * 
 *  // All users with name "Foo" or "Bar"
 *  var result = users.find({ name: { $in : ["Foo", "Bar"] } });
 *  // => [{ name: "Foo", age: 28 }, { name: "Bar", age: 18 }]
 * 
*/


/**
 * @constructor
 * @param {String} name
 * @param {Boolean} toLocalStorage - Whether to save this collection in localstorage
                                     or just temporarily
 */
var Collection = function(name, toLocalStorage) {
  if (!name) {
    throw 'Collection needs a name!';
  }
  this.name = name;
  this.toLocalStorage = toLocalStorage || false;
  this.STORAGE_KEY = "collection_" + this.name;
  this.objects = [];
};

/**
 * Insert item to this collection
 * @param {Object} data - The data to insert
 * @return {String} The id of the new inserted item
 */
Collection.prototype.insert = function(data) {
  if (!data) {
    throw 'No data provided when inserting to Collection!';
  }
  var id = this.getId();
  data["_id"] = id;
  this.objects.push(data);
  if (this.toLocalStorage) {
    this.savePersistent();
  }
  return id;
};

/**
 * Removes items from the collection which match conditions
 * @param {Object} conditions
 */
Collection.prototype.remove = function(conditions) {
  // TODO
};

/**
 * Insert item to this collection
 * @param {Object} data - The data to insert
 * @return {String} The id of the new inserted item
 */
Collection.prototype.clear = function() {
  this.objects = [];
};

/**
 * Returns random string. Useful for IDs
 * @param {Number} chars - The string length
 * @return {String}
 */
Collection.prototype.getId = function(chars) {
  chars = chars || 15;
  return (Math.random() + 1).toString(36).substring(2, chars);
};

/**
 * Returns list of items which match conditions
 * @param {Object} conditions   - The filter conditions as object
                                  E.g. { name: "Foo", timestamp: { $gt: 120302300 } }
 * @param {Boolean} returnIndex - Returning list contains indexes of the found items
                                  instead of the objects itself
 * @return {Array}
 */
Collection.prototype.find = function(conditions, returnIndex) {
  var objects = this.objects;
  // Possible query operations
  var ops = {
    '$gt' : '>',
    '$lt' : '<',
    '$gte' : '>=',
    '$lte' : '<=',
    '$ne' : '!='
  };
  var result = [];
  var len = objects.length;
  for (var i = 0; i < len; i++) {
    var obj = objects[i];
    var add = [];
    var numConditions = 0;
    for (var condition in conditions) {
      // Equal operator E.g { _id: 2 }
      if (typeof conditions[condition] !== 'object') {
        numConditions++;
        if (obj[condition] === conditions[condition]) {
          add.push(true);
        }
      // Not equal operator
      } else {
        for (var compare in conditions[condition]) {
          numConditions++;
          if (compare === "$in") {
            var arr = conditions[condition][compare];
            for (var x = 0; x < arr.length; x++) {
                if (obj[condition].indexOf(arr[x]) > -1) {
                    add.push(true);
                }
            }
          } else {
            if (eval(obj[condition] + '' + ops[compare] + '' + conditions[condition][compare])) {
              add.push(true);
            }
          }
        }
      }
    }

    // If the number of added conditions is equal the number of asked for conditions,
    // then all conditions match and we can add it to the results
    if (add.length === numConditions) {
      if (returnIndex) {
        result.push(i);
      } else {
        result.push(obj);
      }
    }
  }
  return result;
};

/**
 * Saves the collection to localStorage
 */
Collection.prototype.savePersistent = function() {
  if (window.localStorage) {
    window.localStorage.setItem(JSON.stringify(this.objects));
  } else {
    console.warn("LocalStorage is not supported on this device");
  }
  return window.localStorage;
};

/**
 * Call this to get the collection objects from localStorage
 * @param {String} key
 * @return {Array|null}
 */
Collection.getCollection = function(key) {
  if (!key) { return null; }
  return JSON.parse(window.localStorage.getItem(key));
};
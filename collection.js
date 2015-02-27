/**
 * @author francois weber - webarbeit@gmail.com
 *
 * Description:
 *  A collection holds an array of objects
 *  - Find objects by properties
 *  - Store it to localStorage
 *
 * TODO:
 *  [ ] Find deep nested properties - like: { prop.propX : value }
 *  [ ] Implement $has - like { prop : { $has: 'value' }} (for array-values)
 *  [ ] Implement order-by
 *  [ ] Refactor find()
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

// Converts String to 32bit integer
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

/**
 * @constructor
 * @param {String} name
 * @param {Boolean} toLocalStorage - Whether to save this collection in localstorage
                                     or just temporarily
 */
var Collection = Collection || function(name, toLocalStorage) {
  if (!name) {
    throw 'Collection needs a name!';
  }
  var toLocalStorage = toLocalStorage || false;
  if (!window.localStorage) {
    toLocalStorage = false;
  }
  var STORAGE_KEY = "collection_" + name;
  var objects = [];
  // Temporary result cache
  var result_cache = {};

  /**
   * Returns random string. Useful for IDs
   * @param {Number} chars - The string length
   * @return {String}
   */
  var getId = function(chars) {
    chars = chars || 15;
    return (Math.random() + 1).toString(36).substring(2, chars);
  };

  return {
    /**
     * Insert item to this collection
     * @param {Object} data - The data to insert
     * @return {String} The id of the new inserted item
     */
    insert: function(data) {
      if (!data) {
        throw 'No data provided when inserting to Collection!';
      }
      var id = getId();
      data["_id"] = id;
      objects.push(data);
      if (toLocalStorage) {
        this.savePersistent();
      }
      this.clearCache();
      return id;
    },

    /**
     * Removes items from the collection which match conditions
     * @param {Object} conditions
     */
    remove: function(conditions) {
      var items = this.find(conditions, true);
      for (var i = items.length - 1; i >= 0; i--) {
        objects.splice(items[i], 1);
      }
      this.clearCache();
    },

    /**
     * Dump all collection entries
     */
    clear: function() {
      objects = [];
      this.clearCache();
    },

    /**
     * Add result to cache
     * @param {Object} conditions - The query conditions
     * @param {Array} value - The result of the query
     * @param {Boolean} returnIndex - If only to return index
     */
    addToCache: function(conditions, value, returnIndex) {
      var key = this.getCacheKey(conditions, returnIndex);
      result_cache[key] = value;
    },

    /**
     * Clears the cache
     */
    clearCache: function() {
      result_cache = {};
    },

    /**
     * Returns true if key is already in the cache
     */
    inCache: function(conditions, returnIndex) {
      var key = this.getCacheKey(conditions, returnIndex);
      var cache = result_cache[key];
      return typeof cache !== 'undefined' ? cache : null;
    },

    /**
     * Returns list of items which match conditions
     * @param {Object} conditions   - The filter conditions as object
                                      E.g. { name: "Foo", timestamp: { $gt: 120302300 } }
     * @param {Boolean} returnIndex - Returning list contains indexes of the found items
                                      instead of the objects itself
     * @return {Array}
     */
    find: function(conditions, returnIndex) {

      // What does the cache says?!
      var cache = this.inCache(conditions, returnIndex);
      if (cache) {
        return cache;
      }

      // Possible query operations
      var ops = {
        '$gt' : '>',
        '$lt' : '<',
        '$gte' : '>=',
        '$lte' : '<=',
        '$ne' : '!=='
      };
      var limit = null;
      if (conditions && conditions.limit) {
        limit = conditions.limit;
      }
      var result = [];
      var len = objects.length;
      for (var i = 0; i < len; i++) {
        var obj = objects[i];
        var add = [];
        var numConditions = 0;
        for (var condition in conditions) {
          if (condition === "limit") {
            continue;
          }
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
                // yep its eval()
                if (obj[condition] && ops[compare] && eval(obj[condition] + '' + ops[compare] + '' + conditions[condition][compare])) {
                  add.push(true);
                }
              }
            }
          }
        }

        // If the number of added conditions is equal the number of asked-for-conditions,
        // then all conditions match and we can add it to the results
        if (add.length === numConditions) {
          if (returnIndex) {
            result.push(i);
          } else {
            result.push(obj);
          }
          if (limit && result.length >= limit) {
            break;
          }
        }
      }

      this.addToCache(conditions, result, returnIndex);

      return result;
    },

    /**
     * Saves the collection to localStorage
     */
    savePersistent: function() {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
      } else {
        console.warn("LocalStorage is not supported on this device");
      }
      return window.localStorage;
    },

    /**
     * Call this to get the collection objects from localStorage
     * @param {String} key
     * @return {Array|null}
     */
    getCollection: function(key) {
      var data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    },

    /**
     * Returns a key for the result cache, based on the conditions object
     * @param {Object|undefined} conditions
     * @param {Boolean|undefined} returnIndex
     */
    getCacheKey: function(conditions, returnIndex) {
      var key = JSON.stringify(conditions);
      if (key) {
        key = key.hashCode();
      } else {
        key = "ALL";
      }
      return returnIndex ? key + '_i' : key;
    }
  };
};

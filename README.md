> Still in development :)

Collection handling inspired by Meteor.Collection.

```javascript
var users = new Collection('users');
users.insert({ name: "Foo", age: 28 });
users.insert({ name: "Bar", age: 18 });

// All users with name "Bar"
var result = users.find({ name: "Bar" });
// => [{ name: "Bar", age: 18 }]

// All users with age greater 20
var result = users.find({ age: { $gt : 20 } });
// => [{ name: "Foo", age: 28 }]

// All users with name "Foo" or "Bar"
var result = users.find({ name: { $in : ["Foo", "Bar"] } });
// => [{ name: "Foo", age: 28 }, { name: "Bar", age: 18 }]
```




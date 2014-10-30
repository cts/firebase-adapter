var FirebaseTree = require('./firebase-tree');
var FirebaseNode = require('./firebase-node');

var Util = require('cts/util');

module.exports = {
  /*
   * This takes a tree spec, and the forest that it is coming from,
   * and returns a new instance of FirebaseTree.
   *
   */
  Tree: function(spec, forrest) {
    var promise = Util.Promise.defer();

    // todo create tree
    var tree = null;
    promise.resolve(tree);

    return promise;
  }
  
};

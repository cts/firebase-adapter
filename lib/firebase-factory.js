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

    var tree = new FirebaseTree(forrest, treespec);
    var ss = new FirebaseNode(treespec, tree);
    if (typeof Firebase == 'undefined') {
      alert("Hey! You need to include the Firebase.js file, too!");
    }
    ss.Ref = new Firebase(treespec.url);
    tree.root = ss
    tree.root.realizeChildren().then(
      function() {
        promise.resolve(tree);
      },
      function(err) {
        promise.reject(err);
      }
    );

    return promise;
  }
  
};

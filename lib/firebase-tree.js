var Util = require('cts/util');
var Model = require('cts/model');

var FirebaseTree = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.insertionListener = null;
};

// Instance Methods
// ----------------
Util._.extend(HtmlTree.prototype, Model.Tree.Base, Util.Events, {
  setRoot: function(node) {
    this.root = node;
    this.root.setProvenance(this);
  },

  nodesForSelectionSpec: function(spec) {
    Util.Log.Info(this, "got selection spec", spec);
    return this.root.find(spec.selectorString);
  },

  listenForNodeInsertions: function(new_val) {
  }
});

module.exports = HtmlTree;

var Util = require('cts/util');
var Model = require('cts/model');

var FirebaseNode = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "FirebaseNode";
  this.key = key || null;
  this.value = value || null;
  this.ctsId = Fn.uniqueId().toString();
  this.Ref = null;
  if (typeof amiroot == 'undefined') {
    amiroot = true;
  } 
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });

  this.amiroot = amiroot;
};

// ### Instance Methods
Util._.extend(FirebaseNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return this.kind;
  },

  find: function(spec, ret) {
    console.log("find called", selectorString);
    if (typeof ret == "undefined"){
      ret = [];
    }

    // XXX MAYBE CHANGE
    // assumption: selectorString is k1/k2/.../kn
    if (this.amiroot) {
      // ASSUMPTION: Root MUST be a dictionary. (is this true?)
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].find(selectorString, ret);
      }
    } else {
      var pieces = selectorString.split('/');
      if (pieces.length == 1) {
        // end of the road!
        if (this.key == pieces[0]) {
          ret.push(this);
        }
      } else {
        // maybe recurse?
        var newSelectorString = pieces.slice(1).join("/");
        if (this.key == pieces[0] || this.amiroot) {
          for (var i = 0; i < this.children.length; i++) {
            this.children[i].find(newSelectorString, ret);
          }
        }
      }
    }
    return ret;
  },

  getWorksheetKey: function() {
    return this.spec.wskey;
  },

  getSpreadsheetKey: function() {
    return this.spec.sskey;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    var ret = false;
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        ret =true;
      } else {
        ret = this.parentNode.isDescendantOf(other);
      }
    }
    return ret;
  },

  _subclass_realizeChildren: function() {
    if (! this.amiroot) {
      var d = Util.Promise.defer();
      d.resolve();
      this.children = [];
      if (Util._.isObject(this.value)) {
        for (key in this.value) {
          var child = new FirebaseNode(
            this.spec,
            this.tree,
            this.opts,
            false,
            key,
            this.value[key]);
            child.parentNode = this;
          this.children.push(child);
        }
      }
      return d.promise;
    } else {
      if (this.childrenDeferred) {
        return this.childrenDeferred.promise;
      }
      Util.Log.Info("Realizing children on FB Node");

      this.childrenDeferred = Util.Promise.defer();
      this.children = [];
      this.realized = false;
      var self = this;
      // create the firebase nodes to represent children, add those to this.children
      this.Ref.on('value', function(snapshot){
        self.receivedFirebaseData(snapshot);
      });
      return this.childrenDeferred.promise;
    }
   },

   receivedFirebaseData: function(snapshot){
    if(snapshot.val() === null){
      Util.Log.Error('This node has no children or value');
      this.childrenDeferred.reject("TODO: Figure out if this happens during non-err ops");
    } else {
      if(this.realized) {
        // already realized, this must be a Pushed update from FB
        this._onValueChange(snapshot)
      } else {
        this.realized = true;
        var data = snapshot.val();
        Util.Log.Info("I just got this new data", data);
        var self = this;
        for (key in data) {
          var child = new FirebaseNode(
            this.spec,
            this.tree,
            this.opts,
            false,
            key,
            data[key]);
          child.parentNode = self;
          self.children.push(child);
        }
        this.childrenDeferred.resolve();
      }
    };
  },

   _subclass_insertChild: function(child, afterIndex) {
     // Sure, no problem.
     // TODO: If the child has no spec, that means that we haven't inserted it yet.
     // Right now, this is because Graft will insert it with clone_after, but 
     // there might be other cases where we aren't in the middle of clone operation.
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeed Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new FirebaseNode(value, spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     return Util.Promise.resolve(clone);
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value;
  },

  setValue: function(value, opts) {
    this.Ref.child(opts.key).set(value);
    return;
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = FirebaseNode;

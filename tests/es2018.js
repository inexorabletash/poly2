/*global QUnit,global*/

QUnit.module("ES2018: Promise");

QUnit.test('Promise.prototype.finally', function(assert) {
  assert.ok('finally' in Promise.prototype);
  assert.equal(typeof Promise.prototype.finally, 'function');
  assert.equal(Promise.prototype.finally.length, 1);

  function async(f) {
    var done = assert.async();
    f(done);
  }

  async(function(done) {
    Promise.resolve().finally(function() {
      assert.equal(arguments.length, 0, 'Finally callback gets no args - resolved promise');
      done();
    });
  });

  async(function(done) {
    Promise.reject().finally(function() {
      assert.equal(arguments.length, 0, 'Finally callback gets no args - rejected promise');
      done();
    }).catch(function() {});
  });

  async(function(done) {
    Promise.resolve(2).finally(function() {}).then(function(r) {
      assert.equal(r, 2, 'Finally passes resolution through promise chain');
      done();
    });
  });

  async(function(done) {
    Promise.reject(3).finally(function() {}).catch(function(r) {
      assert.equal(r, 3, 'Finally passes rejection through promise chain');
      done();
    });
  });

});

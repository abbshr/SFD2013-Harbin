/* 
** rewards: {
     0: {name: '...', number: ...},
     1: {...},
     ...  
   } 
**/
(function (global, storage, $) {

  /* data init */
  var memberNumber = 0;
  var rewards      = {mirror: []};

  /* rewards and views init */
  storage.open('SFD_Game', function(err, db) {
    if(err) return (storage = storage.down_localStorage) && console.warn('err', 'something goes wrong with indexedDB, localStorage will instead it!');
    storage.get('rewards', function(err, data) {
      if (err) return console.log(err);
      if (!data) return;
      for (var i = 0, len = data.length; i < len; i++)
        rewards[i] = data[i];
      init_view(rewards);
    });
  });
  
  /* DOM Query */
  var configMember = $('configMember');
  var addReward    = $('addReward');
  var manLoop      = $('manLoop');
  var rewardsLoop  = $('rewardsLoop');
  var stopLoop     = $('stopLoop');
  var panel        = $('panel');

  /* Timer setting */
  var timer = {
    timer: null,
    result: null
  };

  /* events callback API */
  var eventsHash = {
    'configMember': function() { configMember_callback(); },
    'addReward': function() { addReward_callback(); },
    'rmReward': function() { rmReward_callback(); },
    'manLoop': function() { startLoop_callback("manLoop", function(num) { /* update view */ }); },
    'rewardsLoop': function() { startLoop_callback("rewardsLoop", function(reward) { /* update view */ }); },
    'stopLoop': function() { stopLoop_callback(); }
  };

  /* events driving */
  panel.addEventListener('click', function(e) {
    var targetID = e.target.id;
    targetID && eventsHash[targetID]();
  });

  /* Logic functions */
  /* notice argument @depends is an Array include unique int numbers [0, 1, 2, 3, ... ]
  ** @base is the number base, so the return number is rounded 0 ~ base */
  function getRandomNumber(base, depends) {
    var num = 0;
    if (!depends || depends && !depends.length) {
      return num = Math.round(Math.random() * base);
    } else if (depends.length < base) {
      while (true) {
        num = Math.round(Math.random() * base);
        if (depends.indexOf(num) === -1) break;
      }
      depends.push(num);
      return num;
    }
  }

  function getRandomReward = function (rewards, base, uniq, depends) {
    if (!uniq) return rewards[getRandomNumber(base, false)];
    else return rewards[getRandomNumber(base, depends)];
  };

  /* native callback functions */
  function configMember_callback(callback) {
    var number_input = $('membersInput').value;
    var test_result = (/([^0]+)([\d]+)/gi).exec(number_input);
    if (isNaN(number_input) || !test_result) return;
    memberNumber = test_result[0];
    return typeof callback === 'function' && callback(memberNumber);
  }

  function addReward_callback(callback) {
    var item_name_input = $('itemName').value;
    var item_number_input = $('itemNumber').value;
    var test_result_name = (/([^\s]+)([\w]+)/gi).exec(item_name_input);
    var test_result_number = (/([^0]+)([\d]+)/gi).exec(item_number_input);
    if (isNaN(item_name_input) || isNaN(item_number_input)) return;
    if (!test_result_name || !test_result_number) return;
    var newItem = { name: test_result_name['input'], number: test_result_number[0]};
    rewards[rewards.mirror.length] = newItem;
    rewards.mirror.push(newItem.name);
    /* Data Persistence */
    storage.open('SFD_Game', function(err, db) {
      if (err) return console.error(err);
      var collection = new db.Collection('rewards');
      collection.insert(newItem, function(err, result) {
        if (err) return console.error(err);
        return typeof callback === 'function' && callback(result);
      });
    });
  }

  function rmReward_callback(callback) {
    var item_name_input = $('itemName').value;
    var test_result_name = (/([^\s]+)([\w]+)/gi).exec(item_name_input);
    if (isNaN(item_name_input) || !test_result_name) return;
    var index = rewards.mirror.indexOf(item_name_input);
    if (index === -1) return;
    var old_len = rewards.mirror.length;
    rewards.mirror.slice(index, 1);
    var mirror = rewards.mirror;
    /* sync DataBase and rewards */
    storage.open('SFD_Game', function(err, db) {
      if (err) return console.error(err);
      var collection = new Collection('rewards');
      collection.remove(item_name_input, function(err, newData) {
        if (err) return console.error(err);
        rewards = {mirror: mirror};
        for (var i = 0; i < newData.length; i++)
          rewards[i] = newData[i];
        return typeof callback === 'function' && callback(item_name_input);
      });
    });
  }

  function startLoop_callback(mode, callback) {
    if (!memberNumber && !rewards[0]) return;
    if (timer) clearInterval(timer);
    switch (mode) {
      case 'manLoop':
        timer['timer'] = setInterval(function() {
          timer['result'] = getRandomNumber(memberNumber, depends);
          callback(timer['result']);
        }, 200);
        break;
      case 'rewardsLoop':
        timer['timer'] = setInterval(function() {
          timer['result'] = getRandomReward(rewards, memberNumber, true, depends);
          callback(timer['result']);
        }, 200);
        break;
    }
  }

  function stopLoop(callback) {
    clearInterval(timer['timer']);
    callback(timer['result']);
  }

  function init_view(data) {
    /* init HTML data view */
  }

})(this, /* indexedDB packaging API */
  (function (global) {
    var __dbStorage__ = {};
    __dbStorage__.open = function(name, callback) {};
    __dbStorage__.Collection = function(name) {};
		
    var Collection = __dbStorage__.Collection;
    Collection.prototype.insert = function() {};
    Collection.prototype.remove = function() {};
    Collection.prototype.update = function() {};
    Collection.prototype.get = function() {};

    __dbStorage__.down_localStorage = (function(global) {
      /* if serious error happens to indexedDB, down to localStorage */
      var storage;
      return storage;
    })(global);

    /* init variables */
    //global.$ = function(id) {return document.getElementById(id);};

    /* return the storage object */
    return __dbStorage__;
})(this), (function() { return function(id) { return document.querySelector(id); }; })());
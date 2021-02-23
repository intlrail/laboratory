/*!
 * world.guide.js
 * Queue up messages that will be displayed on the main screen.
 *
 * https://github.com/anvoz/world-js
 * Copyright (c) 2013-2014 An Vo - anvo4888@gmail.com
 * Licensed under MIT (http://www.opensource.org/licenses/mit-license.php)
 */

define(function() {

  'use strict';


  // Guide constructor
  var Guide = function(world) {
    var worldGuide = this;

    // Store reference of a world
    worldGuide.world = world;

    worldGuide.$container = undefined;
    worldGuide.queue      = [];
  };


  // Set guide container
  // $container: jQuery element
  Guide.prototype.setContainer = function($container) {
    this.$container = $container;
  };


  // Show guide message
  // message: message content
  // ytl:     message's year to live
  Guide.prototype.show = function(message, ytl) {
    var worldGuide  = this;
    var world       = worldGuide.world;

    if (typeof message !== 'undefined') {
      // Add message to queue
      worldGuide.queue.push({ message: message, ytl: ytl });
      if (worldGuide.queue.length == 1) {
        worldGuide.show();
      }
    } else {
      // Show first message in queue
      if (worldGuide.queue.length > 0) {
        var item        = worldGuide.queue[0];
        var hiddenYear  = world.statistic.year + item.ytl;

        worldGuide.$container.html(item.message).animate({ bottom: 0 }, 400);

        world.event.add('yearPassed', 'guide', function() {
          var world = this;
          if (world.statistic.year >= hiddenYear) {
            world.guide.hide();
            world.event.remove('yearPassed', 'guide');
          }
        });
      }
    }
  };


  // Hide guide message
  Guide.prototype.hide = function() {
    var worldGuide  = this;
    var world       = worldGuide.world;
    var $container  = worldGuide.$container;

    $container.animate({ bottom: -$container.outerHeight() }, 400, 'swing', function() {
      // Remove from queue
      worldGuide.queue.shift();
      // Show next item in queue
      worldGuide.show();
    });
  };


  return Guide;

});

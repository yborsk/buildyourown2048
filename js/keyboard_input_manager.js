// js/keyboard_input_manager.js
function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    // Internet Explorer 10 style
    this.eventTouchstart = "MSPointerDown";
    this.eventTouchmove  = "MSPointerMove";
    this.eventTouchend   = "MSPointerUp";
  } else {
    this.eventTouchstart = "touchstart";
    this.eventTouchmove  = "touchmove";
    this.eventTouchend   = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  // Map of keys to directions
  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };

  // ---------- NEW: input detection helpers ----------
  function isTextTarget(t) {
    if (!t) return false;
    var tag = t.tagName;
    if (!tag) return !!t.isContentEditable;
    tag = tag.toUpperCase();
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      t.isContentEditable
    );
  }

  // Shield: stop key events that originate in inputs at the capture phase,
  // so they never reach game handlers (or other bubbling listeners).
  document.addEventListener(
    "keydown",
    function (e) {
      if (isTextTarget(e.target)) {
        // Allow normal typing; just stop the event from escaping the field
        // so the game can't see it.
        e.stopPropagation();
        return; // DO NOT preventDefault here—let the field receive the key.
      }
    },
    true // <-- capture
  );

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    // ---------- NEW: bail out if user is typing ----------
    if (isTextTarget(event.target)) return;

    var modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  // Listen to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches && event.targetTouches.length > 1) {
      return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches && event.targetTouches.length > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDX = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDY = Math.abs(dy);

    if (Math.max(absDX, absDY) > 10) {
      // (right : left) : (down : up)
      self.emit("move", absDX > absDY ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });

  // Restart button
  var retry = document.getElementsByClassName("retry-button")[0];
  retry.addEventListener("click", this.restart.bind(this));
  retry.addEventListener(this.eventTouchend, this.restart.bind(this));

  // Keep playing button
  var keepPlaying = document.getElementsByClassName("keep-playing-button")[0];
  keepPlaying.addEventListener("click", this.keepPlaying.bind(this));
  keepPlaying.addEventListener(this.eventTouchend, this.keepPlaying.bind(this));
};

// Restart button (New Game)
var retry = document.getElementsByClassName("retry-button")[0];
if (retry) {
  retry.addEventListener("click", this.restart.bind(this));
  retry.addEventListener(this.eventTouchend, this.restart.bind(this));
}

// Keep playing button
var keepPlaying = document.getElementsByClassName("keep-playing-button")[0];
if (keepPlaying) {
  keepPlaying.addEventListener("click", this.keepPlaying.bind(this));
  keepPlaying.addEventListener(this.eventTouchend, this.keepPlaying.bind(this));
}


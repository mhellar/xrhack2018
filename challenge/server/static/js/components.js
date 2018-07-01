AFRAME.registerComponent('axis-controls', {
  init: function () {
    this.axisMoved = this.axisMoved.bind(this);
    this.el.addEventListener('axismove', this.axisMoved);
  },

  axisMoved: function(evt) {
    if (evt.detail.changed[0] || evt.detail.changed[1]) {
      console.log('axismove', evt, evt.detail.axis, evt.detail.changed);
      const player = this.el.sceneEl.querySelector('#player');
      let rotation = player.getAttribute('rotation');
      let position = player.getAttribute('position');
      if (evt.detail.changed[0]) {
        rotation.y += evt.detail.axis[0] * 5;
      }
      if (evt.detail.changed[1]) {
        position.y = 1.6;
        position.z += evt.detail.axis[1];
      }
      console.log('position', position, 'rotation', rotation);
      player.setAttribute('position', position);
      player.setAttribute('rotation', rotation);
    }
  }
});

AFRAME.registerComponent('interactive-photo', {
  init: function() {
    this.itemSelected = this.itemSelected.bind(this);
    this.el.addEventListener('pie-menu-item-selected', this.itemSelected);
    this.grabStart = this.grabStart.bind(this);
    this.grabEnd = this.grabEnd.bind(this);
    this.el.addEventListener('grab-start', this.grabStart);
    this.el.addEventListener('grab-end', this.grabEnd);
  },

  itemSelected: function(evt) {
    console.log('pie-menu-item-selected', evt);
    switch (evt.detail.src) {
    case '#trash':
      this.el.parentNode.removeChild(this.el);
      break;
    case '#analyze':
      break;
    case '#move':
      console.log(this.el);
      this.el.setAttribute('grabbable', '');
      this.el.setAttribute('stretchable', '');
      const image = document.createElement('a-image');
      image.classList.add('moveable');
      image.setAttribute('src', '#move');
      this.el.appendChild(image);
      break;
    }
  },

  grabStart: function(evt) {
    if (this.el.hasAttribute('grabbable')) {
      this.el.isMoving = true;
    }
  },

  grabEnd: function(evt) {
    console.log('interactive-photo grab-end', evt, this.el.isMoving);
    if (this.el.isMoving && this.el.hasAttribute('grabbable')) {
      this.el.removeAttribute('grabbable');
      this.el.removeAttribute('stretchable');
      this.el.removeChild(this.el.querySelector('.moveable'));
    }
    this.el.isMoving = false;
  },

  remove: function() {
    this.el.removeEventListener('pie-menu-item-selected', this.itemSelected);
  }
});

AFRAME.registerComponent('pie-menu-item', {
  dependencies: ['hoverable'],
});

AFRAME.registerComponent('pie-menu', {
  dependencies: ['clickable'],

  schema: {
    items: {
      type: 'array'
    },
    size: {
      type: 'float',
      default: 0.25
    },
    radius: {
      type: 'float',
      default: 1
    }
  },

  init: function() {
    this.start = this.start.bind(this);
    this.end = this.end.bind(this);
    this.itemStart = this.itemStart.bind(this);
    this.itemEnd = this.itemEnd.bind(this);
    this.el.addEventListener('grab-start', this.start);
    this.el.addEventListener('grab-end', this.end);
    this.el.addEventListener('hover-start', this.itemStart);
    this.el.addEventListener('hover-end', this.itemEnd);
  },

  start: function(evt) {
    if (this.el.hasAttribute('grabbable')) { return; }
    console.log('grab-start', evt, evt.detail, this, this.data, this.data.items);
    let angle = Math.PI / 2;
    for (let item of this.data.items) {
      const image = document.createElement('a-image');
      image.setAttribute('hoverable');
      image.setAttribute('pie-menu-item', '');
      image.setAttribute('src', item);
      image.setAttribute('position', `${this.data.radius * Math.cos(angle)} ${this.data.radius * Math.sin(angle)} 0`);
      image.setAttribute('width', this.data.size);
      image.setAttribute('height', this.data.size);
      this.el.appendChild(image);

      angle += 2 * Math.PI / this.data.items.length;
    }
  },

  end: function(evt) {
    if (this.el.hasAttribute('grabbable')) { return; }
    console.log('grab-end', evt);
    for (let child of this.el.querySelectorAll('[pie-menu-item]')) {
      this.el.removeChild(child);
    }
    if (this.itemSelected) {
      const event = new CustomEvent('pie-menu-item-selected', {bubbles: true, detail: {src: this.itemSelected}});
      this.el.dispatchEvent(event);
      this.itemSelected = null;
    }
  },

  itemStart: function(evt) {
    console.log('hover-start', evt.target.getAttribute('src'));
    if (evt.target.hasAttribute('pie-menu-item')) {
      this.itemSelected = evt.target.getAttribute('src');
    }
  },

  itemEnd: function(evt) {
    console.log('hover-end', evt.target.getAttribute('src'));
    if (evt.target.hasAttribute('pie-menu-item')) {
      this.itemSelected = null;
    }
  },

  remove: function() {
    this.el.removeEventListener('grab-start', this.start);
    this.el.removeEventListener('grab-end', this.end);
    this.el.removeEventListener('hover-start', this.start);
    this.el.removeEventListener('hover-end', this.end);
  }
});

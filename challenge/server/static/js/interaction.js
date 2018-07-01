AFRAME.registerComponent('collider-check', {
  dependencies: ['raycaster'],

  init: function () {
    console.log('initializing raycaster event listener on ', this.el);
    this.el.addEventListener('raycaster-intersection', function (event) {
      console.log('Player hit something!', event.detail.intersections);
    });
  }
});
console.log('collider-check component registered');

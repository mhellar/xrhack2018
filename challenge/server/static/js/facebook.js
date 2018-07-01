const initFB = function() {
  FB.init({
    appId            : '631151373911315',
    autoLogAppEvents : true,
    xfbml            : true,
    version          : 'v3.0'
  });
  checkFBLoginState();
};

let prompted = false;

const checkFBLoginState = function() {
  FB.getLoginStatus(function(response) {
    if (response.status != 'connected') {
      $('.fb-logout-button').hide();
    } else {
      $('.fb-logout-button').show();
      if (prompted) {
        $('#loader').hide();
        initScene();
      }
    }
    prompted = true;
  });
};

const logout = function() {
  FB.logout(function(response) {
    checkFBLoginState();
  });
};

const initScene = function() {
  var scene = document.querySelector('a-scene');

  if (scene.hasLoaded) {
    FB.api('/me/photos', {type: 'uploaded',fields: 'id,name,created_time,images'}, function(response) {
      // console.log(response);
      let i = 0;
      for (let photo of response.data) {
        // console.log(photo);
        for (let image of photo.images) {
          if (image.width >= 300 && image.width < 400) {
            var $aimage= $(`<a-entity class="photo" clickable interactive-photo pie-menu="items: #analyze, #move, #trash"><a-image src="${image.source}"></a-image></a-entity>`);
            console.log('image:', i);
            $aimage.attr('position', `${i*1.5} 2 -1`);
            $('a-scene').prepend($aimage);
            break;
          }
        }
        i += 1;
      }
    });
    console.log('ready to go!');
  } else {
    scene.addEventListener('loaded', initScene);
  }
};

$(document).ready(function() {
  if (window.FB) {
    initFB();
  } else {
    window.fbAsyncInit = initFB;
  }
});

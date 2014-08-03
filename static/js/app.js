(function () {
  var app = angular.module('geaden', ['geaden-directives', 'toaster']);

  app.controller('GeadenController', ['$http', '$log', function ($http, $log) {
    me = this;
    me.info = {};

    $http.get('/data/me.json').success(function(data) {
      me.info = data;
    })

    $(window).scroll(function() {
      if ($(this).scrollTop() >= 100) {   // If page is scrolled more than 50px
          $('#up').fadeIn(400);           // Fade in the arrow
      } else {
          $('#up').fadeOut(400);          // Else fade out the arrow
      }
    });

    $('#up').click(function() {           // When arrow is clicked
      $('body,html').animate({
        scrollTop : 0                     // Scroll to top of body
      }, 500);
    });

    // Show content when loading finished
    Pace.once('done', function() {
      $('.content').fadeIn(1000);
      $('.content').removeClass('loading');
    });  
  }]);
})();

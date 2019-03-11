/* GENRERAL
----------------------------------------------------------------------------------------------------*/
$(document).ready(function() {

	$('[data-maxvien="menu"]').superfish({
		popUpSelector: '.sub',
		hoverClass:    'hover',
		animation:   {height:'show'},
		animationOut:  {height:'hide'},
		speed:         'fast',
		speedOut:      'fast'
	});
});

$(document).ready(function() {
	
    $('[data-toggle="tooltip"]').tooltip();
});

/* SITE-MOBILE-NAV
----------------------------------------------------------------------------------------------------*/
$(document).ready(function() {
	
	$('.site-mobile-nav .nav-close').click(function(event) {

		$('.block-slideshow .spotlights').show();
		
		$('.site-wrapper').animate({
			'margin-left': '0%'
		}, 500, 'easeInOutExpo');
	});

	$('[data-maxvien="mobile-nav"]').click(function(event) {

		if($('.site-wrapper').css('margin-left') == '0px') {
		
			$('.site-wrapper').animate({
				'margin-left': '-80%'
			}, 500, 'easeInOutExpo');

		} else {
			
			$('.site-wrapper').animate({
				'margin-left': '0%'
			}, 500, 'easeInOutExpo');
		}
	});

	$(window).resize(function(event) {
		
		if(Modernizr.mq('(min-width: 768px)')) {
            $('.site-wrapper').css('margin-left', '0%');
        }
	});

	$('.site-mobile-nav .main-menu li').children('.toggle').click(function(event) {

		if($(this).parent().children('.sub-menu').css('display') == 'block') {
			$(this).parent().children('.sub-menu').slideUp(500);
			$(this).removeClass('active');
		} else {
			$(this).parent().parent().find('.toggle').removeClass('active');
			$(this).parent().parent().find('.sub-menu').slideUp(500);
			$(this).parent().children('.sub-menu').slideDown(500);
			$(this).addClass('active');
		}
	});

});
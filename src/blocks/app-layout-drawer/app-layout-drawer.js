var block = this;

function showDrawer() {
  $().debounce(function () {
    $(block).removeClass('app-layout-drawer--hidden');
  });
}

function hideDrawer() {
  $().debounce(function () {
    $(block).addClass('app-layout-drawer--hidden');
  });
}

$(block).find('[data-drawer]').click(function () {
  return $(block).hasClass('app-layout-drawer--hidden') ? showDrawer() : hideDrawer();
});

$('.app-layout-drawer__drawer').clickOutside(function () {
  hideDrawer();
});

$(window).media('(min-width: 768px)', function (matches) {
  return (matches) ? hideDrawer() : null;
});

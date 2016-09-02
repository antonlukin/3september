$(function() {

    $( '#calendar' ).bookblock({
        orientation : 'horizontal',
        circular	: true,
    });

    $('#calendar').click(function() {
        $('#calendar').bookblock('next');
    })
});
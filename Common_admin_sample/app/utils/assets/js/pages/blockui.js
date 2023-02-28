$(document).ready(function() {

    "use strict";
    $('#ciFormModalBtn').on('click', function() {
        $('#ciFormModal').block({
            message: '<div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div>',
            timeout: 2000
        });

    });

    $('#blockui-2').on('click', function() {
        $.blockUI({
            message: '<div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div>',
            timeout: 2000
        });
    });

});
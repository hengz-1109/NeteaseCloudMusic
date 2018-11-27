function alert_info(text) {  
    $(".alert_modal").remove();
    $("body").append('<div class="modal fade alert_modal" id="alertModal"'
                        +' data-backdrop="static" data-role="dialog" aria-labelledby="alertModalLabel" aria-hidden="true">'
                        +'<div class="modal-dialog">'
                            +'<div class="modal-content">'
                                +'<div class="modal-header" style="padding: 10px 15px 25px 15px;border:none;padding:0px;height:30px;">'
                                    +'<button type="button" style="margin:5px 5px 0 0;" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
                                +'</div>'
                                +'<div class="modal-body" style="color:black;text-align: center;font-size: 1.6em;height:60px;line-height:35px;padding:0px;">'
                                    +text+'</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>');
    $("#alertModal").modal("show");
    setTimeout(function(){
        $("#alertModal").modal("hide");
    },1000);
}


function printFunc() {
    // var divToPrint = $('#print_area');
    // var htmlToPrint = '';
    // htmlToPrint += divToPrint.html();
    // console.log(htmlToPrint)
    var wo_id = $('#wo_id').text();
    var print_data = $('#print_data').text();
    console.log(print_data)

    // 3. execute send_printer_data on server side
    $.ajax({
        type:     "get",
        cache:    false,
        url:      "/send_print_data/"+wo_id,
        dataType: "text",
        error: function(xhr, status, error) {
            console.log(xhr, error, status)
            alert('Error: ' + error);
        },
        success: function () {
            alert("Print Done ! ");
        }
    })

    // 2. send to local prozy
    // $.post('http://localhost:8000/print',
    //     {'printer_data': print_data},
    //     function(data, status){
    //         alert("Data: " + data + "\nStatus: " + status);
    //     }
    // )


    // 1. open browser tab
    // newWin = window.open("");
    // newWin.document.write(htmlToPrint);
    // newWin.print();
    // newWin.close();
}

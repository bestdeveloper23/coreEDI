import 'jquery/dist/jquery.min';
import 'jQuery.print/jQuery.print.js';
import { jsPDF } from "jspdf";
// import { autoTable } from 'jspdf-autotable';
const XLSX = require("xlsx");
import { BaseService } from "../base-service.js";
const baseService = new BaseService();
(function ($) {
    $.fn.extend({
        tableHTMLExport: function (options) {

            var defaults = {
                separator: ',',
                newline: '\r\n',
                ignoreColumns: '',
                ignoreRows: '',
                type: 'csv',
                htmlContent: false,
                consoleLog: false,
                trimContent: true,
                quoteFields: true,
                filename: 'tableHTMLExport.csv'
            };
            var options = $.extend(defaults, options);


            function quote(text) {
                return '"' + text.replace('"', '""') + '"';
            }


            function parseString(data) {

                if (defaults.htmlContent) {
                    content_data = data.html().trim();
                } else {
                    content_data = data.text().trim();
                }
                return content_data;
            }

            function download(filename, text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            }

            /**
             * Convierte la tabla enviada a json
             * @param el
             * @returns {{header: *, data: Array}}
             */
            function toJson(el) {

                var jsonHeaderArray = [];
                $(el).find('thead').find('tr').not(options.ignoreRows).each(function () {
                    var tdData = "";
                    var jsonArrayTd = [];

                    $(this).find('th').not(options.ignoreColumns).each(function (index, data) {
                        if ($(this).css('display') != 'none') {
                            jsonArrayTd.push(parseString($(this)));
                        }
                    });
                    jsonHeaderArray.push(jsonArrayTd);

                });

                var jsonArray = [];
                $(el).find('tbody').find('tr').not(options.ignoreRows).each(function () {
                    var tdData = "";
                    var jsonArrayTd = [];

                    $(this).find('td').not(options.ignoreColumns).each(function (index, data) {
                        if ($(this).css('display') != 'none') {
                            jsonArrayTd.push(parseString($(this)));
                        }
                    });
                    jsonArray.push(jsonArrayTd);

                });


                return { header: jsonHeaderArray[0], data: jsonArray };
            }


            /**
             * Convierte la tabla enviada a csv o texto
             * @param table
             * @returns {string}
             */
            function toCsv(table) {
                var output = "";

                var rows = table.find('tr').not(options.ignoreRows);

                var numCols = rows.first().find("td,th").not(options.ignoreColumns).length;

                rows.each(function () {
                    $(this).find("td,th").not(options.ignoreColumns)
                        .each(function (i, col) {
                            var column = $(col);

                            // Strip whitespaces
                            var content = options.trimContent ? $.trim(column.text()) : column.text();

                            output += options.quoteFields ? quote(content) : content;
                            if (i !== numCols - 1) {
                                output += options.separator;
                            } else {
                                output += options.newline;
                            }
                        });
                });

                return output;
            }


            var el = this;
            var dataMe;
            if (options.type == 'csv' || options.type == 'txt') {


                var table = this.filter('table'); // TODO use $.each

                if (table.length <= 0) {
                    throw new Error('tableHTMLExport must be called on a <table> element')
                }

                if (table.length > 1) {
                    throw new Error('converting multiple table elements at once is not supported yet')
                }

                dataMe = toCsv(table);

                if (defaults.consoleLog) {

                }

                download(options.filename, dataMe);


                //var base64data = "base64," + $.base64.encode(tdData);
                //window.open('data:application/'+defaults.type+';filename=exportData;' + base64data);
            }
            return this;
        }
    });
})(jQuery);


(function ($) {
    $.fn.extend({
        //NormanScott added for spreadsheet
        download: async function (uri, name) {
            const link = document.createElement("a");
            link.download = name;
            const data = await fetch(uri).then((res) => res.blob())
            link.href = window.URL.createObjectURL(
                new Blob([data], { type: 'application/xlsx' })
            );
            link.click();
            link.remove();
            window.URL.revokeObjectURL(link.href);
        },
        //Insertion point end
        tableToXlsx: async function (options) {

            var defaults = {
                separator: ',',
                newline: '\r\n',
                ignoreColumns: '',
                ignoreRows: '',
                type: 'xlsx',
                htmlContent: false,
                consoleLog: false,
                trimContent: true,
                quoteFields: true,
                filename: 'SpreadSheet.xlsx'
            };
            var options = $.extend(defaults, options);

            if (options.type == 'xlsx' || options.type == 'xls') {

                var table = this.filter('table'); // TODO use $.each

                if (table.length <= 0) {
                    throw new Error('tableHTMLExport must be called on a <table> element')
                }

                if (table.length > 1) {
                    throw new Error('converting multiple table elements at once is not supported yet')
                }

                const ignorekeys = ["!cols", "!fullref", "!merges", "!ref", "!rows"];

                var ws1 = XLSX.utils.table_to_sheet(table[0]);
                var ws2 = XLSX.utils.table_to_sheet(table[0]);

                var wb = XLSX.utils.book_new();

                var new_ws1 = Object.keys(ws1).reduce((ret, key) => {
                    return ignorekeys.includes(key) || ws1[key].t === 'z'
                        ? { ...ret, [key]: ws1[key] }
                        : { ...ret, [key]: { ...ws1[key], f: `'Raw Data'!${key}` } }
                }, {});

                XLSX.utils.book_append_sheet(wb, new_ws1, 'Sales Export');
                XLSX.utils.book_append_sheet(wb, ws2, 'Raw Data');

                const supportsFileSystemAccess = 'showSaveFilePicker' in window && (() => {
                    try {
                        return window.self === window.top;
                    } catch {
                        return false;
                    }
                })();

                if (supportsFileSystemAccess) {
                    try {
                        const handle = await showSaveFilePicker({
                            suggestedName: options.filename,
                            type: [{
                                description: 'XLSX file',
                                accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ['.xlsx', '.xls'] }
                            }]
                        });

                        const u8 = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
                        const data = new Blob([u8], { type: "application/vnd.ms-excel" });
                        const writable = await handle.createWritable();
                        await writable.write(data);
                        await writable.close();
                        return;
                    } catch (err) {
                        if (err.name == 'AbortError') {
                            return;
                        }
                    }
                }

                XLSX.writeFileXLSX(wb, options.filename);
            }
            return this;
        },
        //NormanScott added for spreadsheet
        tableToSpreadSheet: async function (options) {
            const supportsFileSystemAccess = 'showSaveFilePicker' in window && (() => {
                try {
                    return window.self === window.top;
                } catch {
                    return false;
                }
            })();

            if (supportsFileSystemAccess) {
                try {
                    const handle = await showSaveFilePicker({
                        suggestedName: options.filename,
                        type: [{
                            description: 'XLSX file',
                            accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ['.xlsx', '.xls'] }
                        }]
                    });
                    const sheet = await fetch("downloads/Template Files/" + options.filename).then(resp => resp.blob());
                    const data = new Blob([sheet], { type: "application/vnd.ms-excel" });
                    const writable = await handle.createWritable();
                    await writable.write(data);
                    await writable.close();
                    swal({
                        title: "Success",
                        html: "<div id=\"swal2-content\" class=\"swal2-content\" style=\"display: block;\">SpreadSheet Created Successfully!<br>Would you like to open SpreadSheet help guide?</div>",
                        type: "success",
                        showCancelButton: true,
                        confirmButtonColor: "rgb(140, 212, 245)",
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                    }).then(function (confirm) {
                        if (confirm.value == true)
                            window.open('downloads/SpreadSheetHelpFile.pdf');
                    });
                    return;
                } catch (err) {
                    if (err.name == 'AbortError') {
                        return;
                    }
                }
            }
        }
    });
    //Insertion point end
})(jQuery);

export class UtilityService {
  exportReportToCsvTable = function (tableName, filename, type) {
    $("#" + tableName).tableHTMLExport({
      type: "csv",
      filename: filename,
    });
    $(".fullScreenSpin").css("display", "none");
  };
  exportReportToSpreadSheet = function (tableName, filename, type) {
    $("#" + tableName).tableToSpreadSheet({
      type: "xlsx",
      filename: filename,
    });
    $(".fullScreenSpin").css("display", "none");
  };
  exportReportToXLSX = function (tableName, filename, type) {
    $("#" + tableName).tableToXlsx({
      type: "xlsx",
      filename: filename,
    });
    $(".fullScreenSpin").css("display", "none");
  };

  // exportReportToSpreadSheet = function (tableName, filename, type) {
  //     $("#" + tableName).tableToSpreadSheet({
  //         type: 'xlsx',
  //         filename: filename,
  //     });
  //     $('.fullScreenSpin').css('display', 'none');
  // }

  exportReportToCsv = function (rows, filename, type) {
    let processRow = function (row) {
      let finalVal = "";
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null ? "" : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
        if (j > 0) finalVal += ",";
        finalVal += result;
      }
      return finalVal + "\n";
    };
    let csvFile = "";
    if (type === "xls") {
      csvFile = "sep=," + "\n";
    }
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
      }
    }

    let fileType = "text/csv;charset=utf-8;";
    if (type === "xls") {
      fileType = "text/xls;charset=utf-8;";
    }

    let blob = new Blob([csvFile], { type: fileType });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  exportToCsv = function (rows, filename, type) {
    let processRow = function (row) {
      let finalVal = "";
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null ? "" : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
        if (j > 0) finalVal += ",";
        finalVal += result;
      }
      return finalVal + "\n";
    };
    let csvFile = "";
    if (type === "xls") {
      csvFile = "sep=," + "\n";
    }
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
      }
    }

    let fileType = "text/csv;charset=utf-8;";
    if (type === "xls") {
      fileType = "text/xls;charset=utf-8;";
    }

    let blob = new Blob([csvFile], { type: fileType });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  exportToPdf = function (id, filename, rows, rows1) {
    let doc = new jsPDF();
    const totalPagesExp = "{total_pages_count_string}";
    //HEADER
    const pageContent = function (data) {
      doc.setFontSize(22);
      doc.setTextColor(30);
      doc.setFontStyle("Roboto Mono");
      doc.text(filename, 16, 20);
      doc.setDrawColor(0, 123, 169);
      doc.setLineWidth(1);
      doc.line(15, 25, 195, 25);
      let str =
        filename +
        " | " +
        loggedCompany +
        " | " +
        moment().format("DD MMM YYYY");
      let str1 = "Page " + data.pageCount;
      if (typeof doc.putTotalPages === "function") {
        str1 = str1 + " of " + totalPagesExp;
      }
      doc.setDrawColor(0, 123, 169);
      doc.setLineWidth(1);
      doc.line(15, 285, 195, 285);
      doc.setFontSize(10);
      doc.text(str, 16, 289);
      doc.text(str1, 175, 289);
    };
    let options = {
      addPageContent: pageContent,
      theme: "plain",
      showHeader: "everyPage",
      showFooter: "everyPage",
      margin: {
        top: 30,
      },
      startY: 70,
      font: "courier",
      drawRow: (row, data) => {
        if (filename == "Cash Summary") {
          if (
            row.index === 0 ||
            row.index === 2 ||
            row.index === 3 ||
            row.index === 10 ||
            row.index === 11 ||
            row.index === 12 ||
            row.index === data.table.rows.length - 2 ||
            row.index === data.table.rows.length - 1
          ) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
        }
        if (filename == "Balance Sheet") {
          if (
            row.index === 0 ||
            row.index === 6 ||
            row.index === 9 ||
            row.index === 10 ||
            row.index === 17 ||
            row.index === 18 ||
            row.index === 19 ||
            row.index === 25 ||
            row.index === 26 ||
            row.index === 30 ||
            row.index === 33 ||
            row.index === 36 ||
            row.index === 37 ||
            row.index === 50 ||
            row.index === 51 ||
            row.index === data.table.rows.length - 2 ||
            row.index === data.table.rows.length - 1
          ) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
        }
        if (filename == "Movements in Equity") {
          if (
            row.index === 0 ||
            row.index === 1 ||
            row.index === data.table.rows.length - 2 ||
            row.index === data.table.rows.length - 1
          ) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
        }
        if (
          filename == "Profit & Loss" ||
          filename == "General Ledger Summary" ||
          filename == "Journal Report" ||
          filename == "Bank Summary" ||
          filename == "Income By Contact" ||
          filename == "Expenses By Contact" ||
          filename === "Payable Invoice Summary" ||
          filename === "Payable Invoice Detail" ||
          filename === "Inventory Item Details"
        ) {
          for (let cell in row.cells) {
            row.cells[cell].styles.lineWidth = 0.01;
            row.cells[cell].styles.lineColor = 20;
          }
          if (row.index === data.table.rows.length - 1) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
        }
        if (filename == "Budget Variance") {
          if (
            row.index === 0 ||
            row.index === 2 ||
            row.index === 3 ||
            row.index === 6 ||
            row.index === 8 ||
            row.index === 9
          ) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
          if (row.index === 5) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontSize = 12;
              row.cells[cell].styles.lineWidth = 0.01;
              row.cells[cell].styles.cellPadding = 1.7638888888888886;
            }
          }
        }
        if (filename == "Executive Summary") {
          if (row.index === 0 || row.index === 5) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
              row.cells[cell].styles.textColor = "#337ab7";
              row.cells[cell].styles.fontSize = 12;
            }
          }
        }
        if (filename == "Statement of Cash Flows") {
          if (row.index === 3 || row.index === 6) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
          if (row.index === 4 || row.index === 7) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
              row.cells[cell].styles.fontSize = 12;
              row.cells[cell].styles.cellPadding = 2;
              row.cells[cell].styles.columnWidth = 5;
            }
          }
        }
        if (filename == "Foreign Currency Gains and Losses") {
          if (row.index === 0 || row.index === 3) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
          if (row.index === 2 || row.index === 5) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
              row.cells[cell].styles.fontSize = 10;
              row.cells[cell].styles.cellPadding = 2;
              row.cells[cell].styles.columnWidth = 5;
            }
          }
        }
        if (filename == "Management Report") {
          if (
            row.index === 0 ||
            row.index === 3 ||
            row.index === 11 ||
            row.index === 12
          ) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
          if (
            row.index === 2 ||
            row.index === 10 ||
            row.index === data.table.rows.length - 2 ||
            row.index === data.table.rows.length - 1
          ) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
              row.cells[cell].styles.fontSize = 12;
              row.cells[cell].styles.cellPadding = 1.7638888888888886;
            }
          }
        }
        if (filename == "Sales By Item") {
          for (let cell in row.cells) {
            row.cells[cell].styles.lineWidth = 0.01;
            row.cells[cell].styles.lineColor = 20;
          }
          if (row.index === 0 || row.index === data.table.rows.length - 1) {
            for (let cell in row.cells) {
              row.cells[cell].styles.fontStyle = "bold";
            }
          }
        }
      },
    };
    //Title
    doc.setFontSize(18);
    doc.setTextColor(0, 123, 169);
    doc.setFontStyle("Roboto Mono");
    doc.text(loggedCompany, 75, 40);
    if (rows.length < 15) {
      doc.text(rows, 82, 50);
      doc.text(rows1, 85, 60);
    } else if (rows.length >= 15 && rows.length < 20) {
      doc.text(rows, 77, 50);
      doc.text(rows1, 85, 60);
    } else if (rows.length >= 20 && rows.length < 28) {
      doc.text(rows, 70, 50);
      doc.text(rows1, 85, 60);
    } else if (rows.length >= 28 && rows.length < 35) {
      doc.text(rows, 65, 50);
      doc.text(rows1, 85, 60);
    } else {
      doc.text(rows, 50, 50);
      doc.text(rows1, 85, 60);
    }
    //table
    if (document.getElementById(id)) {
      let res = doc.autoTableHtmlToJson(document.getElementById(id));
      // doc.autoTable(res.columns, res.data, options);
    } else {
      //header
      doc.setFontSize(22);
      doc.setTextColor(30);
      doc.setFontStyle("Roboto Mono");
      doc.text(filename, 16, 20);
      doc.setDrawColor(0, 123, 169);
      doc.setLineWidth(1);
      doc.line(15, 25, 195, 25);
      //title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(22);
      doc.text("No Data", 90, 70);
      //footer
      let str =
        filename +
        " | " +
        loggedCompany +
        " | " +
        moment().format("DD MMM YYYY");
      let str1 = "Page 1 of 1";
      doc.setDrawColor(0, 123, 169);
      doc.setLineWidth(1);
      doc.line(15, 285, 195, 285);
      doc.setFontSize(10);
      doc.text(str, 16, 289);
      doc.text(str1, 175, 289);
    }
    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }
    doc.save(loggedCompany + "-" + filename + ".pdf");
  };

  tableToExcel = (function () {
    var uri = "data:application/vnd.ms-excel;base64,",
      template =
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
        'xmlns="http://www.w3.org/TR/REC-html40"><head>' +
        "<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>" +
        "{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>" +
        "</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->" +
        "</head><body><table>{table}</table></body></html>",
      base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)));
      },
      format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
          return c[p];
        });
      };
    return function (table, name, filename) {
      if (!table.nodeType) table = document.getElementById(table);
      jQuery.get("/css/export-excel.css", function (data) {
        let tableData = "<style>" + data + "</style>" + table.innerHTML;
        var ctx = { worksheet: name || "Worksheet", table: tableData };
        document.getElementById("dlink").href =
          uri + base64(format(template, ctx));
        document.getElementById("dlink").download = filename;
        document.getElementById("dlink").traget = "_self";
        document.getElementById("dlink").click();
      });
    };
  })();

  exportTableToExcel = function (tableID, filename) {
    var downloadLink;
    var dataType = "application/vnd.ms-excel";
    var tableSelect = document.getElementById(tableID);
    var tobeReplaced = '<td style="border-bottom:1px solid #000"';
    tableSelect = tableSelect.outerHTML.replace(/<td/g, tobeReplaced);
    var tableHTML = tableSelect.replace(/ /g, "%20");
    jQuery.get("/css/export-excel.css", function (data) {
      let tableData = "<style>" + data + "</style>" + tableHTML;
      // Specify file name
      filename = filename ? filename + ".xls" : "excel_data.xls";

      // Create download link element
      downloadLink = document.createElement("a");

      document.body.appendChild(downloadLink);

      if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(["\ufeff", tableData], {
          type: dataType,
        });
        navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        // Create a link to the file
        downloadLink.href = "data:" + dataType + ", " + tableData;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
        downloadLink.click();
      }
    });
  };

  showUploadedAttachment = function (myFiles, custid = "") {
    let empName = localStorage.getItem("mySession");
    let elementToAdd = "";
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i].fields;
      let elementForItem =
        '<div class="uploaded-element"  id="attachment-name-' +
        i +
        '"><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-name"><span> ' +
        myFile.AttachmentName +
        "</span>" +
        '<span class="uploaded-on">File upload by ' +
        empName +
        ' </span></div><div class="caret-down-icon remove-attachment"><i class="fa fa-times" id="remove-attachment-' +
        i +
        '"></i></div> </div>';
      elementToAdd = elementToAdd + elementForItem;
    }
    let imagetoDisplay = '';
    if(myFiles[0].fields.Description.startsWith("image/")){
        imagetoDisplay = '<div class="col inboxcol1"><img src=data:'+myFiles[0].fields.Description+';base64,'+myFiles[0].fields.Attachment+' style="width:100%;"></div>';
      $('.divImageLoad').html(imagetoDisplay);
    }else{
      imagetoDisplay = `<div class="col inboxcol1">
          <img src="/icons/nofiles_icon.jpg" class="" style="width:100%;">
      </div>
      <div class="col inboxcol2" style="text-align: center;">
          <div>Upload files or add files from the file library.</div>
          {{#if isMobileDevices}}
              <div>Capture copies of receipt's or take photo's of completed jobs.</div>
          {{/if}}
          <p style="color: #ababab;">Only users with access to your company can view these files</p>
      </div>`;
      $('.divImageLoad').html(imagetoDisplay);
    };

    let elementid = "#file-display";
    if (custid != "") {
      elementid = elementid + "_" + custid;
    }
    $(elementid).html(elementToAdd);
    $(".attchment-tooltip").show();
  };

  showUploadedImage = function (myFiles, custid = "") {
    let empName = localStorage.getItem("mySession");
    let elementToAdd = "";
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i].fields;
      let elementForItem =
        '<div class="uploaded-element" style="width: 100%; padding: 1rem !important;" id="attachment-name-' +
        i +
        '"> <div class="file-name"><img src="' +
        "data:" +
        myFile.Description +
        ";base64," +
        myFile.Attachment +
        '" style="width: 100%;border: 3px solid #fff; box-shadow: 2px 2px 8px rgba(0, 0, 0, .2);">' +
        "</div></div>";
      elementToAdd = elementToAdd + elementForItem;
    }
    let elementid = "#file-display";
    if (custid != "") {
      elementid = elementid + "_" + custid;
    }
    $(elementid).html(elementToAdd);
    $(".attchment-tooltip").show();
  };

  customShowUploadedAttachment = function (myFiles, modalId) {
    let empName = localStorage.getItem("mySession");
    let elementToAdd = "";
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i].fields;
      let elementForItem =
        '<div class="uploaded-element attachment-name-' +
        i +
        '"><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-name"><span> ' +
        myFile.AttachmentName +
        "</span>" +
        '<span class="uploaded-on">File upload by ' +
        empName +
        ' </span></div><div class="caret-down-icon remove-attachment"><i class="fa fa-times remove-attachment-' +
        i +
        '"></i></div> </div>';
      elementToAdd = elementToAdd + elementForItem;
    }
    $("#" + modalId + " .file-display").html(elementToAdd);
    $(".attchment-tooltip").show();
  };

  showUploadedAttachmentTabs = function (myFiles, custid = "") {
    let empName = localStorage.getItem("mySession");
    let elementToAdd = "";
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i].fields;
      let elementForItem =
        '<div class="uploaded-element"  id="attachment-name-' +
        i +
        '"><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-name"><span> ' +
        myFile.AttachmentName +
        "</span>" +
        '<span class="uploaded-on">File upload by ' +
        empName +
        ' </span></div> <div class="caret-down-icon remove-attachment"><i class="fa fa-times" id="remove-attachment-' +
        i +
        '"></i></div></div>';
      elementToAdd = elementToAdd + elementForItem;
    }
    let elementid = "#file-display";
    if (custid != "") {
      elementid = elementid + "_" + custid;
    }
    $(elementid).html(elementToAdd);
    $(".attchment-tooltip").show();
  };

  showUploadedAttachmentJob = function (myFiles) {
    let empName = localStorage.getItem("mySession");
    let elementToAdd = "";
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i].fields;
      let elementForItem =
        '<div class="uploaded-elementJobPOP"  id="attachment-nameJobPOP-' +
        i +
        '"><div class="caret-down-icon remove-attachmentJobPOP"><i class="fa fa-times" id="remove-attachmentJobPOP-' +
        i +
        '"></i></div><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-nameJobPOP"><span> ' +
        myFile.AttachmentName +
        "</span>" +
        '<span class="uploaded-on">File upload by ' +
        empName +
        " </span></div> </div>";
      elementToAdd = elementToAdd + elementForItem;
    }
    $("#file-displayJobPOP").html(elementToAdd);
    $(".attchment-tooltipJobPOP").show();
  };

  showUploadedAttachmentJobNoPOP = function (myFiles) {
    let empName = localStorage.getItem("mySession");
    let elementToAdd = "";
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i].fields;
      let elementForItem =
        '<div class="uploaded-elementJobNoPOP"  id="attachment-nameJobNoPOP-' +
        i +
        '"><div class="caret-down-icon remove-attachmentJobNoPOP"><i class="fa fa-times" id="remove-attachmentJobNoPOP-' +
        i +
        '"></i></div><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-nameJobNoPOP"><span> ' +
        myFile.AttachmentName +
        "</span>" +
        '<span class="uploaded-on">File upload by ' +
        empName +
        " </span></div> </div>";
      elementToAdd = elementToAdd + elementForItem;
    }
    $("#file-displayJobNoPOP").html(elementToAdd);
    $(".attchment-tooltipJobNoPOP").show();
  };

  customAttachmentUpload = async function (
    uploadedFilesArray,
    myFiles,
    saveToTAttachment,
    lineIDForAttachment,
    modalId
  ) {
    let empName = localStorage.getItem("mySession");
    let totalAttachments = uploadedFilesArray.length;
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i];
      let myFileType = myFile.type;
      const loadAttachment = () => {
        return new Promise((resolve) => {
          //first arguement must be an regular array. The array can be of any javascript objects. Array can contain array to make it multi dimensional
          //second parameter must be a BlogPropertyBag object containing MIME property
          let myBlob = new Blob([myFile], { type: myFileType });
          let myReader = new FileReader();
          myReader.readAsDataURL(myBlob);
          //handler executed once reading(blob content referenced to a variable) from blob is finished.
          myReader.addEventListener("loadend", function (e) {
            let base64data = myReader.result.split(",")[1];
            let uploadObject = {
              type: "TAttachment",
              fields: {
                Attachment: base64data,
                AttachmentName: myFile.name,
                Description: myFile.type,
              },
            };
            uploadedFilesArray.push(uploadObject);
            if (!saveToTAttachment) {
              let elementForItem =
                '<div class="uploaded-element attachment-name-' +
                totalAttachments +
                '"><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-name"><span> ' +
                myFile.name +
                "</span>" +
                '<span class="uploaded-on">File upload by ' +
                empName +
                ' </span></div><div class="caret-down-icon remove-attachment"><i class="fa fa-times remove-attachment-' +
                totalAttachments +
                '"></i></div> </div>';
              if (!$(".uploaded-element").length) {
                $("#" + modalId + " .file-display").html(elementForItem);
              } else {
                $("#" + modalId + " .file-display").append(elementForItem);
              }
              $("#new-attachment2-tooltip").show();
            }
            totalAttachments++;
            resolve();
          });
        });
      };
      await loadAttachment();
    }
    let dataObj = {
      totalAttachments: totalAttachments,
      uploadedFilesArray: uploadedFilesArray,
    };
    return dataObj;
  };

  attachmentUpload = async function (
    uploadedFilesArray,
    myFiles,
    saveToTAttachment,
    lineIDForAttachment,
    custid = ""
  ) {
    let empName = localStorage.getItem("mySession");
    let totalAttachments = uploadedFilesArray.length;
    let elementid = "#file-display";
    if (custid != "") {
      elementid = elementid + "_" + custid;
    }
    let base64data = '';
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i];
      let myFileType = myFile.type;

      //first arguement must be an regular array. The array can be of any javascript objects. Array can contain array to make it multi dimensional
      //second parameter must be a BlogPropertyBag object containing MIME property
      let myBlob = new Blob([myFile], { type: myFileType });
      let myReader = new FileReader();
      myReader.readAsDataURL(myBlob);
      //handler executed once reading(blob content referenced to a variable) from blob is finished.
    await  myReader.addEventListener("loadend", function (e) {
         base64data = myReader.result.split(",")[1];
        let uploadObject = {
          type: "TAttachment",
          fields: {
            Attachment: base64data,
            AttachmentName: myFile.name,
            Description: myFile.type,
          },
        };
        uploadedFilesArray.push(uploadObject);
      });
      if (!saveToTAttachment) {
        let elementForItem =
          '<div class="uploaded-element" id="attachment-name-' +
          totalAttachments +
          '"><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-name"><span> ' +
          myFile.name +
          "</span>" +
          '<span class="uploaded-on">File upload by ' +
          empName +
          ' </span></div><div class="caret-down-icon remove-attachment"><i class="fa fa-times" id="remove-attachment-' +
          totalAttachments +
          '"></i></div> </div>';
        if (lineIDForAttachment) {
          if (
            !$(
              "#attachment-tooltip-" +
                lineIDForAttachment +
                " .uploaded-element"
            ).length
          ) {
            $(
              "#attachment-tooltip-" + lineIDForAttachment + " " + elementid
            ).html(elementForItem);
          } else {
            $(
              "#attachment-tooltip-" + lineIDForAttachment + " " + elementid
            ).append(elementForItem);
          }
          $("#attachment-tooltip-" + lineIDForAttachment).show();
        } else {
          if (!$(".uploaded-element").length) {
            $(elementid).html(elementForItem);
          } else {
            $(elementid).append(elementForItem);
          }
          $("#new-attachment2-tooltip").show();
        }
      }
      totalAttachments++;
    };


    let imagetoDisplay = '';
    if(myFiles[0].type.startsWith("image/")){
        imagetoDisplay = '<div class="col inboxcol1"><img src=data:'+myFiles[0].type+';base64,'+base64data+' style="width:100%;"></div>';
      $('.divImageLoad').html(imagetoDisplay);
    }else{
      imagetoDisplay = `<div class="col inboxcol1">
          <img src="/icons/nofiles_icon.jpg" class="" style="width:100%;">
      </div>
      <div class="col inboxcol2" style="text-align: center;">
          <div>Upload files or add files from the file library.</div>
          {{#if isMobileDevices}}
              <div>Capture copies of receipt's or take photo's of completed jobs.</div>
          {{/if}}
          <p style="color: #ababab;">Only users with access to your company can view these files</p>
      </div>`;
      $('.divImageLoad').html(imagetoDisplay);
    };

    let dataObj = {
      totalAttachments: totalAttachments,
      uploadedFilesArray: uploadedFilesArray,
    };
    return dataObj;
  };
  attachmentUploadTabs = function (
    uploadedFilesArray,
    myFiles,
    saveToTAttachment,
    lineIDForAttachment
  ) {
    let empName = localStorage.getItem("mySession");
    let totalAttachments = uploadedFilesArray.length;
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i];
      let myFileType = myFile.type;

      //first arguement must be an regular array. The array can be of any javascript objects. Array can contain array to make it multi dimensional
      //second parameter must be a BlogPropertyBag object containing MIME property
      let myBlob = new Blob([myFile], { type: myFileType });
      let myReader = new FileReader();
      myReader.readAsDataURL(myBlob);
      //handler executed once reading(blob content referenced to a variable) from blob is finished.
      myReader.addEventListener("loadend", function (e) {
        let base64data = myReader.result.split(",")[1];
        let uploadObject = {
          type: "TAttachment",
          fields: {
            Attachment: base64data,
            AttachmentName: myFile.name,
            Description: myFile.type,
          },
        };
        uploadedFilesArray.push(uploadObject);
      });
      if (!saveToTAttachment) {
        let elementForItem =
          '<div class="uploaded-element" id="attachment-name-' +
          totalAttachments +
          '"><div class="caret-down-icon remove-attachment"><i class="fa fa-times" id="remove-attachment-' +
          totalAttachments +
          '"></i></div> <div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-name"><span> ' +
          myFile.name +
          "</span>" +
          '<span class="uploaded-on">File upload by ' +
          empName +
          " </span></div> </div>";
        if (lineIDForAttachment) {
          if (
            !$(
              "#attachment-tooltip-" +
                lineIDForAttachment +
                " .uploaded-element"
            ).length
          ) {
            $(
              "#attachment-tooltip-" + lineIDForAttachment + " #file-display"
            ).html(elementForItem);
          } else {
            $(
              "#attachment-tooltip-" + lineIDForAttachment + " #file-display"
            ).append(elementForItem);
          }
          $("#attachment-tooltip-" + lineIDForAttachment).show();
        } else {
          if (!$(".uploaded-element").length) {
            $("#file-display").html(elementForItem);
          } else {
            $("#file-display").append(elementForItem);
          }
          $("#new-attachment2-tooltip").show();
        }
      }
      totalAttachments++;
    }
    let dataObj = {
      totalAttachments: totalAttachments,
      uploadedFilesArray: uploadedFilesArray,
    };
    return dataObj;
  };

  attachmentUploadJob = function (
    uploadedFilesArray,
    myFiles,
    saveToTAttachment,
    lineIDForAttachment
  ) {
    let empName = localStorage.getItem("mySession");
    let totalAttachments = uploadedFilesArray.length;
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i];
      let myFileType = myFile.type;

      //first arguement must be an regular array. The array can be of any javascript objects. Array can contain array to make it multi dimensional
      //second parameter must be a BlogPropertyBag object containing MIME property
      let myBlob = new Blob([myFile], { type: myFileType });
      let myReader = new FileReader();
      myReader.readAsDataURL(myBlob);
      //handler executed once reading(blob content referenced to a variable) from blob is finished.
      myReader.addEventListener("loadend", function (e) {
        let base64data = myReader.result.split(",")[1];
        let uploadObject = {
          type: "TAttachment",
          fields: {
            Attachment: base64data,
            AttachmentName: myFile.name,
            Description: myFile.type,
          },
        };
        uploadedFilesArray.push(uploadObject);
      });
      if (!saveToTAttachment) {
        let elementForItem =
          '<div class="uploaded-elementJobPOP" id="attachment-nameJobPOP-' +
          totalAttachments +
          '"><div class="caret-down-icon remove-attachmentJobPOP"><i class="fa fa-times" id="remove-attachmentJobPOP-' +
          totalAttachments +
          '"></i></div><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-nameJobPOP"><span> ' +
          myFile.name +
          "</span>" +
          '<span class="uploaded-on">File upload by ' +
          empName +
          " </span></div> </div>";
        if (lineIDForAttachment) {
          if (
            !$(
              "#attachment-tooltipJobPOP-" +
                lineIDForAttachment +
                " .uploaded-elementJobPOP"
            ).length
          ) {
            $(
              "#attachment-tooltipJobPOP-" +
                lineIDForAttachment +
                " #file-displayJobPOP"
            ).html(elementForItem);
          } else {
            $(
              "#attachment-tooltipJobPOP-" +
                lineIDForAttachment +
                " #file-displayJobPOP"
            ).append(elementForItem);
          }
          $("#attachment-tooltipJobPOP-" + lineIDForAttachment).show();
        } else {
          if (!$(".uploaded-elementJobPOP").length) {
            $("#file-displayJobPOP").html(elementForItem);
          } else {
            $("#file-displayJobPOP").append(elementForItem);
          }
          $("#new-attachment2-tooltipJobPOP").show();
        }
      }
      totalAttachments++;
    }
    let dataObj = {
      totalAttachments: totalAttachments,
      uploadedFilesArray: uploadedFilesArray,
    };
    return dataObj;
  };

  attachmentUploadJobNoPOP = function (
    uploadedFilesArray,
    myFiles,
    saveToTAttachment,
    lineIDForAttachment
  ) {
    let empName = localStorage.getItem("mySession");
    let totalAttachments = uploadedFilesArray.length;
    for (let i = 0; i < myFiles.length; i++) {
      let myFile = myFiles[i];
      let myFileType = myFile.type;

      //first arguement must be an regular array. The array can be of any javascript objects. Array can contain array to make it multi dimensional
      //second parameter must be a BlogPropertyBag object containing MIME property
      let myBlob = new Blob([myFile], { type: myFileType });
      let myReader = new FileReader();
      myReader.readAsDataURL(myBlob);
      //handler executed once reading(blob content referenced to a variable) from blob is finished.
      myReader.addEventListener("loadend", function (e) {
        let base64data = myReader.result.split(",")[1];
        let uploadObject = {
          type: "TAttachment",
          fields: {
            Attachment: base64data,
            AttachmentName: myFile.name,
            Description: myFile.type,
          },
        };
        uploadedFilesArray.push(uploadObject);
      });
      if (!saveToTAttachment) {
        let elementForItem =
          '<div class="uploaded-elementJobNoPOP" id="attachment-nameJobNoPOP-' +
          totalAttachments +
          '"> <div class="caret-down-icon remove-attachmentJobNoPOP"><i class="fa fa-times" id="remove-attachmentJobNoPOP-' +
          totalAttachments +
          '"></i></div><div class="fileIocns"><i class="fa fa-file"></i></div> <div class="file-nameJobNoPOP"><span> ' +
          myFile.name +
          "</span>" +
          '<span class="uploaded-on">File upload by ' +
          empName +
          " </span></div> </div>";
        if (lineIDForAttachment) {
          if (
            !$(
              "#attachment-tooltipJobNoPOP-" +
                lineIDForAttachment +
                " .uploaded-elementJobNoPOP"
            ).length
          ) {
            $(
              "#attachment-tooltipJobNoPOP-" +
                lineIDForAttachment +
                " #file-displayJobNoPOP"
            ).html(elementForItem);
          } else {
            $(
              "#attachment-tooltipJobNoPOP-" +
                lineIDForAttachment +
                " #file-displayJobNoPOP"
            ).append(elementForItem);
          }
          $("#attachment-tooltipJobNoPOP-" + lineIDForAttachment).show();
        } else {
          if (!$(".uploaded-elementJobNoPOP").length) {
            $("#file-displayJobNoPOP").html(elementForItem);
          } else {
            $("#file-displayJobNoPOP").append(elementForItem);
          }
          $("#new-attachment2-tooltipJobNoPOP").show();
        }
      }
      totalAttachments++;
    }
    let dataObj = {
      totalAttachments: totalAttachments,
      uploadedFilesArray: uploadedFilesArray,
    };
    return dataObj;
  };

  multipleTablesToExcel = (function () {
    var uri = "data:application/vnd.ms-excel;base64,",
      tmplWorkbookXML =
        '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
        '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>' +
        "<Styles>" +
        '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>' +
        '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>' +
        "</Styles>" +
        "{worksheets}</Workbook>",
      tmplWorksheetXML =
        '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>',
      tmplCellXML =
        '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>',
      base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)));
      },
      format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
          return c[p];
        });
      };
    return function (tables, wsnames, wbname, appname) {
      var ctx = "";
      var workbookXML = "";
      var worksheetsXML = "";
      var rowsXML = "";

      for (var i = 0; i < tables.length; i++) {
        if (!tables[i].nodeType) {
          tables[i] = document.getElementById(tables[i]);
        }
        for (var j = 0; j < tables[i].rows.length; j++) {
          rowsXML += "<Row>";
          for (var k = 0; k < tables[i].rows[j].cells.length; k++) {
            var dataType = tables[i].rows[j].cells[k].getAttribute("data-type");
            var dataStyle =
              tables[i].rows[j].cells[k].getAttribute("data-style");
            var dataValue =
              tables[i].rows[j].cells[k].getAttribute("data-value");
            dataValue = dataValue
              ? dataValue
              : tables[i].rows[j].cells[k].innerHTML;
            var dataFormula =
              tables[i].rows[j].cells[k].getAttribute("data-formula");
            dataFormula = dataFormula
              ? dataFormula
              : appname == "Calc" && dataType == "DateTime"
              ? dataValue
              : null;
            ctx = {
              attributeStyleID:
                dataStyle == "Currency" || dataStyle == "Date"
                  ? ' ss:StyleID="' + dataStyle + '"'
                  : "",
              nameType:
                dataType == "Number" ||
                dataType == "DateTime" ||
                dataType == "Boolean" ||
                dataType == "Error"
                  ? dataType
                  : "String",
              data: dataFormula ? "" : dataValue,
              attributeFormula: dataFormula
                ? ' ss:Formula="' + dataFormula + '"'
                : "",
            };
            rowsXML += format(tmplCellXML, ctx);
          }
          rowsXML += "</Row>";
        }
        ctx = { rows: rowsXML, nameWS: wsnames[i] || "Sheet" + i };
        worksheetsXML += format(tmplWorksheetXML, ctx);
        rowsXML = "";
      }

      ctx = { created: new Date().getTime(), worksheets: worksheetsXML };
      workbookXML = format(tmplWorkbookXML, ctx);

      var link = document.createElement("A");
      link.href = uri + base64(workbookXML);
      link.download = wbname || "Workbook.xls";
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  })();

  exportToCsvInv = function (rows, filename, type) {
    let processRow = function (row) {
      let finalVal = "";
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null ? "" : row[j];
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        if (j > 0) finalVal += ",";
        finalVal += innerValue;
      }
      return finalVal + "\n";
    };
    let csvFile = "";
    if (type === "xls") {
      csvFile = "sep=," + "\n";
    }
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
      }
    }

    let fileType = "text/csv;charset=utf-8;";
    if (type === "xls") {
      fileType = "text/xls;charset=utf-8;";
    }

    let blob = new Blob([csvFile], { type: fileType });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  exportToPdfReports = function (
    data,
    filename,
    pageTitle,
    pageOrientation,
    type,
    head
  ) {
    //try{
    let currency = Currency;
    pageOrientation = pageOrientation.split("-");
    let Xcoordinate = 0;
    let Ycoordinate = 90;
    let titleCoordinate = 0;
    if (head.length >= 10) {
      if (head.length >= 10 && head.length < 12) {
        pageOrientation[2] = [200, 340];
        Xcoordinate = 125;
        Ycoordinate = 0;
        titleCoordinate = 60;
      } else if (head.length >= 12 && head.length < 15) {
        pageOrientation[2] = [200, 380];
        Xcoordinate = 165;
        Ycoordinate = 0;
        titleCoordinate = 80;
      } else if (head.length >= 15 && head.length < 18) {
        pageOrientation[2] = [200, 430];
        Xcoordinate = 195;
        Ycoordinate = 0;
        titleCoordinate = 110;
      } else if (head.length >= 18 && head.length < 21) {
        pageOrientation[2] = [200, 470];
        Xcoordinate = 225;
        Ycoordinate = 0;
        titleCoordinate = 130;
      } else if (head.length >= 21 && head.length < 24) {
        pageOrientation[2] = [200, 500];
        Xcoordinate = 255;
        Ycoordinate = 0;
        titleCoordinate = 155;
      } else if (head.length >= 24 && head.length < 27) {
        pageOrientation[2] = [200, 530];
        Xcoordinate = 280;
        Ycoordinate = 0;
        titleCoordinate = 170;
      } else {
        pageOrientation[2] = [200, 560];
        Xcoordinate = 305;
        Ycoordinate = 0;
        titleCoordinate = 195;
      }
    }

    const totalPagesExp = "{total_pages_count_string}";
    let doc = new jsPDF(
      pageOrientation[0],
      pageOrientation[1],
      pageOrientation[2]
    );
    if (pageOrientation[0] === "landscape" && pageOrientation[2] == "a3") {
      Xcoordinate = 213;
      Ycoordinate = 90;
      titleCoordinate = 100;
    } else if (
      pageOrientation[0] === "landscape" &&
      pageOrientation[2] == "a4"
    ) {
      Xcoordinate = 90;
      Ycoordinate = 0;
      titleCoordinate = 40;
    }
    const header = function (data) {
      doc.setFontSize(22);
      doc.setTextColor(30);
      doc.setFontStyle("Roboto Mono");
      doc.text(filename, 16, 20);
      doc.setDrawColor(0, 123, 169);
      doc.setLineWidth(1);
      doc.line(15, 25, 195 + Xcoordinate, 25);
      let footerLeft =
        filename +
        " | " +
        loggedCompany +
        " | " +
        moment().format("DD MMM YYYY");
      let footerRight = "Page " + data.pageCount;
      if (typeof doc.putTotalPages === "function") {
        footerRight = footerRight + " of " + totalPagesExp;
      }
      doc.setDrawColor(0, 123, 169);
      doc.setLineWidth(1);
      doc.line(15, 185 + Ycoordinate, 195 + Xcoordinate, 185 + Ycoordinate);
      doc.setFontSize(10);
      doc.text(footerLeft, 16, 190 + Ycoordinate);
      doc.text(footerRight, 175 + Xcoordinate, 190 + Ycoordinate);
    };
    const options = {
      styles: {
        lineWidth: 0.01,
        lineColor: [200, 200, 200],
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
        columnWidth: "auto",
      },
      addPageContent: header,
      theme: "plain",
      showHeader: "everyPage",
      margin: {
        top: 33,
        bottom: 33,
      },
      startY: 70,
      headerStyles: {
        halign: "center",
      },
      drawRow: (row, data) => {
        if (row.raw.length > 0) {
          for (let cell in row.cells) {
            if (row.cells[cell].raw != undefined) {
              if (row.cells[cell].raw.includes(currency)) {
                row.cells[cell].styles.halign = "right";
              }
            }
          }
        }
        if (type === "true") {
          if (filename === "Balance Sheet") {
            let data = row.cells[0].raw.split(" ");
            if (
              row.cells[1].contentWidth === 3.5277777777777772 &&
              row.cells[2].contentWidth === 3.5277777777777772
            ) {
              for (let cell in row.cells) {
                row.cells[cell].styles.fontStyle = "bold";

                row.cells[cell].styles.fontSize = 10;
              }
            }
            if (data[0] == "Total" || data[0] == "TOTAL") {
              for (let cell in row.cells) {
                row.cells[cell].styles.fontStyle = "bold";
                row.cells[cell].styles.fontSize = 10;
              }
            }
          } else if (filename == "Sales by Item") {
            let dataValue = row.cells[0].raw.split(" ");
            if (dataValue[0] == "Total") {
              for (let cell in row.cells) {
                row.cells[cell].styles.fontStyle = "bold";
                row.cells[cell].styles.fontSize = 10;
              }
            }
            if (row.index === data.table.rows.length - 6) {
              for (let cell in row.cells) {
                row.cells[cell].styles.fontStyle = "bold";
                row.cells[cell].styles.fontSize = 13;
              }
            }
          } else {
            if (row.cells[1].contentWidth === 3.5277777777777772) {
              for (let cell in row.cells) {
                row.cells[cell].styles.fontStyle = "bold";
                row.cells[cell].styles.fontSize = 10;
              }
            }
            if (
              filename != "Receivable Invoice Summary" &&
              filename != "Payable Invoice Summary"
            ) {
              if (row.index === data.table.rows.length - 1) {
                for (let cell in row.cells) {
                  row.cells[cell].styles.fillColor = (204, 204, 204);
                }
              }
            }
          }
        } else {
          if (filename != "Chart of Accounts") {
            if (filename != "Invoice") {
              if (row.index === data.table.rows.length - 1) {
                for (let cell in row.cells) {
                  row.cells[cell].styles.fontStyle = "bold";
                  doc.setFillColor(122, 136, 142);
                }
              }
            }
          }
        }
      },
    };
    doc.setFontSize(18);
    doc.setTextColor(0, 123, 169);
    doc.setFontStyle("Roboto Mono");
    doc.text(pageTitle[0], 72 + titleCoordinate, 40);
    doc.text(pageTitle[1], 75 + titleCoordinate, 48);
    if (pageTitle[2].length < 15) {
      doc.text(pageTitle[2], 82 + titleCoordinate, 56);
      doc.text(pageTitle[3], 85 + titleCoordinate, 64);
    } else if (pageTitle[2].length >= 15 && pageTitle[2].length <= 20) {
      doc.text(pageTitle[2], 77 + titleCoordinate, 56);
      doc.text(pageTitle[3], 85 + titleCoordinate, 64);
    } else if (pageTitle[2].length >= 20 && pageTitle[2].length < 28) {
      doc.text(pageTitle[2], 70 + titleCoordinate, 56);
      doc.text(pageTitle[3], 85 + titleCoordinate, 64);
    } else if (pageTitle[2].length >= 28 && pageTitle[2].length <= 35) {
      doc.text(pageTitle[2], 65 + titleCoordinate, 56);
      doc.text(pageTitle[3], 85 + titleCoordinate, 64);
    } else {
      doc.text(pageTitle[2], 50 + titleCoordinate, 56);
      doc.text(pageTitle[3], 85 + titleCoordinate, 64);
    }
    doc.setFontSize(14);
    // doc.autoTable(head, data, options);

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }
    //save
    doc.save(loggedCompany + "-" + filename + ".pdf");

    // }
    // catch(e){

    // }
  };

  addSummaryTinyMCEditor = function (editorId) {
    $(document).ready(function () {
      tinymce.init({
        selector: "textarea" + editorId,
        theme: "modern",
        paste_data_images: true,
        plugins: [
          "advlist autolink lists link hr anchor pagebreak",
          "nonbreaking save table  directionality",
          " paste textcolor colorpicker",
        ],
        contextmenu_never_use_native: true,
        menubar: false,
        toolbar: "false",
        toolbar1:
          "bold italic underline | format removeformat | table bullist numlist | link",
        // toolbar2: "print preview media | forecolor backcolor emoticons",
        image_advtab: true,
        file_picker_callback: function (callback, value, meta) {
          if (meta.filetype == "image") {
            $("#upload").trigger("click");
            $("#upload").on("change", function () {
              var file = this.files[0];
              var reader = new FileReader();
              reader.onload = function (e) {
                callback(e.target.result, {
                  alt: "",
                });
              };
              reader.readAsDataURL(file);
            });
          }
        },
      });
    });
  };

  insertContentTinyMCEditor = function (editorId) {
    $(document).ready(function () {
      tinymce.init({
        selector: "textarea" + editorId,
        theme: "modern",
        paste_data_images: true,
        plugins: [
          "advlist autolink lists link image charmap print preview hr anchor pagebreak",
          "searchreplace wordcount visualblocks visualchars code fullscreen",
          "insertdatetime media nonbreaking save table contextmenu directionality",
          "emoticons template paste textcolor colorpicker textpattern",
        ],
        menubar: false,
        toolbar1:
          "undo redo | styleselect | bold italic underline | bullist numlist | link image | table | forecolor backcolor",
        image_advtab: true,
        file_picker_callback: function (callback, value, meta) {
          if (meta.filetype == "image") {
            $("#upload").trigger("click");
            $("#upload").on("change", function () {
              var file = this.files[0];
              var reader = new FileReader();
              reader.onload = function (e) {
                callback(e.target.result, {
                  alt: "",
                });
              };
              reader.readAsDataURL(file);
            });
          }
        },
      });
    });
  };

  modifynegativeCurrencyFormat = function (price, decimalPoint = 2) {
    if (isNaN(parseFloat(price))) {
      if (price) price = parseFloat(String(price).replace(/[^0-9.-]+/g, ""));
      else price = 0;
    }
    if (localStorage.getItem("ERPLoggedCountry") === "United Arab Emirates") {
      return (
        parseFloat(price).toLocaleString(undefined, {
          minimumFractionDigits: decimalPoint,
          maximumFractionDigits: decimalPoint,
        }) +
        " " +
        Currency
      );
    } else {
      if (price < 0) {
        let currency = price.toString().split("-")[1];
        currency =
          "-" +
          Currency +
          parseFloat(currency).toLocaleString(undefined, {
            minimumFractionDigits: decimalPoint,
            maximumFractionDigits: decimalPoint,
          });
        return currency;
      } else {
        return (
          Currency +
          parseFloat(price).toLocaleString(undefined, {
            minimumFractionDigits: decimalPoint,
            maximumFractionDigits: decimalPoint,
          })
        );
      }
    }
  };
  negativeNumberFormat = function (value) {
    if (value < 0) {
      let currency = value.toString().split("-")[1];
      currency =
        "-" +
        parseFloat(currency).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      return currency;
    } else {
      return parseFloat(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  getStartDateWithSpecificFormat = function (date) {
    const leaveDate = new Date(date);
    const yyyy = leaveDate.getFullYear();
    let mm = ("0" + (leaveDate.getMonth() + 1)).slice(-2);
    let dd = leaveDate.getDate();
    return dd + "/" + mm + "/" + yyyy;
  };

  getDateWithMobileSpecificFormat = function (dateString) {
    const date = new Date(dateString); // Create a new date object from the string
    const options = { day: "numeric", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);

    const day = date.getDate();
    let suffix = "th";
    if (day >= 11 && day <= 13) {
      suffix = "th";
    }
    switch (day % 10) {
      case 1:
        suffix = "st";
        break;
      case 2:
        suffix = "nd";
        break;
      case 3:
        suffix = "rd";
        break;
      default:
        suffix = "th";
        break;
    }

    return formattedDate.replace(day, `${day}${suffix}`);
  };

  negativeCurrencyRoundFormat = function (price) {
    if (price < 0) {
      let currency = price.toString().split("-")[1];
      currency = "-" + Currency + Math.round(parseFloat(currency));
      return currency;
    } else {
      return Currency + Math.round(price);
    }
  };
  substringMethod(value) {
    if (value.includes("-" + Currency)) {
      let price = value.substring(2).replace(",", "");
      price = "-" + price;
      return price;
    } else {
      return value.substring(1).replace(",", "");
    }
  }
  withoutLocaleString(price) {
    if (price < 0) {
      let currency = price.toString().split("-")[1];
      currency = "-" + Currency + parseFloat(currency);
      return currency;
    } else {
      return Currency + parseFloat(price);
    }
  }

  convertSubstringParseFloat(value) {
    if (value.includes("-")) {
      let price = value.replace(".", "");
      price = price.substring(2).replace(",", ".");
      price = "-" + price;
      return parseFloat(price);
    } else {
      value = value.replace(".", "");
      value = value.substring(1).replace(",", ".");
      return parseFloat(value);
    }
  }

  convertSubstringParseFloatR(value) {
    if (value.includes("-")) {
      let price = value.replace(",", "");
      price = price.substring(2).replace(",", ".");
      price = "-" + price;
      return parseFloat(price);
    } else {
      value = value.replace(",", "");
      value = value.substring(1).replace(",", ".");
      return parseFloat(value);
    }
  }

  /**
   * This function will convert a string to a float number
   *
   * @param {string} stringNumber
   * @param {string | false} _currency
   * @returns {string}
   */
  removeCurrency(stringNumber = "$10.5", _currency = false) {
    stringNumber = stringNumber.replace(",", "");
    const isNegative = stringNumber.includes("-");
    if (isNegative) {
      stringNumber = stringNumber.replace("-", "");
    }
    if (_currency) {
      stringNumber = stringNumber.replace(_currency, "");
    } else {
      const currency = stringNumber.split("")[0];
      stringNumber = stringNumber.replace(currency, "");
    }
    let value = parseFloat(stringNumber).toFixed(2);
    if (isNegative) value = value * -1;
    return value;
  }

  /**
   * This function will get the currency
   *
   * @param {*} stringNumber
   * @returns
   */
  extractCurrency(stringNumber = "$15.5") {
    if (!isNaN(stringNumber)) {
      return "";
    }
    stringNumber = stringNumber.replace("-", ""); // remove the negative sign
    const currency = stringNumber.split("")[0];
    return currency;
  }

  /**
   *
   * @param {string|number} number
   * @returns {boolean}
   */
  isNegative(number = "1235") {
    if (isNaN(number)) {
      return number.includes("-");
    } else {
      return number < 0;
    }
  }

  waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  convertTo12Hour = function (time24) {
    // Split the time string into hours and minutes
    const [hours, minutes] = time24.split(":");

    // Convert hours to a number
    let hoursNum = parseInt(hours);

    // Determine if it's AM or PM based on the hours
    const meridiem = hoursNum >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour format to 12-hour format
    if (hoursNum > 12) {
      hoursNum -= 12;
    } else if (hoursNum === 0) {
      hoursNum = 12;
    }

    // Create the 12-hour time string
    const time12 = `${hoursNum}:${minutes} ${meridiem}`;

    return time12;
  };

  makeLeaveStatusButton(val) {
    let statusElem = "btn-success";
    if (val == "Awaiting") {
      statusElem = "btn-warning";
    } else if (val == "Declined" || val == "Deleted") {
      statusElem = "btn-danger";
    }
    return `<button class="btn ${statusElem} btnLeaveStatus" style="width: 100%;">${val}</button>`;
  }

  async addDataIndexDB(objDetails, indexdbName, dataName) {
    let dataObject = await getVS1Data(indexdbName);
    let data = [];
    let newID = 1;
    if (dataObject?.[0]?.data) data = JSON.parse(dataObject[0].data)[dataName];
    if (data?.length) newID = parseInt(data.slice(-1)[0].ID) + 1;
    data.push({ ...objDetails, ID: newID });
    await addVS1Data(indexdbName, JSON.stringify({ [dataName]: data }));
  }

  getSortableDateElem(date) {
    return date
      ? `<span class="d-none">${moment(date).format(
          "YYYY/MM/DD"
        )}</span>${moment(date).format("DD/MM/YYYY")}`
      : date;
  }
  //await utilityService.globalSaveData('TInvoiceTemp', objDetails, '', 'TInvoiceEx', 'SaveButton');
  async globalSaveData(
    indexdbTempTableName,
    currentData,
    apiSaveServiceObject,
    serviceAction
  ) {
    if (serviceAction == "SaveButton") {
      //Action Save To TempIndexDB
      if (indexdbTempTableName && currentData) {
        let dataOldObject = (await getVS1Data(indexdbTempTableName)) || "";
        let useData = [];
        if (dataOldObject.length > 0) {
          let data = JSON.parse(dataOldObject[0].data);
          useData = data[indexdbTempTableName.toLowerCase()];
        }

        let newTempData = [...useData, currentData];
        let saveToIndexDBData = JSON.stringify({
          [indexdbTempTableName.toLowerCase()]: newTempData,
        });
        return new Promise((resolve, reject) => {
          addVS1Data(indexdbTempTableName, saveToIndexDBData).then(function () {
            resolve(saveToIndexDBData);
          });
        });
      }
    } else {
      if (indexdbTempTableName && apiSaveServiceObject) {
        //Action Save to API
        let dataObject = (await getVS1Data(indexdbTempTableName)) || "";
        let tempfilesData = "";
        if (dataObject.length > 0) {
          let data = JSON.parse(dataObject[0].data);
          tempfilesData = data[indexdbTempTableName.toLowerCase()];
        }
        async function sendPostRequest() {
          return new Promise((resolve, reject) => {
            let saveArrayObject = {
              type: apiSaveServiceObject,
              objects: tempfilesData,
            };
            function saveData(data) {
              return baseService.POST(apiSaveServiceObject, data);
            }

            saveData(saveArrayObject)
              .then(async function (response) {
                if (response.result == "Success") {
                  await clearData(indexdbTempTableName).then(function () {
                    resolve(tempfilesData);
                  });
                }
              })
              .catch(function (e) {
                resolve();
              });
            //}
          });
        }
        if (tempfilesData && tempfilesData.length) {
          await sendPostRequest();
        }
      }
    }
  }

  fillBankAccount(indexdbName, apiFunc, serviceInstant, apiParams, selector, dataProperty, nameProperty) {
    getVS1Data(indexdbName)
      .then(function (dataObject) {
        if (dataObject.length > 0) {
          let data = JSON.parse(dataObject[0].data);
          let useData = data[dataProperty];
          let bankaccountname = "";
          if (useData.length > 0) {
            bankaccountname = useData[0][nameProperty] || useData[0]["fields"][nameProperty] ||  "";
          }
          $(selector).val(bankaccountname);
        } else {
          apiFunc.apply(serviceInstant, apiParams).then(function (data) {
            let bankaccountname = "";
            if (data[dataProperty].length > 0) {
              bankaccountname = data[dataProperty][0][nameProperty] || data[dataProperty][0]["fields"][nameProperty] || "";
            }
            $(selector).val(bankaccountname);
          });
        }
      })
      .catch(function (err) {
        apiFunc.apply(serviceInstant, apiParams).then(function (data) {
          let bankaccountname = "";
          if (data[dataProperty].length > 0) {
            bankaccountname = data[dataProperty][0][nameProperty] || data[dataProperty][0]["fields"][nameProperty] || "";
          }
          $(selector).val(bankaccountname);
        });
      });
  }
}

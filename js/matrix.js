const oneMatrixOptions = {
    "det": "Определитель",
    "transpose": "Транспонировать",
    "rank": "Ранг",
    "track": "След",
    "pow": "Возвести в степень",
    "const-mult": "Умножить на число",
    "reverse": "Обратная",
    "triangle": "Треугольный вид",
    "stepped": "Ступенчатый вид",
    "lu-decomposition": "LU разложение",
    "elementary-transforms": "Элементарные преобразования",
    "expression": "Вычислить выражение"
};
const twoMatrixOptions = {
    "plus": "Сложение (A + B)",
    "minus": "Вычитание (A - B)",
    "mult": "Умножение (A × B)",
    "system": "Решение системы (AX = B)",
    "expression": "Вычислить выражение"
};
var oneMatrixOptionSelected = "det";
var twoMatrixOptionSelected = "mult";

function correctElement(text) {
    if (text.match(new RegExp(fractionTemplate)) != null) return true;
    if (text.match(new RegExp(realTemplate)) != null) return true;
    if (text == "") return true;
    return false;
}

function correctNumber(text, max) {
    if (isNaN(text)) return " быть натуральным числом";
    var n = parseInt(text);
    if (Math.abs(n) != text) return " быть натуральным числом";
    if (n > max) return " быть не больше " + max;
    return "";
}

function validateCell(selector) {
    var correct = correctElement(selector.val());
    selector.css("background", correct ? "transparent" : "#f99a9a");
    selector.focusout(function() {
        correct = correctElement(selector.val());
        selector.css("background", correct ? "transparent" : "#f99a9a");
        if (!correct) {
            setTimeout(function() {
                selector.focus();
            }, 0);
        }
    });
    return true;
}

function savePage() {
    var myEvent = window.attachEvent || window.addEventListener;
    var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload';
    myEvent(chkevent, function(e) {
        var confirmationMessage = ' ';
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    });
}

function cellMove(td, e) {
    var cols = td.parent().find("td").length;
    var rows = td.parent().parent().find("tr").length;
    var i = td.parent().parent().children().index(td.parent());
    var j = td.parent().children().index(td);
    var i0 = i;
    var j0 = j;
    if (e.which == 40) {
        i++;
        if (i == rows) {
            i = 0;
            j++;
            if (j == cols) j = 0;
        }
    } else if (e.which == 38) {
        i--;
        if (i < 0) {
            i = rows - 1;
            j--;
            if (j < 0) j = cols - 1;
        }
    } else if (e.which == 37) {
        j--;
        if (j < 0) {
            j = cols - 1;
            i--;
            if (i < 0) i = rows - 1;
        }
    } else if (e.which == 39) {
        j++;
        if (j == cols) {
            j = 0;
            i++;
            if (i == rows) i = 0;
        }
    }
    var input = td.find("input")[0];
    var text = td.find("input").val();
    var start = input.selectionStart;
    var end = input.selectionStart;
    var min = Math.min(start, end);
    var max = Math.max(start, end);
    if (e.which != 37 && e.which != 39) td.parent().parent().find("tr:eq(" + i + ") td:eq(" + j + ") input").focus();
    else if (min == 0 && e.which == 37) td.parent().parent().find("tr:eq(" + i + ") td:eq(" + j + ") input").focus();
    else if (max == text.length && e.which == 39) td.parent().parent().find("tr:eq(" + i + ") td:eq(" + j + ") input").focus();
}

function changeSize(selector, save = true) {
    var last = getMatrix(selector);
    var rows = $(selector + "-rows").val();
    var cols = $(selector + "-cols").val();
    var html = "";
    for (var i = 0; i < rows; i++) {
        html += "<tr>";
        for (var j = 0; j < cols; j++) {
            var value = (i < last.length && j < last[0].length) ? last[i][j] : getFraction("0");
            var view = -1;
            var digits = 0;
            var pow = 0;
            var text = value.m.toString();
            if (text.match(/^10*$/) != null) pow = text.length - 1;
            if (pow != 0) {
                view = 2;
                digits = pow;
            }
            if (save) html += "<td><input type=\"text\" placeholder=\"0\" onfocus=\"this.placeholder=''\" onblur=\"this.placeholder='0'\" value='" + (value.n.isZero() ? "" : printFraction(value, view, digits)) + "'></td>";
            else
                html += "<td><input type=\"text\" placeholder=\"0\" onfocus=\"this.placeholder=''\" onblur=\"this.placeholder='0'\"></td>";
        }
        html += "</tr>";
    }
    $(selector + "-table").html(html);
    $(selector + "-size").html("<sub>" + rows + "&#215;" + cols + "</sub>");
    changeOption();
    $("td input").bind("paste", function(e) {
        e.preventDefault();
    });
    $("td input").keyup(function() {
        validateCell($(this));
    })
    $("td").keydown(function(e) {
        cellMove($(this), e)
    });
}

function scrollTo(selector) {
    window.scroll({
        top: $(selector).offset().top - $(".menu2").outerHeight(),
        behavior: 'smooth'
    });
}

function getMatrix(selector, input = true) {
    var rows = input ? $(selector + " tr").length : selector.find("tr").length;
    var cols = input ? $(selector + " tr:eq(0) td").length : selector.find("tr:eq(0) td").length;
    var x = new Array(rows);
    for (var i = 0; i < rows; i++) {
        x[i] = new Array(cols);
        for (var j = 0; j < cols; j++) {
            var element;
            if (input) {
                element = $(selector + " tr:eq(" + i + ") td:eq(" + j + ") input").val();
            } else {
                var html = selector.find(" tr:eq(" + i + ") td:eq(" + j + ")").html();
                var index = html.indexOf("<div class=\"fraction\">");
                if (index > -1) {
                    var first = html.substr(0, index);;
                    var numerator = selector.find(" tr:eq(" + i + ") td:eq(" + j + ") .fraction .numerator").text();
                    var denumerator = selector.find(" tr:eq(" + i + ") td:eq(" + j + ") .fraction .denumerator").text();
                    if (first == "-" || first == "") {
                        element = first + numerator + "/" + denumerator;
                    } else {
                        element = (first[0] == "-" ? "-" : "") + (bigInt(first).abs().multiply(bigInt(denumerator)).add(bigInt(numerator))) + "/" + denumerator;
                    }
                } else
                    element = html;
            }
            x[i][j] = getFraction(element == "" ? "0" : element, false);
        }
    }
    return x;
}

function setMatrix(selector, matrix) {
    var html = "";
    for (var i = 0; i < matrix.length; i++) {
        html += "<tr>";
        for (var j = 0; j < matrix[i].length; j++) {
            var view = -1;
            var digits = 0;
            var pow = 0;
            var text = matrix[i][j].m.toString();
            if (text.match(/^10*$/) != null) pow = text.length - 1;
            if (pow != 0) {
                view = 2;
                digits = pow;
            }
            html += "<td><input type=\"text\" placeholder=\"0\" onfocus=\"this.placeholder=''\" onblur=\"this.placeholder='0'\" value=\"" + printFraction(matrix[i][j], view, digits) + "\"></td>";
        }
        html += "</tr>";
    }
    $(selector + "-table").html(html);
    $("td input").bind("paste", function(e) {
        e.preventDefault();
    });
    $("td input").keyup(function() {
        validateCell($(this));
    })
    $("td").keydown(function(e) {
        cellMove($(this), e)
    });
}

function drawCell(elem) {
    var view = $("#print-option").val();
    var digits = $("#print-length input").val() == "" ? $("#print-length input").attr("placeholder") : $("#print-length input").val();
    return "<td" + (elem.class == undefined ? "" : " class='" + elem.class + "'") + ">" + (elem.n != undefined ? printFraction(elem, view, digits) : elem) + "</td>";
}

function drawMatrix(matrix, str = "", draggable = true) {
    var html = "<div class='matrix'" + (draggable ? " draggable='true'" : "") + "><div class='matrix-brackets'><table>";
    for (var i = 0; i < matrix.length; i++) {
        html += "<tr>";
        for (var j = 0; j < matrix[i].length; j++) html += drawCell(matrix[i][j]);
        html += "</tr>";
    }
    html += "</table></div><span class='matrix-top-text'>" + str + "</span></div>";
    return html;
}

function drawFraction(n, m) {
    return "<div class='fraction'><div class='numerator'>" + n + "</div><div class='denumerator'>" + m + "</div></div>";
}

function drawScrollBlock(html) {
    return "<div class='scroll-block'>" + html + "</div>";
}

function drawResult(result, needButtons, option) {
    var html = "<div class='calc-result-hist" + (needButtons ? "" : " no-padding") + "'>" + result;
    if (needButtons) {
        html += "<div class='calc-result-hist-buttons'>"
        html += "<input class='move-to-a' type='submit' value='Вставить в A'>";
        html += "<input class='move-to-b' type='submit' value='Вставить в B'>";
        html += "</div>";
    }
    html += "<span class='fa fa-close result-clear'></span>";
    // TODO uncomment if need to write theory block
    // html += "<p class='theory-block'>" + getTheory(option) + "</p>";
    html += "</div>";
    return html;
}

function drawAnswer(answer, operation = "") {
    var html = "";
    if (operation != "") html += "<div class='solve-caption'>" + operation + "</div>";
    html += "<div class='main-solve'><div class='scroll-block'>" + answer + "</div></div>";
    return html;
}

function drawSolve(html, caption = "") {
    return "<div></div>";
    //return "<div class='solve-block'><div class='solve-block-hide'><span class='fa fa-caret-right'></span><b>" + (caption == "" ? "Решение" : caption) + "</b> (нажмите чтобы показать/скрыть)</div><div class='solve'>" + html + "</div></div>";
}

function showBlock(id, need) {
    if (need) $(id).removeClass("no-display");
    else
        $(id).addClass("no-display");
}

function changeOption() {
    var option = $("#calc-option").val();
    var size1 = {
        rows: $("#first-matrix-rows").val(),
        cols: $("#first-matrix-cols").val()
    };
    var size2 = {
        rows: $("#second-matrix-rows").val(),
        cols: $("#second-matrix-cols").val()
    };
    if ($("#first-matrix-check").is(":checked") && $("#second-matrix-check").is(":checked")) {
        twoMatrixOptionSelected = option;
    } else {
        oneMatrixOptionSelected = option;
    }
    $("#operation-error").text("");
    showBlock("#const-options-block", option == "const-mult");
    showBlock("#pow-options-block", option == "pow");
    showBlock("#expression-options-block", option == "expression");
    showBlock("#elementary-transforms-options-block", option == "elementary-transforms");
    showBlock("#reverse-matrix-options-block", option == "reverse");
    showBlock("#system-options-block", option == "system");
    if ((option == "plus" || option == "minus") && (size1.rows != size2.rows || size1.cols != size2.cols)) $("#operation-error").text("размеры матриц должны совпадать");
    if (option == "mult" && size1.cols != size2.rows) $("#operation-error").text("число столбцов A должно совпадать с числом строк B");
    if (option == "det" || option == "track" || option == "pow" || option == "reverse" || option == "triangle" || option == "lu-decomposition") {
        var correct = $("#first-matrix-check").is(":checked") ? size1.rows == size1.cols : size2.rows == size2.cols;
        if (!correct) $("#operation-error").text("матрица должна быть квадратной");
    }
    if (option == "system") {
        if (size1.rows != size1.cols) {
            $("#operation-error").text("матрица A должна быть квадратной");
        } else if (size2.cols != 1) {
            $("#operation-error").text("матрица B должна состоять из одного столбца");
        } else if (size1.rows != size2.rows) {
            $("#operation-error").text("число строк матрицы A и вектор столбца B должно совпадать");
        }
    }
    $("#errors-block").addClass("no-display").html("");
    $(".num-calc > .theory-block").html(getTheory(option));
    $('a').click(function() {
        var href = $.attr(this, 'href');
        if (href != undefined && href[0] == "#") scrollTo(href);
        return true;
    });
}

function changeElementaryTransformsOption(select) {
    var option = select.value;
    $("#transform-param-1").addClass("no-display");
    $("#transform-param-2").addClass("no-display");
    $("#transform-param-3").addClass("no-display");
    $("#transform-text-1").addClass("no-display").text("");
    $("#transform-text-2").addClass("no-display").text("");
    if (option == "row-swap" || option == "col-swap") {
        $("#transform-param-1").removeClass("no-display");
        $("#transform-param-2").removeClass("no-display");
        $("#transform-text-1").removeClass("no-display").text("и");
    } else if (option == "mult-row-const" || option == "mult-col-const") {
        $("#transform-param-1").removeClass("no-display");
        $("#transform-param-3").removeClass("no-display");
        $("#transform-text-1").removeClass("no-display").text("на");
    } else if (option == "add-row-const" || option == "add-col-const") {
        $("#transform-param-1").removeClass("no-display");
        $("#transform-param-2").removeClass("no-display");
        $("#transform-param-3").removeClass("no-display");
        $("#transform-text-1").removeClass("no-display").text(option == "add-row-const" ? "строку" : "столбец");
        $("#transform-text-2").removeClass("no-display").text(option == "add-row-const" ? "умноженную на" : "умноженный на");
    }
}

function changePrint(select) {
    var option = select.value;
    if (option == 2) $("#print-length").removeClass("no-display");
    else
        $("#print-length").addClass("no-display");
}

function dragStart(e) {
    e.dataTransfer.setData("text", e.target.id);
    if (!$("#first-matrix-check").is(":checked") && !$("#second-matrix-check").is(":checked")) return;
    $(".matrix-calculator-block .matrix-brackets").addClass("matrix-droppable");
    var id = $("#first-matrix-check").is(":checked") ? "#first-matrix-block" : "#second-matrix-block";
    var h1 = $(window).scrollTop() + $(".menu2").height();
    var h2 = h1 + $(window).outerHeight();
    var y1 = $(id).offset().top;
    var y2 = y1 + $(id).height();
    if (h1 >= y1 || y2 >= h2) scrollTo(id);
}

function dragEnd(ev) {
    ev.preventDefault();
    $(".matrix-calculator-block .matrix-brackets").removeClass("matrix-droppable");
}

function dragCancel(e) {
    $(".matrix-calculator-block .matrix-brackets").removeClass("matrix-droppable");
}

function drop(ev) {
    ev.preventDefault();
    var id = $(ev.target).parents("#first-matrix").length == 1 ? "#first-matrix" : "#second-matrix";
    var matrix = getMatrix($("#" + ev.dataTransfer.getData("text")), false);
    setMatrix(id, matrix);
    $(id + "-rows").val(matrix.length);
    $(id + "-cols").val(matrix[0].length);
    $(id + "-size").html("<sub>" + matrix.length + "&#215;" + matrix[0].length + "</sub>");
    $(".matrix-calculator-block .matrix-brackets").removeClass("matrix-droppable");
}

function getTheory(option) {
    switch (option) {
        case "transpose":
            return "<b>Транспонирование матрицы</b> — операция над матрицей, при которой её строки и столбцы меняются местами: <code>a<sup>T</sup><sub>ij</sub> = a<sub>ji</sub></code>";
        case "rank":
            return "<b>Ранг матрицы</b> — максимальное количество линейно независимых строк (столбцов) этой матрицы. Обозначение: <code>rank(A)</code>";
        case "track":
            return "<b>След матрицы</b> — сумма элементов, находящихся на её главной диагонали. Обозначение: <code>tr(A)</code> или <code>track(A)</code>";
        case "const-mult":
            return "<b>Умножение матрицы на число</b> — матрица такой же размерности, что и исходная, каждый элемент которой является произведением соответствующего элемента исходной матрицы на заданное число.";
        case "pow":
            return "<b>Возведение матрицы в степень</b> — умножение заданной матрицы саму на себя n-ое количество раз, где n – степень, в которую необходимо возвести исходную матрицу. Обозначение: <code>A<sup>n</sup></code>";
        case "reverse":
            return "<b>Обратная матрица A<sup>−1</sup></b> — матрица, произведение которой на исходную матрицу A равно единичной матрице <b>E</b> (квадратная матрица с единицами на главной диагонали и нулями вне её)";
        case "triangle":
            return "<b>Треугольная матрица</b> — квадратная матрица, у которой выше (верхнетреугольная матрица) или ниже (нижнетреугольная матрица) главной диагонали находятся нули."
        case "stepped":
            return "<b>Ступенчатая матрица</b> — матрица, у которой выше (верхняя ступенчатая матрица) или ниже (нижняя ступенчатая матрица) элементов главной диагонали находятся нули."
        case "lu-decomposition":
            return "<b>LU-разложение</b> — это представление матрицы A в виде A = L·U, где L — нижнетреугольная матрица с единичной диагональю, а U — верхнетреугольная матрица."
        case "plus":
            return "<b>Сложение матриц (A+B)</b> —  матрица C, все элементы которой равны попарной сумме всех соответствующих элементов матриц A и B, то есть каждый элемент матрицы C равен: <code>с<sub>ij</sub>=a<sub>ij</sub>+b<sub>ij</sub></code>."
        case "minus":
            return "<b>Разность матриц (A-B)</b> —  матрица C, все элементы которой равны попарной разности всех соответствующих элементов матриц A и B, то есть каждый элемент матрицы C равен: <code>с<sub>ij</sub>=a<sub>ij</sub>-b<sub>ij</sub></code>."
        case "mult":
            return "<b>Умножение матриц A<sub>n×k</sub> и B<sub>k×m</sub></b> — матрица C<sub>n×m</sub> такая, что элемент матрицы C, стоящий в i-той строке и j-том столбце (c<sub>ij</sub>), равен сумме произведений элементов i-той строки матрицы A на соответствующие элементы j-того столбца матрицы B: <code>c<sub>ij</sub> = a<sub>i1</sub>·b<sub>1j</sub> + a<sub>i2</sub>·b<sub>2j</sub> + ... + a<sub>ik</sub>·b<sub>kj</sub></code>."
        case "expression":
            return "<b>Вычисление выражений с матрицами</b> — матрицы, арифметические операции (-, +, *, /), возведение в степень, скобки. <a href='#expression-info'>Правила записи</a>";
        default:
            return "";
    }
}

function powSolveMatrix(a, a0, pow) {
    if (pow == 0) return {
        matrix: getEMatrix(a.length),
        solve: ""
    };
    if (pow % 2) {
        var tmp = powSolveMatrix(a, a0, pow - 1);
        var x = tmp.matrix;
        var y = multMatrix(x, a);
        if (pow != 1) tmp.solve += drawScrollBlock(drawMatrix(a0, pow) + " = " + drawMatrix(a0, pow - 1) + "&#215;" + drawMatrix(a0) + " = " + drawMatrix(x) + "&#215;" + drawMatrix(a0) + " = " + drawMatrix(y));
        return {
            matrix: y,
            solve: tmp.solve
        };
    }
    var tmp = powSolveMatrix(a, a0, pow / 2);
    var x = tmp.matrix;
    var y = multMatrix(x, x);
    tmp.solve += drawScrollBlock(drawMatrix(a0, pow) + (pow != 2 ? " = " + drawMatrix(a0, pow / 2) + "&#215;" + drawMatrix(a0, pow / 2) : "") + " = " + drawMatrix(x) + "&#215;" + drawMatrix(x) + " = " + drawMatrix(y));
    return {
        matrix: y,
        solve: tmp.solve
    };
}

function plusSolveMatrix(a, b, view, digits) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[i].length);
        for (var j = 0; j < a[0].length; j++) {
            c[i][j] = printFraction(a[i][j], view, digits) + "+" + (b[i][j].n.isNegative() ? "(" + printFraction(b[i][j], view, digits) + ")" : printFraction(b[i][j], view, digits));
        }
    }
    return c;
}

function minusSolveMatrix(a, b, view, digits) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[i].length);
        for (var j = 0; j < a[0].length; j++) {
            c[i][j] = printFraction(a[i][j], view, digits) + "-" + (b[i][j].n.isNegative() ? "(" + printFraction(b[i][j], view, digits) + ")" : printFraction(b[i][j], view, digits));
        }
    }
    return c;
}

function multSolveMatrix(a, b, view, digits) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(b[0].length);
        for (var j = 0; j < b[0].length; j++) {
            c[i][j] = "";
            for (var k = 0; k < a[0].length; k++) c[i][j] += (k > 0 ? "+" : "") + (a[i][k].n.isNegative() ? "(" : "") + printFraction(a[i][k], view, digits) + (a[i][k].n.isNegative() ? ")" : "") + "·" + (b[k][j].n.isNegative() ? "(" : "") + printFraction(b[k][j], view, digits) + (b[k][j].n.isNegative() ? ")" : "");
        }
    }
    return c;
}

function multConstSolveMatrix(a, n, view, digits) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[i].length);
        for (var j = 0; j < a[0].length; j++) {
            c[i][j] = printFraction(a[i][j], view, digits) + "·" + printFraction(n, view, digits);
        }
    }
    return c;
}

function reverseGaussSolve(a, view, digits) {
    var n = a.length;
    var c = copyMatrix(a);
    var r = getEMatrix(n);
    var matrix = new Array(n);
    for (var i = 0; i < n; i++) {
        matrix[i] = new Array(n * 2);
        for (var j = 0; j < n; j++) {
            matrix[i][j] = c[i][j];
            matrix[i][n + j] = r[i][j];
        }
        matrix[i][n - 1].class = "right-bordered";
    }
    var solve = "Припишем справа единичную матрицу и с помощью элементарных преобразований приведём левую матрицу к единичной, а справа получится обратная матрица:";
    solve += drawScrollBlock(drawMatrix(matrix));
    for (var j = 0; j < n; j++) {
        var stringNum = j;
        while (stringNum < n && matrix[stringNum][j].n.isZero()) stringNum++;
        if (stringNum != n) {
            if (j != stringNum) {
                swapRowsMatrix(matrix, stringNum, j);
                solve += "Переставим строки " + (j + 1) + " и " + (stringNum + 1) + ":" + drawScrollBlock(drawMatrix(matrix));
            }
            var divider = matrix[j][j];
            divString(matrix, j, divider);
            matrix[j][n - 1].class = "right-bordered";
            if (printFraction(divider, 1) != "1") solve += "Разделим " + (j + 1) + "-ю строку  на " + printFraction(divider, view, digits) + ":" + drawScrollBlock(drawMatrix(matrix));
            for (var i = j + 1; i < n; i++) {
                var elem = divFraction(matrix[i][j], matrix[j][j]);
                if (!elem.n.isZero()) {
                    minusStringMatrix(matrix, j, i, elem);
                    matrix[i][n - 1].class = "right-bordered";
                    if (!elem.n.isZero()) solve += "Вычтем из строки " + (i + 1) + " строку " + (j + 1) + (printFraction(elem, view, digits) == "1" ? "" : ", умноженную на " + printFraction(elem, view, digits)) + ":" + drawScrollBlock(drawMatrix(matrix));
                }
            }
        }
    }
    for (var j = n - 1; j >= 0; j--) {
        for (var i = j - 1; i >= 0; i--) {
            var elem = matrix[i][j];
            minusStringMatrix(matrix, j, i, elem);
            matrix[i][n - 1].class = "right-bordered";
            if (!elem.n.isZero()) solve += "Вычтем из строки " + (i + 1) + " строку " + (j + 1) + (printFraction(elem, view, digits) == "1" ? "" : ", умноженную на " + printFraction(elem, view, digits)) + ":" + drawScrollBlock(drawMatrix(matrix));
        }
    }
    for (var i = 0; i < n; i++) matrix[i][n - 1].class = undefined;
    solve += "Полученная справа матрица является обратной.";
    return solve;
}

function reverseAlgAddSolve(a, det, view, digits) {
    var solve = "1. Вычислим определитель матрицы:";
    solve += drawScrollBlock("det" + drawMatrix(a) + " = " + printFraction(det, view, digits));
    solve += "2. Построим присоединённую матрицу C<sup>*</sup>(матрица, каждый элемент которой является алгебраическим дополнением к элементу a<sub>ij</sub>). Для этого выпишем алгебраические дополнения к каждому из элементов:";
    var minors = new Array(a.length);
    var Aij = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        Aij[i] = new Array(a[i].length);
        minors[i] = new Array(a[i].length);
        for (var j = 0; j < a[i].length; j++) {
            var tmp = copyMatrix(a);
            for (var k = 0; k < tmp.length; k++) {
                tmp[i][k].class += " horizontal-line";
                tmp[k][j].class += " vertical-line";
            }
            var minorHtml = drawMatrix(tmp);
            for (var k = 0; k < tmp.length; k++) {
                tmp[i][k].class = undefined;
                tmp[k][j].class += undefined;
            }
            minors[i][j] = minorMatrix(a, i, j);
            Aij[i][j] = multFraction(detMatrix(minors[i][j]), getFraction((i + j) % 2 ? "-1" : "1"));
            solve += drawScrollBlock("A<sub>" + (i + 1) + (j + 1) + "</sub> = (-1)<sup>(" + (i + 1) + "+" + (j + 1) + ")</sup> &#215 det" + minorHtml + " = (-1)<sub></sub><sup>" + (i + 1 + j + 1) + "</sup> &#215 det" + drawMatrix(minors[i][j]) + " = " + printFraction(Aij[i][j], view, digits));
        }
    }
    solve += "Получили следующую матрицу:";
    solve += drawScrollBlock("C<sup>*</sup> = " + drawMatrix(Aij));
    var transposed = transposeMatrix(Aij);
    solve += "3. Транспонируем полученную матрицу С<sup>*</sup>:";
    solve += drawScrollBlock("C<sup>*T</sup> = " + drawMatrix(Aij, "T") + "= " + drawMatrix(transposed));
    var detInv = divFraction(getFraction("1"), det);
    solve += "4. Обратная матрица находится по формуле: A<sup>-1</sup> = " + drawFraction("1", "det A") + "&#215C<sup>*T</sup>:";
    solve += "<div class='scroll-block'>" + drawMatrix(a, "-1") + " = " + printFraction(detInv) + " &#215 " + drawMatrix(transposed) + " = ";
    for (var i = 0; i < a.length; i++)
        for (var j = 0; j < a[i].length; j++) transposed[i][j] = divFraction(transposed[i][j], det);
    solve += drawMatrix(transposed) + "</div>";
    return solve;
}

function detGauss(a, det, view, digits) {
    if (checkTriangle(a)) {
        solve = "Матрица является треугольной. Определитель треугольной матрицы равен произведению диагональных элементов: <div class='scroll-block'>det " + drawMatrix(a) + " = " + printFraction(a[0][0], view, digits);
        for (var i = 1; i < a.length; i++) solve += "·" + printNgFraction(a[i][i], view, digits);
        solve += " = " + printFraction(det, view, digits) + "</div>";
    } else {
        var c = copyMatrix(a);
        var n = c.length;
        var solve = "1. Приведём матрицу к треугольному виду:<br>";
        var count = 0;
        var zeroed = false;
        for (var j = 0; j < n; j++) {
            if (c[j][j].n.isZero()) {
                var stringNum = j + 1;
                while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
                if (stringNum < c.length) {
                    solve += "Переставим строки " + (stringNum + 1) + " и " + (j + 1) + ", знак определителя изменится на противоположный:";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    swapRowsMatrix(c, stringNum, j);
                    count++;
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                } else {
                    return solve + "В столбце " + (j + 1) + " все элементы, начиная с диагонального равны нулю. Определитель равен нулю.";
                }
            }
            for (var i = j + 1; i < c.length; i++) {
                var elem = divFraction(c[i][j], c[j][j]);
                if (!elem.n.isZero()) {
                    solve += "Вычтем из " + (i + 1) + "-й строки " + (j + 1) + "-ю строку" + (printFraction(elem, 1) == "1" ? "" : ", умноженную на " + printFraction(elem, 1)) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    minusStringMatrix(c, j, i, elem);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                }
            }
        }
        solve += "2. Определитель треугольной матрицы равен произведению <i>диагональных элементов</i> с учётом <u>возможной смены знака</u>: <div class='scroll-block'>det " + drawMatrix(a) + " = det" + drawMatrix(c) + " = " + printFraction(c[0][0], view, digits);
        var p = c[0][0];
        for (var i = 1; i < a.length; i++) {
            solve += "·" + printNgFraction(c[i][i], view, digits);
            p = multFraction(p, c[i][i]);
        }
        solve += " = " + printFraction(p, view, digits) + "</div>";
        if (count == 0) {
            solve += "Знак определителя не менялся. Определитель совпадает с произведением диагольных элементов.";
        } else if (count % 2) {
            solve += "Знак определителя менялся нечётное число раз. Полученное произведение диагональных элементов нужно умножить на -1.";
            solve += "<div class='scroll-block'>det " + drawMatrix(a) + " = (-1)·" + printNgFraction(p, view, digits) + " = ";
            p.n = p.n.multiply(bigInt.minusOne);
            solve += printFraction(p, view, digits);
        } else {
            solve += "Знак определителя менялся чётное число раз. Определитель совпадает с произведением диагольных элементов.";
        }
    }
    return solve;
}

function systemGauss(a, coef, vector, view, digits) {
    var c = copyMatrix(a);
    var b = copyMatrix(coef);
    var x = new Array(c.length);
    for (var i = 0; i < c.length; i++) {
        x[i] = [];
        x[i][0] = 0;
    }
    var solve = "Ищем решение следующей системы:";
    solve += drawScrollBlock(drawMatrix(c) + "×" + drawMatrix(vector) + " = " + drawMatrix(b));
    solve = "<b>Выполним прямой ход методом Гаусса:</b><br>";
    for (var j = 0; j < c.length; j++) {
        if (c[j][j].n.isZero()) {
            var stringNum = j + 1;
            while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
            if (stringNum < c.length) {
                solve += "Переставим строки " + (stringNum + 1) + " и " + (j + 1) + ":";
                solve += "<div class='scroll-block'>" + drawMatrix(c) + "×" + drawMatrix(vector) + " = " + drawMatrix(b) + " &rarr; ";
                swapRowsMatrix(c, stringNum, j);
                swapRowsMatrix(b, stringNum, j);
                solve += drawMatrix(c) + drawMatrix(vector) + " = " + drawMatrix(b) + "</div>";
            } else
                continue;
        }
        for (var i = j + 1; i < c.length; i++) {
            var elem = divFraction(c[i][j], c[j][j]);
            if (!elem.n.isZero()) {
                solve += "Вычтем из " + (i + 1) + "-й строки " + (j + 1) + "-ю строку" + (printFraction(elem, 1) == "1" ? "" : ", умноженную на " + printFraction(elem, 1)) + ":";
                solve += "<div class='scroll-block'>" + drawMatrix(c) + "×" + drawMatrix(vector) + " = " + drawMatrix(b) + " &rarr; ";
                minusStringMatrix(c, j, i, elem);
                minusStringMatrix(b, j, i, elem);
                solve += drawMatrix(c) + "×" + drawMatrix(vector) + " = " + drawMatrix(b) + "</div>";
            }
        }
    }
    for (var i = c.length - 1; i >= 0; i--) {
        var sum = getFraction("0");
        var numerator = ["", ""];
        for (var j = c.length - 1; j > i; j--) {
            sum = addFraction(sum, multFraction(c[i][j], x[j][0]));
            numerator[0] += "-" + printNgFraction(c[i][j], view, digits) + "·" + printNgFraction(x[j][0], view, digits);
            numerator[1] += "-a<sub>" + (i + 1) + (j + 1) + "</sub>·x<sub>" + (j + 1) + "</sub>";
        }
        x[i][0] = divFraction(subFraction(b[i][0], sum), c[i][i]);
        solve += "<div class='scroll-block'>x<sub>" + (i + 1) + "</sub> = ";
        solve += drawFraction("b<sub>" + (i + 1) + "</sub>" + numerator[1], "a<sub>" + (i + 1) + (i + 1) + "</sub>") + " = ";
        solve += drawFraction(printFraction(b[i][0], view, digits) + numerator[0], printFraction(c[i][i], view, digits)) + " = " + printFraction(x[i][0], view, digits) + "</div>";
    }
    return solve;
}

function systemReverse(a, b, view, digits) {
    var a1 = reverseMatrix(a);
    var x = multMatrix(a1, b);
    var solve = "AX=B &harr; A<sup>-1</sup>(AX) = A<sup>-1</sup>B &harr; X = A<sup>-1</sup>×B<br>";
    solve += "<b>1. Вычислим обратную матрицу:</b>";
    solve += drawScrollBlock(drawMatrix(a, "-1") + " = " + drawMatrix(a1));
    solve += "<b>2. Найдём решение, умножив обратную матрицу на вектор коэффициентов:</b>";
    solve += drawScrollBlock("X = " + drawMatrix(a1) + "×" + drawMatrix(b) + " = " + drawMatrix(multSolveMatrix(a1, b, view, digits)) + " = " + drawMatrix(x));
    return solve;
}

function systemKramer(a, b, view, digits) {
    var det = detMatrix(a);
    var dets = new Array(a.length);
    var solve = "<b>1. Найдём определитель матрицы A:</b>";
    solve += drawScrollBlock("Δ = det" + drawMatrix(a) + " = " + printFraction(det, view, digits));
    solve += "<b>2. Найдём " + a.length + " определителей матриц, в которых i-ый столбец заменён на вектор коэффициентов B:</b>";
    for (var j = 0; j < a[0].length; j++) {
        var a1 = copyMatrix(a);
        for (var i = 0; i < a1.length; i++) a1[i][j] = b[i][0];
        dets[j] = detMatrix(a1);
        solve += drawScrollBlock("Δ<sub>" + (j + 1) + "</sub> = det" + drawMatrix(a1) + " = " + printFraction(dets[j], view, digits));
    }
    solve += "<b>3. Вычислим значения коэффициентов вектора X по формуле x<sub>i</sub> = " + drawFraction("Δ<sub>i</sub>", "Δ") + ": </b>";
    for (var j = 0; j < a[0].length; j++) solve += drawScrollBlock("x<sub>" + (j + 1) + "</sub> = " + drawFraction("Δ<sub>" + (j + 1) + "</sub>", "Δ") + " = " + drawFraction(printFraction(dets[j], view, digits), printFraction(det, view, digits)) + " = " + printFraction(divFraction(dets[j], det), view, digits));
    return solve;
}

function do_transpose(matrix) {
    var answer = drawMatrix(matrix, "T") + " = " + drawMatrix(transposeMatrix(matrix));
    var solve = "";
    for (var i = 0; i < matrix.length; i++) {
        var row = new Array(1);
        row[0] = new Array(matrix[i].length);
        for (var j = 0; j < matrix[i].length; j++) row[0][j] = matrix[i][j];
        solve += "Заменим " + (i + 1) + "-ю строку на столбец: ";
        solve += drawScrollBlock(drawMatrix(row) + "&#8594;" + drawMatrix(transposeMatrix(row)));
    }
    return drawAnswer(answer, "Транспонирование матрицы") + drawSolve(solve);
}

function do_pow(matrix, view, digits) {
    var pow = $("#power").val() == "" ? $("#power").attr("placeholder") : $("#power").val();
    var error = false;
    var textError = "";
    if (matrix.length != matrix[0].length) {
        error = true;
        textError = "невозможно выполнить возведение в степень — матрица должна быть квадратной";
    }
    if (!error && (parseInt(pow) != pow || pow < 0)) {
        error = true;
        textError = "невозможно выполнить возведение в степень — степень должна быть натуральным числом";
    }
    if (error) return "<span class=\"error-text\">" + textError + "</span>";
    var powered = powSolveMatrix(copyMatrix(matrix), matrix, pow, view, digits);
    var answer = drawMatrix(matrix, pow) + " = " + drawMatrix(powered.matrix);
    var solve = powered.solve;
    return drawAnswer(answer, "Возведение матрицы в степень (" + pow + ")") + drawSolve(solve);
}

function do_const_mult(matrix, view, digits) {
    var x = $("#parameter").val() == "" ? $("#parameter").attr("placeholder") : $("#parameter").val();
    if (!correctElement(x)) return "<span class='error-text'>невозможно умножить на константу — запись некорректна</span>";
    x = getFraction(x, false);
    var answer = drawMatrix(matrix) + "&#215;" + printFraction(x, view, digits) + " = " + drawMatrix(multConstMatrix(matrix, x));
    var solve = "Умножим каждый элемент на " + printFraction(x, 1) + ":";
    solve += drawScrollBlock(drawMatrix(matrix) + "&#215;" + printNgFraction(x, view, digits) + " = " + drawMatrix(multConstSolveMatrix(matrix, x, view, digits)) + " = " + drawMatrix(multConstMatrix(matrix, x)));
    return drawAnswer(answer, "Умножение матрицы на константу (" + printFraction(x) + ")") + drawSolve(solve);
}

function do_reverse(a, view, digits) {
    var error = false;
    var textError = "";
    if (a.length != a[0].length) {
        error = true;
        textError = "невозможно найти обратную матрицу — матрица должна быть квадратной";
    }
    var det = detMatrix(a);
    if (!error && det.n.isZero()) {
        error = true;
        textError = "невозможно найти обратную матрицу — определитель равен нулю";
    }
    if (error) return "<span class=\"error-text\">" + textError + "</span>";
    var answer = drawMatrix(a, "-1") + " = " + drawMatrix(reverseMatrix(a));
    var solve = "";
    var solve2 = "";
    if ($("#reverseGauss").is(":checked")) solve = reverseGaussSolve(a, view, digits);
    if ($("#reverseAlgAddition").is(":checked")) solve2 = reverseAlgAddSolve(a, det, view, digits);
    return drawAnswer(answer, "Вычисление обратной матрицы") + (solve != "" ? drawSolve(solve, "Решение методом Гауса-Жордана") : "") + (solve2 != "" ? drawSolve(solve2, "Решение методом присоединённой матрицы") : "");
}

function do_det(a, view, digits) {
    if (a.length != a[0].length) return "<span class=\"error-text\">" + "невозможно вычислить определитель — матрица должна быть квадратной!" + "</span>";
    var det = detMatrix(a);
    var answer = "det" + drawMatrix(a) + " = " + printFraction(det, view, digits);
    var solve = "";
    var index;
    if (checkZero(a)) {
        solve = "Матрица нулевая. Определитель нулевой матрицы равен нулю.";
    } else if ((index = checkZeroRow(a)) > -1) {
        for (var j = 0; j < a[0].length; j++) a[index][j].class = "red-cell";
        solve += drawScrollBlock(drawMatrix(a));
        solve += (index + 1) + "-я строка матрицы нулевая. Если хотя бы одна строка (или столбец) матрицы нулевая, то определитель равен нулю.";
    } else if ((index = checkZeroCol(a)) > -1) {
        for (var i = 0; i < a.length; i++) a[i][index].class = "red-cell bgclip";
        solve += drawScrollBlock(drawMatrix(a));
        solve += (index + 1) + "-ый столбец матрицы нулевой. Если хотя бы один столбец (или строка) матрицы нулевой, то определитель равен нулю.";
    } else if (a.length == 1) {
        solve = "Определитель матрицы 1 на 1 равен её элементу: " + drawScrollBlock(drawMatrix(a) + " = " + printFraction(a[0][0], view, digits));
    } else if (a.length == 2) {
        solve = "Определитель матрицы 2 на 2 равен <code>a<sub>11</sub>·a<sub>22</sub> - a<sub>12</sub>·a<sub>21</sub></code>:";
        solve += drawScrollBlock("det " + drawMatrix(a) + " = " + printNgFraction(a[0][0], view, digits) + "·" + printNgFraction(a[1][1], view, digits) + " - " + printNgFraction(a[0][1], view, digits) + "·" + printNgFraction(a[1][0], view, digits) + " = " + printFraction(det, view, digits));
    } else {
        solve = detGauss(a, det, view, digits);
    }
    return drawAnswer(answer, "Вычисление определителя матрицы") + drawSolve(solve);
}

function do_rank(matrix, view, digits) {
    var answer = "rank" + drawMatrix(matrix) + " = " + rankMatrix(matrix);
    var solve;
    var triangle = triangleMatrix(matrix);
    if (checkZero(matrix)) {
        solve = "Матрица нулевая. По определению ранг нулевой матрицы равен нулю.";
    } else if (checkTriangle(matrix)) {
        solve = "Матрица является ступенчатой, так что её ранг равен числу ненулевых строк в ней.";
    } else {
        solve = "1. Приведём матрицу к ступенчатому виду при помощи элементарных преобразований строк:";
        solve += drawScrollBlock(drawMatrix(matrix) + " &rarr; " + drawMatrix(triangle));
        solve += "<div><div class='solve-block-hide'><span class='fa fa-caret-right'></span><b>Подробное приведение</b></div><div class='solve'>";
        var c = copyMatrix(matrix);
        var n = c.length > c[0].length ? c[0].length : c.length;
        var start = 0;
        for (var j = 0; j < n; j++) {
            start++;
            if (c[j][j].n.isZero()) {
                var stringNum = j + 1;
                while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
                if (stringNum < c.length) {
                    solve += "Переставим строки " + (stringNum + 1) + " и " + (j + 1) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    swapRowsMatrix(c, stringNum, j);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                } else {
                    start--;
                    continue;
                }
            }
            for (var i = start; i < c.length; i++) {
                var elem = divFraction(c[i][j], c[start - 1][j]);
                if (!elem.n.isZero()) {
                    solve += "Вычтем из " + (i + 1) + "-й строки " + (start) + "-ю строку" + (printFraction(elem, 1) == "1" ? "" : ", умноженную на " + printFraction(elem, 1)) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    minusStringMatrix(c, start - 1, i, elem);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                }
            }
        }
        solve += "</div></div>";
        solve += "2. Ранг матрицы равен числу ненулевых строк в получившейся матрице.";
    }
    return drawAnswer(answer, "Вычисление ранга матрицы") + drawSolve(solve);
}

function do_track(a, view, digits) {
    if (a.length != a[0].length) return "<span class=\"error-text\">" + "невозможно вычислить след матрицы — матрица должна быть квадратной!" + "</span>";
    var track = trackMatrix(a);
    var answer = "tr" + drawMatrix(a) + " = " + printFraction(track, view, digits);
    var solve;
    if (a.length == 1) {
        solve = "Матрица состоит из одного элемента, след равен этому элементу: " + printFraction(a[0][0], view, digits);
    } else {
        solve = "<div class='scroll-block'>" + "tr" + drawMatrix(a) + " = ";
        solve += printFraction(a[0][0], view, digits);
        for (var i = 1; i < a.length; i++) solve += "+" + (a[i][i].n.isNegative() ? "(" + printFraction(a[i][i], view, digits) + ")" : printFraction(a[i][i], view, digits));
        solve += " = " + printFraction(track, view, digits) + "</div>";
    }
    return drawAnswer(answer, "Вычисление следа матрицы") + drawSolve(solve);
}

function do_triangle(a, view, digits) {
    if (a.length != a[0].length) return "<span class=\"error-text\">" + "невозможно привести к треугольному виду — матрица должна быть квадратной" + "</span>";
    var answer = drawMatrix(a) + " &rarr; " + drawMatrix(triangleMatrix(a));
    var solve = "";
    if (checkTriangle(a)) {
        solve = "Матрица уже приведена к треугольному виду.";
    } else {
        var c = copyMatrix(a);
        var n = c.length > c[0].length ? c[0].length : c.length;
        var start = 0;
        for (var j = 0; j < n; j++) {
            start++;
            if (c[j][j].n.isZero()) {
                var stringNum = j + 1;
                while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
                if (stringNum < c.length) {
                    solve += "Переставим строки " + (stringNum + 1) + " и " + (j + 1) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    swapRowsMatrix(c, stringNum, j);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                } else {
                    start--;
                    continue;
                }
            }
            for (var i = start; i < c.length; i++) {
                var elem = divFraction(c[i][j], c[start - 1][j]);
                if (!elem.n.isZero()) {
                    solve += "Вычтем из " + (i + 1) + "-й строки " + (start) + "-ю строку" + (printFraction(elem, 1) == "1" ? "" : ", умноженную на " + printFraction(elem, 1)) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    minusStringMatrix(c, start - 1, i, elem);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                }
            }
        }
    }
    return drawAnswer(answer, "Приведение матрицы к треугольному виду") + drawSolve(solve);
}

function do_stepped(a, view, digits) {
    var answer = drawMatrix(a) + " &rarr; " + drawMatrix(triangleMatrix(a));
    var solve = "";
    if (checkTriangle(a)) {
        solve = "Матрица уже приведена к ступенчатому виду.";
    } else {
        var c = copyMatrix(a);
        var n = c.length > c[0].length ? c[0].length : c.length;
        var start = 0;
        for (var j = 0; j < n; j++) {
            start++;
            if (c[j][j].n.isZero()) {
                var stringNum = j + 1;
                while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
                if (stringNum < c.length) {
                    solve += "Переставим строки " + (stringNum + 1) + " и " + (j + 1) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    swapRowsMatrix(c, stringNum, j);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                } else {
                    start--;
                    continue;
                }
            }
            for (var i = start; i < c.length; i++) {
                var elem = divFraction(c[i][j], c[start - 1][j]);
                if (!elem.n.isZero()) {
                    solve += "Вычтем из " + (i + 1) + "-й строки " + (start) + "-ю строку" + (printFraction(elem, 1) == "1" ? "" : ", умноженную на " + printFraction(elem, 1)) + ":";
                    solve += "<div class='scroll-block'>" + drawMatrix(c);
                    minusStringMatrix(c, start - 1, i, elem);
                    solve += " &rarr; " + drawMatrix(c) + "</div>";
                }
            }
        }
    }
    return drawAnswer(answer, "Приведение матрицы к ступенчатому виду") + drawSolve(solve);
}

function do_lu_decomposition(a, view, digits) {
    if (a.length != a[0].length) return "<span class=\"error-text\">" + "невозможно получить LU разложение — матрица должна быть квадратной" + "</span>";
    for (var i = 0; i < a.length; i++) {
        var minor = mainMinorMatrix(a, i + 1);
        if (minor.det.n.isZero()) return "<span class=\"error-text\">" + "невозможно получить LU разложение — главный миноор порядка " + (i + 1) + " равен нулю.</span>";
    }
    var solve = "";
    var n = a.length;
    var L, U;
    if (n > 1) {
        L = new Array(n);
        U = new Array(n);
        for (var i = 0; i < n; i++) {
            L[i] = new Array(n);
            U[i] = new Array(n);
            for (var j = 0; j < n; j++) {
                L[i][j] = getFraction("0");
                U[i][j] = getFraction("0");
            }
        }
        for (var j = 0; j < n; j++) {
            U[0][j] = a[0][j];
            L[j][0] = divFraction(a[j][0], U[0][0]);
        }
        solve += "1. Инициализация. Заполним элементы матриц в соответствии с формулами: <code>u<sub>1j</sub> = a<sub>1j</sub></code>, <code style='display:inline-block'>l<sub>j1</sub> = " + drawFraction("a<sub>1j</sub>", "u<sub>11</sub>") + "</code>, j = 1.." + n + ":";
        solve += drawScrollBlock("U = " + drawMatrix(U) + ", L = " + drawMatrix(L));
        solve += "Для i = 2.." + n + ":<br>";
        solve += "&emsp;<code>u<sub>ij</sub> = a<sub>ij</sub> - &Sigma;(l<sub>ik</sub>·u<sub>kj</sub>)</code>, k = 1...i-1, j = i..." + n + ".<br>";
        solve += "&emsp;<code style='display:inline-block'>l<sub>ji</sub> = " + drawFraction("1", "u<sub>ii</sub>") + "·(a<sub>ji</sub> - &Sigma;(l<sub>jk</sub>·u<sub>ki</sub>))</code>, k = 1...i-1, j = i..." + n + ".<br>";
        for (var i = 1; i < n; i++) {
            for (var j = i; j < n; j++) {
                solve += "<div class='scroll-block'>u<sub>" + (i + 1) + (j + 1) + "</sub> = " + printFraction(a[i][j], view, digits) + " - (";
                var sum = getFraction("0");
                for (var k = 0; k < i; k++) {
                    sum = addFraction(sum, multFraction(L[i][k], U[k][j]));
                    solve += printNgFraction(L[i][k], view, digits) + "·" + printNgFraction(U[k][j], view, digits) + (k < i - 1 ? " + " : "");
                }
                U[i][j] = subFraction(a[i][j], sum);
                solve += ") = " + printFraction(U[i][j], view, digits) + "</div>";
                solve += "<div class='scroll-block'>l<sub>" + (j + 1) + (i + 1) + "</sub> = (" + printFraction(a[j][i], view, digits) + " - (";
                var sum = getFraction("0");
                for (var k = 0; k < i; k++) {
                    sum = addFraction(sum, multFraction(L[j][k], U[k][i]));
                    solve += printNgFraction(L[j][k], view, digits) + "·" + printNgFraction(U[k][i], view, digits) + (k < i - 1 ? " + " : "");
                }
                L[j][i] = divFraction(subFraction(a[j][i], sum), U[i][i]);
                solve += ")) / " + printNgFraction(U[i][i], view, digits) + " = " + printFraction(L[j][i], view, digits) + "</div>";
            }
        }
        var answer = drawMatrix(a) + " = " + drawMatrix(L) + " &#215 " + drawMatrix(U);
        return drawAnswer(answer, "LU разложение матрицы") + (solve == "" ? "" : drawSolve(solve));
    } else {
        var lu = LUDecompositionMatrix(a);
        return drawAnswer(drawMatrix(a) + " = " + drawMatrix(lu.L) + " &#215 " + drawMatrix(lu.U), "LU разложение матрицы")
    }
}

function do_plus(a, b, view, digits) {
    if (a.length != b.length || a[0].length != b[0].length) return "<span class=\"error-text\">" + "невозможно выполнить сложение матриц — матрицы должны быть одного размера" + "</span>";
    var answer = drawMatrix(a) + " + " + drawMatrix(b) + " = " + drawMatrix(plusMatrix(a, b));
    var solve = drawScrollBlock(drawMatrix(a) + " + " + drawMatrix(b) + " = " + drawMatrix(plusSolveMatrix(a, b, view, digits)) + " = " + drawMatrix(plusMatrix(a, b)));
    return drawAnswer(answer, "Сложение матриц") + drawSolve(solve);
}

function do_minus(a, b, view, digits) {
    if (a.length != b.length || a[0].length != b[0].length) return "<span class=\"error-text\">" + "невозможно выполнить разность матриц — матрицы должны быть одного размера" + "</span>";
    var answer = drawMatrix(a) + " - " + drawMatrix(b) + " = " + drawMatrix(minusMatrix(a, b));
    var solve = drawScrollBlock(drawMatrix(a) + " - " + drawMatrix(b) + " = " + drawMatrix(minusSolveMatrix(a, b, view, digits), "", false) + " = " + drawMatrix(minusMatrix(a, b)));
    return drawAnswer(answer, "Вычитание матриц") + drawSolve(solve);
}

function do_mult(a, b, view, digits) {
    if (a[0].length != b.length) return "<span class='error-text'>" + "невозможно выполнить умножение матриц — количество столбцов матрицы A должно совпадать с количеством строк матрицы B" + "</span>";
    var answer = drawMatrix(a) + " &#215 " + drawMatrix(b) + " = " + drawMatrix(multMatrix(a, b));
    var solve = drawScrollBlock(drawMatrix(a) + " &#215 " + drawMatrix(b) + " = " + drawMatrix(multSolveMatrix(a, b, view, digits), "", false) + " = " + drawMatrix(multMatrix(a, b)));
    return drawAnswer(answer, "Умножение матриц") + drawSolve(solve);
}

function do_system(a, b, view, digits) {
    if (a.length != a[0].length) return "<span class='error-text'>" + "невозможно решить систему Ax=B — матрица A должна быть квадратной" + "</span>";
    if (detMatrix(a).n.isZero()) return "<span class='error-text'>" + "невозможно решить систему Ax=B — матрица A вырождена (определитель равен нулю)" + "</span>";
    if (b[0].length != 1) return "<span class='error-text'>" + "невозможно решить систему Ax=B — матрица B должна состоять из одного столбца" + "</span>";
    if (a.length != b.length) return "<span class='error-text'>" + "невозможно решить систему Ax=B — число строк матрицы A и вектор столбца B должно совпадать" + "</span>";
    var vector = new Array(a.length);
    var x = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        vector[i] = [];
        vector[i][0] = "x<sub>" + (i + 1) + "</sub>";
    }
    var answer = drawMatrix(a) + "×" + drawMatrix(vector) + " = " + drawMatrix(b) + " &rarr; X = " + drawMatrix(systemMatrix(a, b));
    var solveGauss = systemGauss(a, b, vector, view, digits);
    var solveReverse = systemReverse(a, b, view, digits);
    var solveKramer = systemKramer(a, b, view, digits);
    var result = drawAnswer(answer, "Решение СЛАУ AX=B");
    if ($("#systemGauss").is(":checked")) result += drawSolve(solveGauss, "Решение методом Гаусса");
    if ($("#systemMatrix").is(":checked")) result += drawSolve(solveReverse, "Решение матричным способом (через обратную матрицу)");
    if ($("#systemKramer").is(":checked")) result += drawSolve(solveKramer, "Решение методом Крамера");
    return result;
}

function do_elementary_transform(a, view, digits) {
    var option = $("#elementary-transforms-option").val();
    var answer = "";
    var solve = "";
    if (option == "row-swap" || option == "col-swap") {
        var index1 = $("#transform-param-1").val() == "" ? $("#transform-param-1").attr("placeholder") : $("#transform-param-1").val();
        var index2 = $("#transform-param-2").val() == "" ? $("#transform-param-2").attr("placeholder") : $("#transform-param-2").val();
        var flag = option == "row-swap";
        var max = flag ? a.length : a[0].length;
        var error = correctNumber(index1, max);
        if (error != "") return "<span class='error-text'>невозможно выполнить перестановку " + (flag ? "строк — первая строка должна" : "столбцов: первый столбец должен") + " " + error;
        error = correctNumber(index2, max);
        if (error != "") return "<span class='error-text'>невозможно выполнить перестановку " + (flag ? "строк — вторая строка должна" : "столбцов: второй столбец должен") + " " + error;
        answer = drawMatrix(a) + " &rarr; ";
        if (flag) swapRowsMatrix(a, index1 - 1, index2 - 1);
        else
            swapColsMatrix(a, index1 - 1, index2 - 1);
        answer += drawMatrix(a);
        return drawAnswer(answer, "Перестановка " + index1 + (flag ? "-й " : "-го ") + " и " + index2 + (flag ? "-й строк" : "-го столбцов"));
    } else if (option == "mult-row-const" || option == "mult-col-const") {
        var index = $("#transform-param-1").val() == "" ? $("#transform-param-1").attr("placeholder") : $("#transform-param-1").val();
        var flag = option == "mult-row-const";
        var max = flag ? a.length : a[0].length;
        var error = correctNumber(index, max);
        if (error != "") return "<span class='error-text'>невозможно выполнить умножение " + (flag ? "строки — строка должна " : "столбца: столбец должен ") + error;
        var p = $("#transform-param-3").val() == "" ? $("#transform-param-3").attr("placeholder") : $("#transform-param-3").val();
        if (!correctElement(p)) return "<span class='error-text'>невозможно выполнить умножение " + (flag ? "строки" : "столбца") + " — '" + p + "' не является корректной записью числа." + "</span>";
        p = getFraction(p, false);
        if (p.n.isZero()) {
            $("#transform-param-3").focus();
            return "<span class='error-text'>невозможно выполнить умножение " + (flag ? "строки" : "столбца") + " — множитель должен быть отличен от нуля." + "</span>";
        }
        answer = drawMatrix(a) + " &rarr; ";
        if (option == "mult-row-const") multRowMatrix(a, index - 1, p);
        else
            multColMatrix(a, index - 1, p);
        answer += drawMatrix(a);
        return drawAnswer(answer, "Умножение " + index + (flag ? "-й строки " : "-го столбца ") + " на " + printFraction(p, view, digits));
    } else if (option == "add-row-const" || option == "add-col-const") {
        var index1 = $("#transform-param-1").val() == "" ? $("#transform-param-1").attr("placeholder") : $("#transform-param-1").val();
        var index2 = $("#transform-param-2").val() == "" ? $("#transform-param-2").attr("placeholder") : $("#transform-param-2").val();
        var flag = option == "add-row-const";
        var max = flag ? a.length : a[0].length;
        var error = correctNumber(index1, max);
        if (error != "") return "<span class='error-text'>невозможно прибавить " + (flag ? "строку — первая строка должна" : "столбец: первый столбец должен") + " " + error;
        error = correctNumber(index2, max);
        if (error != "") return "<span class='error-text'>невозможно прибавить " + (flag ? "строку — вторая строка должна" : "столбец: второй столбец должен") + " " + error;
        var p = $("#transform-param-3").val() == "" ? $("#transform-param-3").attr("placeholder") : $("#transform-param-3").val();
        if (!correctElement(p)) return "<span class='error-text'>невозможно прибавить " + (flag ? "строку" : "столбцец") + " — '" + p + "' не является корректной записью числа." + "</span>";
        p = getFraction(p, false);
        if (p.n.isZero()) return "<span class='error-text'>невозможно прибавить " + (flag ? "строку" : "столбцец") + " — множитель должен быть отличен от нуля." + "</span>";
        answer = drawMatrix(a) + " &rarr; ";
        if (flag) addRowMultMatrix(a, index1 - 1, index2 - 1, p);
        else
            addColMultMatrix(a, index1 - 1, index2 - 1, p);
        answer += drawMatrix(a);
        return drawAnswer(answer, "Добавление к " + index1 + (flag ? "-й строке " : "-му столбцу ") + index2 + (flag ? "-й строки, умноженной" : "-го столбца, умноженного") + " на " + printFraction(p, view, digits));
    }
}

function validateExpression(text) {
    var num = "(\\d+(\\.\\d+)?)";
    var matrix = "(A|B)";
    var expr = text.replace(/\s/g, '').replace(/А/g, 'A').replace(/В/g, "B").toUpperCase();
    for (var i = 1; i < expr.length; i++)
        if ((expr[i - 1].match(/\d/) != null && expr[i].search(matrix) > -1) || (expr[i - 1].search(matrix) > -1 && expr[i].search(matrix) > -1)) expr = expr.substr(0, i) + "*" + expr.substr(i);
    if (expr == "") throw "выражение пустое";
    if (expr.search(/\(\)/g) > -1) throw "присутствует пустая скобочная последовательность";
    if (expr.search(/\)\(/g) > -1) throw "присутствует некорректная скобочная последовательность )(";
    if (expr.search(/\([+*/]/g) > -1) throw "после открывающей скобки не должно быть операции +, * или /";
    if (expr.search(/[-+*/]\)/g) > -1) throw "перед закрывающей скобки не должно быть операций +, -, * или /";
    if (expr.search(/[-+*/][-+*/]/g) > -1) throw "после символа операции не должно быть другого символа операции";
    if (expr.search(new RegExp(matrix + "\\(", "gi")) > -1) throw "после матрицы должна идти операция или закрывающая скобка";
    if (expr.search(new RegExp("\\)" + matrix, "gi")) > -1 || expr.search(new RegExp("\\)" + num, "gi")) > -1) throw "после закрывающей скобки должна идти операция или другая закрывающая скобка";
    if (expr.search(new RegExp(num + matrix, "gi")) > -1) throw "после числа должна идти операция *, матрица или закрывающая скобка";
    var count = 0;
    for (var i = 0; i < expr.length; i++) {
        if (expr[i] == "(") count++;
        else if (expr[i] == ")") count--;
        if (count < 0) throw "скобки не сбалансированы";
    }
    if (count != 0) throw "скобки не сбалансированы";
    var match = expr.match(new RegExp("(\\(|\\)|\\^T|\\^-?\\d+|[-+*/]|" + num + "|" + matrix + ")", "gi"));
    if (match == null) throw "выражение некорректно";
    if (match.join('') != expr) throw "выражение некорректно";
    if (match[0].search(/[+*/]/) > -1) throw "выражение должно начинаться с -, матрицы или открывающей скобки";
    if (match[match.length - 1].search(/^[-+*/(]/) > -1) throw "выражение не может заканчиваться операцией или открывающей скобкой";
}

function priority(op) {
    if (op == "!") return 5;
    if (op.search(new RegExp("\\^-?\\d+", "gi")) > -1 || op == "^T") return 4;
    if (op == "*" || op == "/") return 3;
    if (op == "+" || op == "-") return 2;
    if (op == "(") return 1;
    return 0;
}

function execute(stack, op, solve) {
    console.log("Execute:", stack);
    var digits = $("#print-length input").val() == "" ? $("#print-length input").attr("placeholder") : $("#print-length input").val();
    var view = $("#print-option").val();
    var arg1 = stack[stack.length - 1];
    stack.pop();
    if (op.search(new RegExp("\\^-?\\d+", "gi")) > -1) {
        if (arg1.length != arg1[0].length) throw "невозможно выполнить возведение в степень. Матрица не квадратная";
        var n = op.substr(1);
        var result;
        if (n < 0) {
            if (detMatrix(arg1).n.isZero()) throw "невозможно выполнить возведение в отрицательную степень. Матрица вырождена";
            result = powMatrix(reverseMatrix(arg1), -n);
        } else
            result = powMatrix(arg1, n);
        stack.push(result);
        solve.push(drawScrollBlock(drawMatrix(arg1, n.toString()) + " = " + drawMatrix(result)));
    } else if (op == "^T") {
        var result = transposeMatrix(arg1);
        stack.push(result);
        solve.push(drawScrollBlock(drawMatrix(arg1, "T") + " = " + drawMatrix(result)));
    } else if (op != "!") {
        var arg2 = stack[stack.length - 1];
        stack.pop();
        if (op == "+") {
            if (arg1.length != arg2.length || arg1[0].length != arg2[0].length) throw "невозможно выполнить сложение матриц. Размеры матриц не совпадают.";
            var result = plusMatrix(arg2, arg1);
            stack.push(result);
            solve.push(drawScrollBlock(drawMatrix(arg2) + " + " + drawMatrix(arg1) + " = " + drawMatrix(result)));
        } else if (op == "-") {
            if (arg1.length != arg2.length || arg1[0].length != arg2[0].length) throw "невозможно выполнить вычитание матриц. Размеры матриц не совпадают.";
            var result = minusMatrix(arg2, arg1);
            stack.push(result);
            solve.push(drawScrollBlock(drawMatrix(arg2) + " - " + drawMatrix(arg1) + " = " + drawMatrix(result)));
        } else if (op == "*") {
            if (arg2.constructor === Array && arg1.constructor === Array) {
                if (arg2[0].length != arg1.length) throw "невозможно выполнить умножение матриц. Размеры матриц некорректны";
                var result = multMatrix(arg2, arg1);
                stack.push(result);
                solve.push(drawScrollBlock(drawMatrix(arg2) + " &#215; " + drawMatrix(arg1) + " = " + drawMatrix(result)));
            } else if (arg2.constructor === Array) {
                var result = multConstMatrix(arg2, arg1);
                stack.push(result);
                solve.push(drawScrollBlock(drawMatrix(arg2) + " &#215; " + printFraction(arg1, view, digits) + " = " + drawMatrix(result)));
            } else if (arg1.constructor === Array) {
                var result = multConstMatrix(arg1, arg2);
                stack.push(result);
                solve.push(drawScrollBlock(drawMatrix(arg1) + " &#215; " + printFraction(arg2, view, digits) + " = " + drawMatrix(result)));
            } else {
                var result = multFraction(arg1, arg2);
                stack.push(result);
                solve.push(drawScrollBlock(printFraction(arg1, view, digits) + " &#215; " + printFraction(arg2, view, digits) + " = " + printFraction(result, view, digits)));
            }
        } else if (op == "/") {
            if (arg1.constructor === Array) {
                if (arg1.length != arg1[0].length) throw "невозможно выполнить деление матриц. Матрица не квадратная";
                if (detMatrix(arg1).n.isZero()) throw "невозможно выполнить возведение в отрицательную степень. Матрица вырождена";
                if (arg2[0].length != arg1.length) throw "невозможно выполнить деление. Размеры матриц некорректны";
                var result = multMatrix(arg2, reverseMatrix(arg1));
                stack.push(result);
                solve.push(drawScrollBlock(drawMatrix(arg2) + " / " + drawMatrix(arg1) + " = " + drawMatrix(result)));
            } else {
                var p = divFraction(getFraction("1"), arg1);
                var result = multConstMatrix(arg2, p);
                stack.push(result);
                solve.push(drawScrollBlock(drawMatrix(arg2) + " / " + printFraction(p, view, digits) + " = " + drawMatrix(result)));
            }
        } else
            throw "выражение некорректно";
    } else {
        if (arg1.constructor === Array) {
            var result = multConstMatrix(arg1, getFraction("-1"));
            stack.push(result);
            solve.push(drawScrollBlock(drawMatrix(arg1) + " &#215; " + printFraction(getFraction("-1"), view, digits) + " = " + drawMatrix(result)));
        } else {
            var result = multFraction(arg1, getFraction("-1"));
            stack.push(result);
            solve.push(drawScrollBlock(printFraction(arg1, view, digits) + " &#215; " + printFraction(getFraction("-1"), view, digits) + " = " + drawMatrix(result)));
        }
    }
}

function do_expression() {
    var digits = $("#print-length input").val() == "" ? $("#print-length input").attr("placeholder") : $("#print-length input").val();
    var view = $("#print-option").val();
    try {
        validateExpression($("#expression").val());
        var num = "(\\d+(\\.\\d+)?)";
        var fraction = "\\d+\/\\d+";
        var matrix = "(A|B)";
        var expr = $("#expression").val() == "" ? $("#expression").attr("placeholder") : $("#expression").val();
        expr = expr.replace(/\s/g, '').replace(/А/g, 'A').replace(/В/g, "B").toUpperCase();
        for (var i = 1; i < expr.length; i++) {
            if ((expr[i - 1].match(/\d/) != null || expr[i - 1].search(matrix) > -1 || expr[i - 1].match(/T/) != null) && expr[i].search(matrix) > -1) expr = expr.substr(0, i) + "*" + expr.substr(i);
            else if (expr[i - 1].search(matrix) > -1 && expr[i].match(/\d/) != null) expr = expr.substr(0, i) + "*" + expr.substr(i);
        }
        var match = expr.match(new RegExp("(" + fraction + "|" + "\\(|\\)|\\^T|\\^-?\\d+|[-+*/]|" + num + "|" + matrix + ")", "gi"));
        var stack = new Array();
        var operands = new Array();
        var solve = new Array();
        var unary = true;
        for (var i = 0; i < match.length; i++) {
            if (match[i].search(new RegExp(matrix, "gi")) > -1) {
                operands.push(getMatrix(match[i] == "A" ? "#first-matrix" : "#second-matrix"));
                unary = false;
            } else if (match[i].search(new RegExp("^(" + fraction + "|" + num + ")", "gi")) > -1) {
                operands.push(getFraction(match[i]));
                unary = false;
            } else if (match[i] == "+" || match[i] == "-" || match[i] == "*" || match[i] == "/" || match[i].match(new RegExp("\\^-?\\d+", "gi")) != null || match[i] == "^T") {
                if (match[i] == '-' && unary) match[i] = "!";
                var pr = priority(match[i]);
                while (stack.length > 0 && priority(stack[stack.length - 1]) >= pr) {
                    execute(operands, stack[stack.length - 1], solve);
                    stack.pop();
                }
                stack.push(match[i]);
                unary = false;
            } else if (match[i] == "(") {
                stack.push(match[i]);
                unary = true;
            } else if (match[i] == ')') {
                while (stack.length > 0 && stack[stack.length - 1] != "(") {
                    execute(operands, stack[stack.length - 1], solve);
                    stack.pop();
                }
                if (stack.length == 0) throw "скобки не сбалансированы!";
                stack.pop();
                unary = false;
            } else
                throw "некорректные символы в выражении: '" + match[i] + "' ";
        }
        while (stack.length > 0) {
            if (stack[stack.length - 1] == '(') throw "скобки не сбалансированы!";
            execute(operands, stack[stack.length - 1], solve);
            stack.pop();
        }
        var A = drawMatrix(getMatrix("#first-matrix"));
        var B = drawMatrix(getMatrix("#second-matrix"));
        var tmp = expr;
        var expr = "";
        for (var i = 0; i < match.length; i++) {
            if (match[i].toUpperCase() == "A") expr += A;
            else if (match[i].toUpperCase() == "B") expr += B;
            else if (match[i] == "*") expr += "×";
            else if (match[i] == "!") expr += "-";
            else if (match[i][0] == "^") {
                if (expr.lastIndexOf("</sup>") == expr.length - 6) {
                    expr = expr.substr(0, expr.length - 6) + "·";
                } else
                    expr += "<sup>";
                var n = match[i].substr(1);
                expr += (n < 0 ? "(" + n + ")" : n) + "</sup>";
            } else
                expr += match[i];
        }
        var answer = expr + " = " + (operands[0].constructor === Array ? drawMatrix(operands[0]) : printFraction(operands[0], view, digits));
        return drawAnswer(answer, "Вычисление выражения с матрицами (" + tmp + ")") + drawSolve(solve.join(""));
    } catch (e) {
        return "<span class='error-text'>" + e + "</span>";
    }
}

function processCheckbox(state1, state2) {
    if (!(state1 || state2)) {
        $("#no-matrix").text("Должна быть выбрана хотя бы одна матрица!");
        $("#calculator-option").addClass("no-display");
        $(".calculate-buttons").addClass("no-display");
        $("#calculate-print-options").addClass("no-display");
    } else if (state1 ^ state2) {
        $("#no-matrix").text("");
        $("#calculator-option").removeClass("no-display");
        $(".calculate-buttons").removeClass("no-display");
        $("#calculate-print-options").removeClass("no-display");
    }
    var options = state1 ^ state2 ? oneMatrixOptions : twoMatrixOptions;
    var select = $("#calc-option");
    select.empty();
    $.each(options, function(key, value) {
        select.append($("<option></option>").attr("value", key).text(value));
    });
    if (state1 && state2) {
        $("#swap").removeClass("no-display");
    } else {
        $("#swap").addClass("no-display");
    }
    if (state1 && state2) $("#calc-option").val(twoMatrixOptionSelected).change();
    if (state1 ^ state2) $("#calc-option").val(oneMatrixOptionSelected).change();
}

function updateScrollblocks() {
    $(".scroll-block").each(function() {
        if ($(this)[0].scrollWidth > $(this).width() + 1) $(this).addClass("scroll-block-img");
        else
            $(this).removeClass("scroll-block-img");
    });
}

function updateDragAndDrop() {
    $(".matrix[draggable='true']").each(function() {
        var id = $(this).attr("id");
        document.getElementById(id).addEventListener("touchstart", dragStart, false);
        document.getElementById(id).addEventListener("dragstart", dragStart, false);
        document.getElementById(id).addEventListener("dragend", dragEnd, false);
        document.getElementById(id).addEventListener('touchmove', dragStart, false);
    });
}

function calculate(option, matrix, first_matrix, second_matrix) {
    var digits = $("#print-length input").val() == "" ? $("#print-length input").attr("placeholder") : $("#print-length input").val();
    var view = $("#print-option").val();
    var t1 = performance.now();
    switch (option) {
        case "transpose":
            return do_transpose(matrix);
        case "pow":
            return do_pow(matrix, view, digits);
        case "const-mult":
            return do_const_mult(matrix, view, digits);
        case "reverse":
            return do_reverse(matrix, view, digits);
        case "det":
            return do_det(matrix, view, digits);
        case "rank":
            return do_rank(matrix, view, digits);
        case "track":
            return do_track(matrix, view, digits);
        case "triangle":
            return do_triangle(matrix, view, digits);
            break;
        case "stepped":
            return do_stepped(matrix, view, digits);
        case "lu-decomposition":
            return do_lu_decomposition(matrix, view, digits);
        case "elementary-transforms":
            return do_elementary_transform(matrix, view, digits);
        case "plus":
            return do_plus(first_matrix, second_matrix, view, digits);
        case "minus":
            return do_minus(first_matrix, second_matrix, view, digits);
        case "mult":
            return do_mult(first_matrix, second_matrix, view, digits);
        case "system":
            return do_system(first_matrix, second_matrix, view, digits);
        case "expression":
            return do_expression();
        default:
            return "<span class='error-text'>Извините, к сожалению, эта функция ещё не реализована</span>";
    }
}
$(document).ready(function() {
    changeSize("#first-matrix");
    changeSize("#second-matrix");
    updateScrollblocks();
    updateDragAndDrop();
    $("#first-matrix-check").prop('checked', true);
    $("#second-matrix-check").prop('checked', false);
    $("#calc-option").val("det");
    $(".calculate-buttons label").hide();
    $("#calc-option").change(changeOption);
    $.fn.image = function(src, f) {
        return this.each(function() {
            var i = new Image();
            i.src = src;
            i.onload = f;
            this.appendChild(i);
        });
    };
    var first_elems = $(".first-matrix");
    var second_elems = $(".second-matrix");
    let divider = $(".matrix-calculator-block.swap");
    var state1 = true;
    var state2 = false;
    $("#second-matrix-check").change(function() {
        state1 = $("#first-matrix-check").is(":checked");
        state2 = $("#second-matrix-check").is(":checked");
        processCheckbox(state1, state2);
        second_elems.toggleClass("second-matrix-hidden");
        divider.toggleClass("matrix-calculator-block-hidden");
    });
    $("#first-matrix-check").change(function() {
        state1 = $("#first-matrix-check").is(":checked");
        state2 = $("#second-matrix-check").is(":checked");
        processCheckbox(state1, state2);
        first_elems.toggleClass("first-matrix-hidden");
    });
    $(".calculate-btn").click(function() {
        $(".calc-result").css("display", "block");
        var first_matrix = getMatrix("#first-matrix");
        var second_matrix = getMatrix("#second-matrix");
        var matrix;
        if (state1 ^ state2) matrix = state1 ? first_matrix : second_matrix;
        var option = $("#calc-option").val();
        var t1 = performance.now();
        var result = calculate(option, matrix, first_matrix, second_matrix);
        var t2 = performance.now();
        savePage();
        if (result.indexOf("error-text") > -1) {
            $("#errors-block").removeClass("no-display").html("Ошибка: " + result);
            scrollTo('#errors-block');
        } else {
            $("#errors-block").addClass("no-display");
            $(".calc-result").html(drawResult(result, (option != "det" && option != "rank" && option != "track"), option) + $(".calc-result").html());
            scrollTo('#result');
            if (document.querySelectorAll('.calc-result-hist').length > 1)
                document.querySelectorAll('.calc-result-hist')[1].remove();
            $(".calc-result-hist .calc-result-hist-buttons .move-to-a").click(function() {
                var x = getMatrix($(this).parent().parent().find(".main-solve .matrix:last"), false);
                setMatrix("#first-matrix", x);
                $("#first-matrix-rows").val(x.length);
                $("#first-matrix-cols").val(x[0].length);
                if (!state1) $("#first-matrix-check").prop("checked", true).change();
                scrollTo("#first-matrix-block");
            });
            $(".calc-result-hist .calc-result-hist-buttons .move-to-b").click(function() {
                var x = getMatrix($(this).parent().parent().find(".main-solve .matrix:last"), false);
                setMatrix("#second-matrix", x);
                $("#second-matrix-rows").val(x.length);
                $("#second-matrix-cols").val(x[0].length);
                if (!state2) $("#second-matrix-check").prop("checked", true).change();
                scrollTo("#second-matrix-block");
            });
            $(".solve-block-hide").click(function() {
                $(this).siblings(".solve").slideToggle();
                $(this).find(".fa").toggleClass("fa-caret-down").toggleClass("fa-caret-right");
                updateScrollblocks();
            });
            $(".result-clear").click(function() {
                $(this).parent().remove();
            });
            $(".calc-result").find('.matrix').each(function(i) {
                $(this).attr("id", "matrix-id-" + i);
            });
            updateScrollblocks();
            updateDragAndDrop();
            $.ajax({
                url: "https://programforyou.ru/statistics/calc_statistics.shtml",
                async: true,
                success: function(result) {
                    $("#stat-value").html(result);
                }
            });
        }
    });
    $(".matrix-clear .fa").click(function() {
        changeSize("#" + $(this).parent().parent().find(".matrix")[0].id, false);
    });
    $("#swap").click(function() {
        var first_matrix = getMatrix("#first-matrix");
        var second_matrix = getMatrix("#second-matrix");
        setMatrix("#second-matrix", first_matrix);
        setMatrix("#first-matrix", second_matrix);
        var rows1 = $("#first-matrix-rows").find(":selected").text();
        var cols1 = $("#first-matrix-cols").find(":selected").text();
        var rows2 = $("#second-matrix-rows").find(":selected").text();
        var cols2 = $("#second-matrix-cols").find(":selected").text();
        $("#first-matrix-rows").val(rows2);
        $("#first-matrix-cols").val(cols2);
        $("#second-matrix-rows").val(rows1);
        $("#second-matrix-cols").val(cols1);
        $("#first-matrix-size").html("<sub>" + rows2 + "&#215;" + cols2 + "</sub>");
        $("#second-matrix-size").html("<sub>" + rows1 + "&#215;" + cols1 + "</sub>");
        $("#calc-option").change();
    });
    $("#expression").keyup(function() {
        try {
            var calc = validateExpression($(this).val());
            $(this).css("background", "#fff");
            $("#expression-error").text("");
        } catch (e) {
            $(this).css("background", "#f99a9a");
            $("#expression-error").text(e);
        }
    });
});
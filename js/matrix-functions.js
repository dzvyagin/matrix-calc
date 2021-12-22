function copyMatrix(a, needClass = false) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[0].length);
        for (var j = 0; j < a[0].length; j++) {
            c[i][j] = a[i][j];
            if (!needClass) c[i][j].class = undefined;
        }
    }
    return c;
}

function checkZero(a) {
    for (var i = 0; i < a.length; i++)
        for (var j = 0; j < a[0].length; j++)
            if (!a[i][j].n.isZero()) return false;
    return true;
}

function checkE(a) {
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < a[0].length; j++) {
            var reduced = reduceFraction(a[i][j]);
            if (i == j && (!reduced.n.equals(bigInt.one) || !reduced.m.equals(bigInt.one))) return false;
            if (i != j && !reduced.n.isZero()) return false;
        }
    }
    return true;
}

function checkTriangle(a) {
    for (var i = 0; i < a.length; i++)
        for (var j = 0; j < i; j++)
            if (!a[i][j].n.isZero()) return false;
    return true;
}

function checkZeroRow(a) {
    for (var i = 0; i < a.length; i++) {
        var count = 0;
        var j = 0;
        while (j < a[i].length) {
            if (!a[i][j].n.isZero()) break;
            j++;
        }
        if (j == a[i].length) return i;
    }
    return -1;
}

function checkZeroCol(a) {
    for (var j = 0; j < a[0].length; j++) {
        var count = 0;
        var i = 0;
        while (i < a.length) {
            if (!a[i][j].n.isZero()) break;
            i++;
        }
        if (i == a.length) return j;
    }
    return -1;
}

function getEMatrix(n) {
    var E = new Array(n);
    for (var i = 0; i < n; i++) {
        E[i] = new Array(n);
        for (var j = 0; j < n; j++) {
            if (i == j) E[i][j] = getFraction("1");
            else
                E[i][j] = getFraction("0");
        }
    }
    return E;
}

function minorMatrix(a, i0, j0) {
    var minor = new Array(a.length - 1);
    var iStep = 0;
    for (var i = 0; i < a.length; i++) {
        if (i == i0) {
            iStep = 1;
            continue;
        }
        var jStep = 0;
        minor[i - iStep] = new Array(a[0].length - 1);
        for (var j = 0; j < a[i].length; j++) {
            if (j == j0) {
                jStep = 1;
                continue;
            }
            minor[i - iStep][j - jStep] = a[i][j];
        }
    }
    return minor;
}

function mainMinorMatrix(a, n) {
    var minor = new Array(n);
    for (var i = 0; i < n; i++) {
        minor[i] = new Array(n);
        for (var j = 0; j < n; j++) minor[i][j] = a[i][j];
    }
    return {
        matrix: minor,
        det: detMatrix(minor)
    };
}

function swapRowsMatrix(a, i1, i2) {
    var tmp = a[i1];
    a[i1] = a[i2];
    a[i2] = tmp;
}

function swapColsMatrix(a, j1, j2) {
    for (var i = 0; i < a.length; i++) {
        var tmp = a[i][j1];
        a[i][j1] = a[i][j2];
        a[i][j2] = tmp;
    }
}

function multRowMatrix(a, i0, elem) {
    for (var j = 0; j < a[i0].length; j++) a[i0][j] = multFraction(a[i0][j], elem);
}

function multColMatrix(a, j0, elem) {
    for (var i = 0; i < a.length; i++) a[i][j0] = multFraction(a[i][j0], elem);
}

function addRowMultMatrix(a, i1, i2, elem) {
    for (var j = 0; j < a[0].length; j++) a[i1][j] = addFraction(a[i1][j], multFraction(a[i2][j], elem));
}

function addColMultMatrix(a, j1, j2, elem) {
    for (var i = 0; i < a.length; i++) a[i][j1] = addFraction(a[i][j1], multFraction(a[i][j2], elem));
}

function minusStringMatrix(matrix, a, b, elem) {
    for (var i = 0; i < matrix[0].length; i++) matrix[b][i] = subFraction(matrix[b][i], (multFraction(matrix[a][i], elem)));
}

function plusStringMatrix(matrix, a, b) {
    for (var i = 0; i < matrix[0].length; i++) matrix[b][i] = addFraction(matrix[b][i], matrix[a][i]);
}

function multStringMatrix(matrix, a, b) {
    for (var i = 0; i < matrix[0].length; i++) matrix[b][i] = multFraction(matrix[b][i], matrix[a][i]);
}

function divStringMatrix(matrix, a, b) {
    for (var i = 0; i < matrix[0].length; i++) matrix[b][i] = divFraction(matrix[b][i], matrix[a][i]);
}

function divString(matrix, a, elem) {
    for (var i = 0; i < matrix[0].length; i++) matrix[a][i] = divFraction(matrix[a][i], elem);
}

function scalarRowMatrix(a, i1, i2) {
    var sum = getFraction("0");
    for (var j = 0; j < a[0].length; j++) sum = addFraction(sum, multFraction(a[i1][j], a[i2][j]));
    return sum;
}

function transposeMatrix(a) {
    var b = new Array(a[0].length);
    for (var j = 0; j < a[0].length; j++) {
        b[j] = new Array(a.length);
        for (var i = 0; i < a.length; i++) b[j][i] = reduceFraction(a[i][j]);
    }
    return b;
}

function plusMatrix(a, b) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[i].length);
        for (var j = 0; j < a[0].length; j++) c[i][j] = addFraction(a[i][j], b[i][j]);
    }
    return c;
}

function minusMatrix(a, b) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[i].length);
        for (var j = 0; j < a[0].length; j++) c[i][j] = subFraction(a[i][j], b[i][j]);
    }
    return c;
}

function multMatrix(a, b) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(b[0].length);
        for (var j = 0; j < b[0].length; j++) {
            c[i][j] = getFraction("0");
            for (var k = 0; k < a[0].length; k++) c[i][j] = addFraction(c[i][j], multFraction(a[i][k], b[k][j]));
        }
    }
    return c;
}

function multConstMatrix(a, n) {
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(a[i].length);
        for (var j = 0; j < a[0].length; j++) c[i][j] = multFraction(a[i][j], n);
    }
    return c;
}

function powMatrix(a, pow) {
    if (pow == 0) return getEMatrix(a.length);
    if (pow % 2) return multMatrix(a, powMatrix(a, pow - 1));
    var x = powMatrix(a, pow / 2);
    return multMatrix(x, x);
}

function triangleMatrix(a) {
    var c = copyMatrix(a);
    var n = c.length > c[0].length ? c[0].length : c.length;
    var start = 0;
    for (var j = 0; j < n; j++) {
        var stringNum = j;
        while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
        start++;
        if (stringNum != c.length) {
            swapRowsMatrix(c, stringNum, j);
            for (var i = start; i < c.length; i++) {
                var elem = divFraction(c[i][j], c[start - 1][j]);
                minusStringMatrix(c, start - 1, i, elem);
            }
        } else {
            start--;
        }
    }
    return c;
}

function detMatrix(a) {
    let c = copyMatrix(a);
    let det = getFraction("1");
    for (let j = 0; j < c[0].length; j++) {
        if (c[j][j].n.isZero()) {
            let stringNum = j;
            while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
            if (stringNum == c.length) return getFraction("0");
            swapRowsMatrix(c, stringNum, j);
            det.n = det.n.multiply(bigInt.minusOne);
        }
        det = multFraction(det, c[j][j]);
        for (let i = j + 1; i < c.length; i++) {
            let elem = divFraction(c[i][j], c[j][j]);
            minusStringMatrix(c, j, i, elem);
        }
    }
    return det;
}

function rankMatrix(a) {
    var c = triangleMatrix(a);
    var count = 0;
    for (var i = 0; i < c.length; i++) {
        var j = 0;
        while (j < c[i].length && c[i][j].n.isZero()) j++;
        if (j < c[i].length) count++;
    }
    return count;
}

function trackMatrix(a) {
    var track = getFraction("0");
    for (var i = 0; i < a.length; i++) track = addFraction(track, a[i][i]);
    return track;
}

function reverseMatrix(a) {
    var c = copyMatrix(a);
    var r = getEMatrix(a.length);
    for (var j = 0; j < c[0].length; j++) {
        var stringNum = j;
        while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
        if (stringNum != c.length) {
            swapRowsMatrix(c, stringNum, j);
            swapRowsMatrix(r, stringNum, j);
            var divider = c[j][j];
            divString(c, j, divider);
            divString(r, j, divider);
            for (var i = j + 1; i < c.length; i++) {
                var elem = divFraction(c[i][j], c[j][j]);
                minusStringMatrix(c, j, i, elem);
                minusStringMatrix(r, j, i, elem);
            }
        }
    }
    for (var j = c[0].length - 1; j >= 0; j--) {
        for (var i = j - 1; i >= 0; i--) {
            var elem = c[i][j];
            minusStringMatrix(c, j, i, elem);
            minusStringMatrix(r, j, i, elem);
        }
    }
    return r;
}

function LUDecompositionMatrix(matrix) {
    var a = copyMatrix(matrix);
    var n = a.length;
    var L = new Array(n);
    var U = new Array(n);
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
    for (var i = 1; i < n; i++) {
        for (var j = i; j < n; j++) {
            var sum = getFraction("0");
            for (var k = 0; k < i; k++) sum = addFraction(sum, multFraction(L[i][k], U[k][j]));
            U[i][j] = subFraction(a[i][j], sum);
            var sum = getFraction("0");
            for (var k = 0; k < i; k++) sum = addFraction(sum, multFraction(L[j][k], U[k][i]));
            L[j][i] = divFraction(subFraction(a[j][i], sum), U[i][i]);
        }
    }
    return {
        L: L,
        U: U
    };
}

function systemMatrix(a, coef) {
    var c = copyMatrix(a);
    var b = copyMatrix(coef);
    var x = new Array(c.length);
    for (var i = 0; i < c.length; i++) {
        x[i] = [];
        x[i][0] = 0;
    }
    for (var j = 0; j < c.length; j++) {
        if (c[j][j].n.isZero()) {
            var stringNum = j + 1;
            while (stringNum < c.length && c[stringNum][j].n.isZero()) stringNum++;
            if (stringNum < c.length) {
                swapRowsMatrix(c, stringNum, j);
                swapRowsMatrix(b, stringNum, j);
            } else
                continue;
        }
        for (var i = j + 1; i < c.length; i++) {
            var elem = divFraction(c[i][j], c[j][j]);
            minusStringMatrix(c, j, i, elem);
            minusStringMatrix(b, j, i, elem);
        }
    }
    for (var i = c.length - 1; i >= 0; i--) {
        var sum = b[i][0];
        for (var j = c.length - 1; j > i; j--) sum = subFraction(sum, multFraction(c[i][j], x[j][0]));
        x[i][0] = divFraction(sum, c[i][i]);
    }
    return x;
}
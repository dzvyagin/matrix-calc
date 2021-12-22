const fractionTemplate = "^-?\\d+\/\\d+$";
const realTemplate = "^-?\\d+([\\.\\,]\\d+)?$";

function reduceFraction(fraction) {
    var nod = bigInt.gcd(fraction.n, fraction.m).abs();
    fraction.n = fraction.n.divide(nod);
    fraction.m = fraction.m.divide(nod);
    return fraction;
}

function getFraction(text, reduce = true) {
    if (text != "" && text.match(new RegExp(fractionTemplate)) == null && text.match(new RegExp(realTemplate)) == null) throw "Некорректная дробь!";
    text = text.replace(/,/gi, ".");
    var index = text.indexOf("/");
    var fraction = {
        n: bigInt.zero,
        m: bigInt.one
    };
    if (index > -1) {
        fraction.n = bigInt(text.substr(0, index));
        fraction.m = bigInt(text.substr(index + 1));
    } else if ((index = text.indexOf("e")) > -1) {
        throw "Невозможно получить дробь. Используйте обычную форму записи вместо экспонециальной.";
    } else {
        index = text.indexOf(".");
        if (index > -1) {
            var sign = text[0] == "-" ? -1 : 1;
            var int = bigInt(text.substr(0, index));
            var float = text.substr(index + 1);
            index = float.length - 1;
            while (index > 0 && float[index] == "0") index--;
            float = bigInt(float.substr(0, index + 1));
            fraction.m = bigInt(10).pow(index + 1);
            fraction.n = bigInt(int).abs().multiply(fraction.m).add(float);
            fraction.n = fraction.n.multiply(sign);
        } else {
            fraction.n = bigInt(text);
            fraction.m = bigInt.one;
        }
    }
    return reduce ? reduceFraction(fraction) : fraction;
}

function printFraction(fraction, view = 0, digits = 5) {
    if (view == -1) {
        var result = fraction.n.toString();
        if (!fraction.m.equals(bigInt.one)) result += "/" + fraction.m.toString();
        return result;
    }
    if (view == 2) {
        var s = fraction.n.abs().multiply(bigInt(10).pow(digits)).divide(fraction.m).toString();
        while (s.length < digits) s = "0" + s;
        var int = s.substr(0, s.length - digits);
        var real = s.substr(s.length - digits, digits);
        if (int == "") int = "0";
        var index = real.length;
        while (index > 1 && real[index - 1] == "0") index--;
        real = real.substr(0, index);
        return (fraction.n.isNegative() ? "-" : "") + int + (real == "0" ? "" : "." + real);
    }
    var reduced = reduceFraction(fraction);
    if (reduced.m.equals(bigInt.one)) return reduced.n.toString();
    var html = "";
    if (fraction.n.isNegative()) html += "- ";
    if (view == 0) {
        var int = fraction.n.divide(fraction.m).abs();
        var n = fraction.n.abs().mod(fraction.m);
        if (!int.isZero()) html += int.toString();
        if (!n.isZero()) html += "<div class='fraction'><div class='numerator'>" + n.toString() + "</div><div class='denumerator'>" + fraction.m.toString() + "</div></div>";
    } else {
        html += "<div class='fraction'><div class='numerator'>" + fraction.n.abs().toString() + "</div><div class='denumerator'>" + fraction.m.toString() + "</div></div>";
    }
    return html;
}

function printNgFraction(fraction, view, digits) {
    return fraction.n.isNegative() ? "(" + printFraction(fraction, view, digits) + ")" : printFraction(fraction, view, digits);
}

function multFraction(a, b) {
    return reduceFraction({
        n: a.n.multiply(b.n),
        m: a.m.multiply(b.m)
    });
}

function divFraction(a, b) {
    var c = {
        n: a.n.multiply(b.m),
        m: a.m.multiply(b.n)
    };
    if (c.m.isNegative()) {
        c.m = c.m.abs();
        c.n = c.n.multiply(bigInt(-1));
    }
    return reduceFraction(c);
}

function addFraction(a, b) {
    var nod = bigInt.gcd(a.m, b.m).abs();
    var nok = bigInt.lcm(a.m, b.m).abs();
    var c = {
        n: a.n.multiply(nok).divide(a.m).plus(b.n.multiply(nok).divide(b.m)),
        m: nok
    };
    return reduceFraction(c);
}

function subFraction(a, b) {
    var nod = bigInt.gcd(a.m, b.m).abs();
    var nok = bigInt.lcm(a.m, b.m).abs();
    var c = {
        n: a.n.multiply(nok).divide(a.m).minus(b.n.multiply(nok).divide(b.m)),
        m: nok
    };
    return reduceFraction(c);
}

function ChSignFraction(a) {
    a.n = a.n.multiply(-1);
}
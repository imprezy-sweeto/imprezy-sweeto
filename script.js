(function () {
    var $ = function (id) { return document.getElementById(id); };
    var nav = $('nav'), burger = $('burger'), f = $('f');

    // Menu
    function toggleNav(open) {
        nav.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
    }
    burger.addEventListener('click', function () { toggleNav(!nav.classList.contains('open')); });
    nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { toggleNav(false); });
    });

    // Rok w stopce
    $('yr').textContent = new Date().getFullYear();

    // Zakres dat
    var yearsLimit = 2030;

    function pad(n) { return String(n).padStart(2, '0'); }

    var now = new Date();
    var minDate = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    var maxDate = yearsLimit + '-12-31';

    // Kalendarzyk (Flatpickr, po polsku, format dd.mm.rrrr)
    var fp = flatpickr(f.data, {
        locale: flatpickr.l10ns.pl,
        dateFormat: 'd.m.Y',
        allowInput: true,
        disableMobile: true,
        minDate: 'today',
        maxDate: new Date(yearsLimit, 11, 31)
    });

    // Maska: kropka pojawia się od razu po dniu i miesiącu
    // Maska: kropka pojawia się od razu po dniu i miesiącu,
    // a nieprawidłowa wartość czyści całe pole
    f.data.addEventListener('input', function (e) {
        var deleting = e.inputType && e.inputType.indexOf('delete') === 0;
        var d = this.value.replace(/\D/g, '').slice(0, 8);

        // 5 -> 05 (dzień nie może zaczynać się od cyfry > 3)
        if (d.length === 1 && Number(d) > 3) d = '0' + d;
        // 2 w miesiącu -> 02 (miesiąc nie może zaczynać się od cyfry > 1)
        if (d.length === 3 && Number(d[2]) > 1) d = d.slice(0, 2) + '0' + d[2];

        var invalid = false;

        // Dzień: 01-31
        if (d.length >= 2) {
            var day = Number(d.slice(0, 2));
            if (day < 1) d = '01' + d.slice(2);
            else if (day > 31) d = '31' + d.slice(2);
        }

        // Miesiąc: 01-12
        if (d.length >= 4) {
            var month = Number(d.slice(2, 4));
            if (month < 1) d = d.slice(0, 2) + '01' + d.slice(4);
            else if (month > 12) d = d.slice(0, 2) + '12' + d.slice(4);
        }

        // Rok: nie większy niż yearsLimit (sprawdzane od pierwszej cyfry)
        if (d.length > 4) {
            var yearPart = d.slice(4);
            var limitPart = String(yearsLimit).slice(0, yearPart.length);
            if (Number(yearPart) > Number(limitPart)) {
                d = d.slice(0, 4) + String(yearsLimit);
            }
        }

        // Rok: nie mniejszy niż bieżący (po wpisaniu pełnego roku)
        if (d.length === 8 && Number(d.slice(4)) < now.getFullYear()) {
            d = d.slice(0, 4) + String(now.getFullYear());
        }


        var out = d.slice(0, 2);
        if (d.length >= 2 && (!deleting || d.length > 2)) out += '.';
        if (d.length > 2) out += d.slice(2, 4);
        if (d.length >= 4 && (!deleting || d.length > 4)) out += '.';
        if (d.length > 4) out += d.slice(4);

        this.value = out;
    });

    // dd.mm.rrrr -> rrrr-mm-dd (pusty tekst, jeśli data nieprawidłowa)
    function parsePL(str) {
        var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(str);
        if (!m) return '';
        var d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
        var dt = new Date(y, mo - 1, d);
        if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
        return y + '-' + pad(mo) + '-' + pad(d);
    }

    // Wybór atrakcji z przycisków
    document.querySelectorAll('[data-pick]').forEach(function (a) {
        a.addEventListener('click', function () {
            document.querySelectorAll('#chips input').forEach(function (c) {
                if (c.value === a.dataset.pick) c.checked = true;
            });
        });
    });

    // Formularz
    function showError(el, msg) {
        var wrap = el.closest('.f');
        wrap.classList.toggle('invalid', !!msg);
        var err = wrap.querySelector('.err');
        if (err) err.textContent = msg || '';
    }
    // Liczba gości: tylko cyfry, zakres 1-300
    f.goscie.addEventListener('input', function () {
        var d = this.value.replace(/\D/g, '');
        if (d === '') { this.value = ''; return; }

        var n = Number(d);
        if (n > 300) n = 300;
        if (n < 1) n = 1;

        this.value = n;
    });
    f.addEventListener('submit', function (ev) {
        ev.preventDefault();

        var ok = true;
        function check(el, msg) {
            showError(el, msg);
            if (msg) ok = false;
        }
        function val(name) { return f[name].value.trim(); }

        var tel = val('tel'), mail = val('mail');
        var dateRaw = val('data');
        var date = parsePL(dateRaw); // rrrr-mm-dd, do porównań

        check(f.imie, val('imie') ? '' : 'Podaj imię.');

        if (!tel && !mail) {
            check(f.tel, 'Podaj numer telefonu lub adres e-mail.');
            check(f.mail, '');
        } else {
            check(f.tel, tel && !/^[+\d][\d\s-]{6,}$/.test(tel) ? 'Podaj poprawny numer telefonu.' : '');
            check(f.mail, mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? 'Podaj poprawny adres e-mail.' : '');
        }

        if (!dateRaw) check(f.data, 'Wybierz datę wydarzenia.');
        else if (!date) check(f.data, 'Podaj poprawną datę w formacie dd.mm.rrrr.');
        else if (date < minDate || date > maxDate) check(f.data, 'Podaj datę od dziś do końca ' + yearsLimit + ' roku.');
        else check(f.data, '');

        check(f.miejsce, val('miejsce') ? '' : 'Podaj miejsce wydarzenia.');
        check(f.rodzaj, val('rodzaj') ? '' : 'Wybierz rodzaj wydarzenia.');
        check(f.msg, val('msg') ? '' : 'Napisz krótką wiadomość.');
        check($('zgoda'), $('zgoda').checked ? '' : 'Zaznacz zgodę, aby wysłać zapytanie.');

        if (!ok) {
            var first = f.querySelector('.invalid input, .invalid select, .invalid textarea');
            if (first) first.focus();
            return;
        }

        var datePL = date.split('-').reverse().join('.');
        var atrakcje = [].map.call(document.querySelectorAll('#chips input:checked'), function (c) {
            return c.value;
        }).join(', ');

        var subject = 'Zapytanie o termin — ' + val('rodzaj') + ', ' + datePL;
        var btn = f.querySelector('button[type="submit"]');
        var btnText = btn ? btn.textContent : '';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Wysyłanie...';
            btn.style.background = '#a7d8f0c4';
        }

        fetch('https://emailcontact.imprezysweeto.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _subject: subject,
                imie: val('imie'),
                telefon: tel,
                email: mail,
                data: datePL,
                miejsce: val('miejsce'),
                rodzaj: val('rodzaj'),
                goscie: val('goscie'),
                atrakcje: atrakcje,
                wiadomosc: val('msg'),
                website: f.website ? f.website.value : ''
            })
        })
            .then(function (res) {
                if (!res.ok) {
                    return res.text().then(function (t) {
                        throw new Error(res.status + ': ' + t);
                    });
                }
                f.reset();
                fp.clear();
                $('ok').style.display = 'block';
                $('ok').scrollIntoView({ block: 'center' });
            })
            .catch(function (err) {
                console.error(err);
                alert('Błąd: ' + err.message);
            })
            .finally(function () {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = btnText;
                    btn.style.background = '#A7D8F0';
                }
            });
    });

})();

/**    f.addEventListener('submit', function (ev) {
        ev.preventDefault();

        var ok = true;
        function check(el, msg) {
            showError(el, msg);
            if (msg) ok = false;
        }
        function val(name) { return f[name].value.trim(); }

        var tel = val('tel'), mail = val('mail');
        var dateRaw = val('data');
        var date = parsePL(dateRaw); // rrrr-mm-dd, do porównań

        check(f.imie, val('imie') ? '' : 'Podaj imię.');

        if (!tel && !mail) {
            check(f.tel, 'Podaj numer telefonu lub adres e-mail.');
            check(f.mail, '');
        } else {
            check(f.tel, tel && !/^[+\d][\d\s-]{6,}$/.test(tel) ? 'Podaj poprawny numer telefonu.' : '');
            check(f.mail, mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? 'Podaj poprawny adres e-mail.' : '');
        }

        if (!dateRaw) check(f.data, 'Wybierz datę wydarzenia.');
        else if (!date) check(f.data, 'Podaj poprawną datę w formacie dd.mm.rrrr.');
        else if (date < minDate || date > maxDate) check(f.data, 'Podaj datę od dziś do końca ' + yearsLimit + ' roku.');
        else check(f.data, '');

        check(f.miejsce, val('miejsce') ? '' : 'Podaj miejsce wydarzenia.');
        check(f.rodzaj, val('rodzaj') ? '' : 'Wybierz rodzaj wydarzenia.');
        check(f.msg, val('msg') ? '' : 'Napisz krótką wiadomość.');
        check($('zgoda'), $('zgoda').checked ? '' : 'Zaznacz zgodę, aby wysłać zapytanie.');

        if (!ok) {
            var first = f.querySelector('.invalid input, .invalid select, .invalid textarea');
            if (first) first.focus();
            return;
        }

        var datePL = date.split('-').reverse().join('.');
        var atrakcje = [].map.call(document.querySelectorAll('#chips input:checked'), function (c) {
            return c.value;
        }).join(', ');

        var body =
            'Imię: ' + val('imie') +
            '\nTelefon: ' + tel +
            '\nE-mail: ' + mail +
            '\nData wydarzenia: ' + datePL +
            '\nMiejsce: ' + val('miejsce') +
            '\nRodzaj wydarzenia: ' + val('rodzaj') +
            '\nLiczba gości: ' + val('goscie') +
            '\nAtrakcje: ' + atrakcje +
            '\n\nWiadomość:\n' + val('msg');

        var subject = 'Zapytanie o termin — ' + val('rodzaj') + ', ' + datePL;
        window.location.href = 'mailto:imprezysweeto@gmail.com?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);

        f.reset();
        fp.clear();
        $('ok').style.display = 'block';
        $('ok').scrollIntoView({ block: 'center' });
    }); */

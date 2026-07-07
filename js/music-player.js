(function () {
    'use strict';

    var BASE    = 'sfx/';
    var FADE_MS = 1400;

    var TRACK_NAMES = {
        'dark_like_abyss':                                  'Dark Like Abyss',
        'an_empty_lotus_is_all_I_am':                       'An empty lotus is all I am...',
        'tapped_tragedy':                                   'Tapped Tragedy',
        'tape_jingle':                                      'Tape Jingle',
        'sinner':                                           'Sinner',
        'lonely':                                           'Lonely',
        'written_fate':                                     'written_fate',
        'deepest_hole_of_remembrance':                      'Deepest Hole of Remembrance',
        'ransomaly':                                        'RANSOMALY',
        'your_free_extra':                                  'Your free extra!',
        'sinner_retake':                                    'Sinner (Retake)',
        'ur_ma_bst_fren':                                   'UrMaBstFren',
        'the_wind_is_blowing_and_the_roses_are_growing':    'The wind is blowing, and the roses are growing! ^w^',
        'calmed1':                                          'calmed1',
        'decayed1':                                         'decayed1',
        'passed_out1':                                      'passed_out1',
        'happy_i_was':                                      'Happy I was',
        'slave_to_trust':                                   'Slave to trust',
        'mouths_do_lie':                                    'Mouths do lie',
        'i_was_something_now_im_nothing':                   'i_was_something_now_im_nothing',
        'that_place_youve_called_paradise':                 'That Place You\'ve Called [PARADISE]',
        'broken_heaven':                                    'broken_heaven',
        'void_ambiance':                                    'Void Ambiance',
        'mist_void_of_decayed_hopes':                       'Mist void of decayed hopes',
        'familiar_smile':                                   'Familiar Smile'
    };

    var FALLBACK = 'familiar_smile';

    var SPECIAL_DATES = {
        '22/04': { tracks: ['sinner', 'lonely'], mode: 'rand' },
        '07/11': { tracks: ['written_fate'] },
        '18/04': { tracks: ['deepest_hole_of_remembrance'] },
        '06/06': { tracks: ['ransomaly'] }
    };

    var MAP = [
        { re: /^$/,                                              tracks: ['dark_like_abyss'] },
        { re: /^about$/,                                         tracks: ['an_empty_lotus_is_all_I_am'] },
        { re: /^music$/,                                         tracks: ['deepest_hole_of_remembrance'] },
        { re: /^news$/,                                          tracks: ['mist_void_of_decayed_hopes'] },
        { re: /^projects$/,                                      tracks: ['your_free_extra'] },
        { re: /^wiki$/,                                          tracks: ['tapped_tragedy'] },
        { re: /wiki\/porkys-legacy-og/,                         tracks: ['sinner_retake'] },
        { re: /wiki\/porkys-legacy-era-of-corruption(?!\/)/,    tracks: ['ur_ma_bst_fren'] },
        { re: /wiki\/porkys-legacy-era-of-corruption\/knoweldge-research/, tracks: ['ur_ma_bst_fren'] },
        { re: /corruption-research(?!\/)/,                      tracks: ['the_wind_is_blowing_and_the_roses_are_growing', 'an_empty_lotus_is_all_I_am'], mode: 'hour8to18' },
        { re: /corruption-research\/global.impact/,             tracks: ['tape_jingle'] },
        { re: /corruption-research\/ominous.valley/,            tracks: ['calmed1', 'decayed1', 'passed_out1'], mode: 'rand' },
        { re: /corruption-research\/corrupted.spore/,           tracks: ['i_was_something_now_im_nothing'] },
        { re: /corruption-research\/hazed.plains/,              tracks: ['happy_i_was', 'slave_to_trust', 'mouths_do_lie'], mode: 'hour3' },
        { re: /corruption-research\/sinner.land/,               tracks: ['that_place_youve_called_paradise'] },
        { re: /corruption-research\/broken.heaven/,             tracks: ['broken_heaven'] },
        { re: /corruption-research\/error.3008/,                tracks: ['void_ambiance'] },
        { re: /^projects/,                                        tracks: ['your_free_extra'] }
    ];

    function todayKey() {
        var n = new Date();
        return String(n.getDate()).padStart(2,'0') + '/' + String(n.getMonth()+1).padStart(2,'0');
    }

    function findMapEntry(param) {
        for (var i = 0; i < MAP.length; i++) {
            if (MAP[i].re.test(param)) return MAP[i];
        }
        return null;
    }

    function resolveTrackInfo(param) {
        var h = new Date().getHours();
        var dk = todayKey();

        /* Special dates override only on HOME */
        if (/^$/.test(param) && SPECIAL_DATES[dk]) {
            var sd = SPECIAL_DATES[dk];
            if (sd.mode === 'rand') {
                return { track: sd.tracks[Math.floor(Math.random() * sd.tracks.length)], randPool: sd.tracks };
            }
            return { track: sd.tracks[0], randPool: null };
        }

        for (var i = 0; i < MAP.length; i++) {
            var e = MAP[i];
            if (!e.re.test(param)) continue;
            if (e.mode === 'rand')      return { track: e.tracks[Math.floor(Math.random() * e.tracks.length)], randPool: e.tracks };
            if (e.mode === 'hour8to18') return { track: (h >= 8 && h <= 18) ? e.tracks[0] : e.tracks[1], randPool: null };
            if (e.mode === 'hour3')     return { track: (h >= 6 && h <= 13) ? e.tracks[0]
                                                 : (h >= 14 && h <= 19) ? e.tracks[1]
                                                 : e.tracks[2], randPool: null };
            return { track: e.tracks[0], randPool: null };
        }
        return { track: FALLBACK, randPool: null };
    }

    function resolveTrack(param) { return resolveTrackInfo(param).track; }

    var els = [new Audio(), new Audio()];
    els.forEach(function (el) { el.loop = true; el.volume = 0; el.preload = 'auto'; });

    var ai = 0, playing = false, vol = 0.25, curTrack = null, curParam = null;
    var currentRandPool = null;
    var _scrollRaf = null, _scrollPos = 0, _scrollDir = 1, _scrollPause = 0;

    function updateTrackName(track) {
        var nameEl = document.getElementById('mp-track-name');
        var wrapEl = document.getElementById('mp-track-wrap');
        if (!nameEl || !wrapEl) return;
        nameEl.textContent = TRACK_NAMES[track] || track.replace(/_/g,' ');
        nameEl.style.transform = 'translateX(0)';
        _scrollPos = 0; _scrollDir = 1; _scrollPause = 0;
        if (_scrollRaf) { cancelAnimationFrame(_scrollRaf); _scrollRaf = null; }
        requestAnimationFrame(function () {
            var textW = nameEl.scrollWidth, wrapW = wrapEl.clientWidth;
            if (textW <= wrapW + 2) return;
            var overflow = textW - wrapW, speed = 0.4;
            function scrollTick() {
                if (_scrollPause > 0) { _scrollPause--; _scrollRaf = requestAnimationFrame(scrollTick); return; }
                _scrollPos += speed * _scrollDir;
                if (_scrollPos >= overflow) { _scrollPos = overflow; _scrollDir = -1; _scrollPause = 120; }
                else if (_scrollPos <= 0)   { _scrollPos = 0;        _scrollDir =  1; _scrollPause = 120; }
                nameEl.style.transform = 'translateX(' + (-_scrollPos) + 'px)';
                _scrollRaf = requestAnimationFrame(scrollTick);
            }
            _scrollPause = 90;
            _scrollRaf = requestAnimationFrame(scrollTick);
        });
    }

    function cancelFade(el) { if (el._raf) { cancelAnimationFrame(el._raf); el._raf = null; } }

    function fadeTo(el, target, onDone) {
        cancelFade(el);
        var from = el.volume, t0 = null;
        if (target > 0 && el.paused) { var p = el.play(); if (p && p.catch) p.catch(function(){}); }
        function tick(ts) {
            if (!t0) t0 = ts;
            var prog = Math.min((ts - t0) / FADE_MS, 1);
            var ease = prog < 0.5 ? 4*prog*prog*prog : 1 - Math.pow(-2*prog+2,3)/2;
            el.volume = Math.max(0, Math.min(1, from + (target - from) * ease));
            if (prog < 1) { el._raf = requestAnimationFrame(tick); }
            else { el.volume = target; el._raf = null; if (target === 0) el.pause(); if (onDone) onDone(); }
        }
        el._raf = requestAnimationFrame(tick);
    }

    function pickDifferent(pool, exclude) {
        if (pool.length <= 1) return pool[0];
        var choices = pool.filter(function (t) { return t !== exclude; });
        return choices[Math.floor(Math.random() * choices.length)];
    }

    function crossfade(track, randPool) {
        var ni = 1 - ai, prevEl = els[ai], nextEl = els[ni], prevSrc = prevEl.src;

        var effectivePool = (randPool && randPool.length > 1) ? randPool : null;
        currentRandPool = effectivePool;

        nextEl.src = BASE + track + '.mp3'; nextEl.volume = 0; nextEl.loop = !effectivePool;
        if (playing) {
            fadeTo(prevEl, 0, function () { if (prevEl.src === prevSrc) { prevEl.pause(); prevEl.src = ''; } });
            fadeTo(nextEl, vol);
        } else {
            /* Not playing yet: stop/clear the old element so toggle() picks up
               the new track instead of resuming whatever was loaded before. */
            cancelFade(prevEl);
            prevEl.pause();
            prevEl.src = '';
        }
        ai = ni;
        updateTrackName(track);
    }

    els.forEach(function (el, idx) {
        el.addEventListener('ended', function () {
            if (!currentRandPool) return;
            if (idx !== ai) return;
            var next = pickDifferent(currentRandPool, curTrack);
            curTrack = next;
            crossfade(next, currentRandPool);
        });
    });

    function changePage(param) {
        curParam = param;
        var info = resolveTrackInfo(param);
        if (info.track === curTrack) return;
        curTrack = info.track;
        crossfade(info.track, info.randPool);
    }

    /* Re-evaluate the track for the current page every minute, so that
       hour/date-dependent tracks (e.g. Hazed Plains' day/night cycle,
       Corruption Research's 8→18 / 19→7 split) switch live without
       needing to navigate away and back. Random-mode tracks ('rand')
       are intentionally excluded — re-rolling them every minute would
       be jarring, they should only re-roll on actual navigation. */
    setInterval(function () {
        if (curParam === null) return;
        var dk = todayKey();
        if (/^$/.test(curParam) && SPECIAL_DATES[dk] && SPECIAL_DATES[dk].mode === 'rand') return;
        var entry = findMapEntry(curParam);
        if (entry && entry.mode === 'rand') return;
        var track = resolveTrack(curParam);
        if (track === curTrack) return;
        curTrack = track;
        crossfade(track);
    }, 60000);

    function toggle() {
        playing = !playing;
        var el = els[ai];
        if (playing) {
            /* Always make sure src matches the current track before playing —
               guards against stale/empty src from a page change while paused. */
            var expectedSrc = curTrack ? (BASE + curTrack + '.mp3') : '';
            if (curTrack && !el.src.endsWith(expectedSrc)) {
                el.src = expectedSrc;
                el.loop = true;
            }
            fadeTo(el, vol);
        } else { fadeTo(el, 0); }
        updateUI();
    }

    function setVol(v) {
        vol = Math.max(0, Math.min(1, v));
        if (playing && !els[ai]._raf) els[ai].volume = vol;
    }

    function updateUI() {
        var btn = document.getElementById('mp-toggle');
        if (btn) btn.textContent = playing ? '\u23F8' : '\u25B6';
    }

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('mp-toggle');
        var slider = document.getElementById('mp-vol');
        if (btn)    btn.addEventListener('click', toggle);
        if (slider) { slider.value = Math.round(vol * 100); slider.addEventListener('input', function () { setVol(Number(this.value) / 100); }); }
        updateUI();
        if (curTrack) updateTrackName(curTrack);
    });

    window.MusicPlayer = { changePage: changePage, toggle: toggle, setVol: setVol };
})();

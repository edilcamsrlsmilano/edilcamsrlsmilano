
(function () {
'use strict';

/* ================================================
    CONFIGURAZIONE MANUALE
    Cambia "day" a mano per sbloccare i giorni successivi.
    day = 1  -> solo Giorno 1 sbloccato
    day = 3  -> Giorno 1, 2, 3 sbloccati ecc.
================================================ */
var day = 1;

/* ================================================
    DATI CORSO: 5 giorni x 5 video.
    Sostituisci "VIDEO_ID" con i veri ID YouTube (es. dQw4w9WgXcQ).
================================================ */
var COURSE = [
    { id: 1, label: 'Computo Metrico e Contabilità Lavori', videos: [
        { id: 'd1v1', title: 'Dati Generali, Elenco Prezzi, Analisi Prezzi', yt: 'kVg0gzqpK38' },
        { id: 'd1v2', title: 'Misurazioni e Modalità per la computazione', yt: '7qzlFGU9bZg' }, 
        { id: 'd1v3', title: 'Filtri, Costi della Sicurezza, Quadro Economico',       yt: 'cQbgnp2Glvw' },
        { id: 'd1v4', title: 'Stampare gli elaborati di Progetto',             yt: 'yRZaQccDJB0' },
        { id: 'd1v5', title: 'Il Documento di tipo Contabilità',          yt: 'Rr03wlZBgi8' }
    ]},
    { id: 2, label: 'Funzioni importanti', videos: [
        { id: 'd2v1', title: 'Editor Misurazioni e Modalità operativa per la contabilizzazione',      yt: 'lUvsezut9DM' }, 
        { id: 'd2v2', title: 'La Variante in corso d\'opera',  yt: 'oEeoCyOY9bk' }, 
        { id: 'd2v3', title: 'Funzioni Avanzate',               yt: 'QAASqv69njI' },
        { id: 'd2v4', title: 'Interscambio Dati',  yt: 'HM0HdsqAcZw' },
        { id: 'd2v5', title: 'Moduli Impianti e Norme',        yt: '4CitUl3z3zU' }  
    ]},
    { id: 3, label: 'I principi di EdiLus', videos: [
        { id: 'd4v1', title: 'Input dell\'edificio', yt: 'Q3nfbTmrrBk' },
        { id: 'd4v2', title: 'Risultati di calcolo ed elaborati di progetto',     yt: 'TJQA1I9zgSY' }, 
        { id: 'd4v3', title: 'Analisi completa edificio esistente',  yt: 'e3VO5seoj6Y' }
    ]},
    { id: 4, label: 'Il budget', videos: [
        { id: 'd3v1', title: 'Pianificazione e Controllo di Gestione',      yt: 'rG46dPJtZcs' },
        { id: 'd3v2', title: 'Analisi Economiche per il Controllo di Gestione', yt: '3h5i9TTlbCQ' },
        { id: 'd3v3', title: 'Le configurazioni di costo e il punto di pareggio', yt: 'fMpYcsDkAJ4' },
        { id: 'd3v4', title: 'Il Budget Commerciale',yt: '69uqh4SZ6hQ' },
        { id: 'd3v5', title: 'L\'analisi degli scostamenti dal budget', yt: '0v6NyPnRGtI' }
    ]},
    { id: 5, label: 'Sicurezza sul Lavoro', videos: [
        { id: 'd5v1', title: 'Principi generali, soggetti e obblighi',  yt: '4sbLarhC9fU' },
        { id: 'd5v2', title: 'Valutazione dei rischi e misure di prevenzione', yt: '9TNU_3f2cn4' },
        { id: 'd5v3', title: 'Attrezzature, DPI e vigilanza', yt: 'G7JT-qLOCc' }
    ]}
];

var TOTAL_VIDEOS = COURSE.reduce(function (sum, d) { return sum + d.videos.length; }, 0); // 25
var PCT_PER_VIDEO = 100 / TOTAL_VIDEOS; // 4%
var STORAGE_KEY = 'edilcam_formazione_progress';

/* ================================================
    STORAGE
================================================ */
function loadProgress() {
    try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
}
function saveProgress(progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) {}
}

var progress = loadProgress(); // { d1v1: true, ... }

var TIME_STORAGE_KEY = 'edilcam_formazione_time';
function loadTimeProgress() {
    try {
    var raw = localStorage.getItem(TIME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
}
function saveTimeProgress(timeProgress) {
    try { localStorage.setItem(TIME_STORAGE_KEY, JSON.stringify(timeProgress)); } catch (e) {}
}
var timeProgress = loadTimeProgress(); // { d1v1: secondsWatched, ... }

function getSavedSeconds(videoId) {
    var v = timeProgress[videoId];
    return typeof v === 'number' && v > 0 ? v : 0;
}
function saveSeconds(videoId, seconds) {
    timeProgress[videoId] = seconds;
    saveTimeProgress(timeProgress);
}
function clearSeconds(videoId) {
    delete timeProgress[videoId];
    saveTimeProgress(timeProgress);
}

function isDone(videoId) { return !!progress[videoId]; }
function markDone(videoId) {
    if (progress[videoId]) return false;
    progress[videoId] = true;
    saveProgress(progress);
    return true;
}

function countDoneInDay(dayObj) {
    return dayObj.videos.filter(function (v) { return isDone(v.id); }).length;
}
function overallDoneCount() {
    var n = 0;
    COURSE.forEach(function (d) { n += countDoneInDay(d); });
    return n;
}
function overallPercent() {
    return Math.round(overallDoneCount() * PCT_PER_VIDEO);
}

/* ================================================
    RENDER SIDEBAR
================================================ */
var daysContainer = document.getElementById('dashDays');
var openDayId = null; // quale cartella è espansa
var activeVideo = null; // { dayObj, video, index }

function dayIsUnlocked(dayObj) { return dayObj.id <= day; }

function svgChevron() {
    return '<svg class="day-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function svgLock() {
    return '<svg class="day-lock-icon" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" stroke-width="1.6"/></svg>';
}
function svgCheck() {
    return '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function renderDays() {
    daysContainer.innerHTML = '';

    COURSE.forEach(function (dayObj) {
    var unlocked = dayIsUnlocked(dayObj);
    var doneCount = countDoneInDay(dayObj);
    var complete = doneCount === dayObj.videos.length;
    var isOpen = openDayId === dayObj.id;

    var folder = document.createElement('div');
    folder.className = 'day-folder' +
        (unlocked ? '' : ' is-locked') +
        (isOpen && unlocked ? ' is-open' : '') +
        (complete ? ' is-complete' : '') +
        (!complete && unlocked ? ' is-current' : '');

    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'day-head';
    head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    head.innerHTML =
        '<span class="day-index">' + (complete ? svgCheck() : dayObj.id) + '</span>' +
        '<span class="day-info">' +
        '<span class="day-title">' + dayObj.label + '</span>' +
        '<span class="day-sub">' + doneCount + ' / ' + dayObj.videos.length + ' video visti</span>' +
        '</span>' +
        (unlocked ? svgChevron() : svgLock());

    if (unlocked) {
        head.addEventListener('click', function () {
        openDayId = isOpen ? null : dayObj.id;
        renderDays();
        });
    }

    var videosWrap = document.createElement('div');
    videosWrap.className = 'day-videos';

    dayObj.videos.forEach(function (video, idx) {
        var row = document.createElement('div');
        var done = isDone(video.id);
        var isActiveRow = activeVideo && activeVideo.video.id === video.id;
        row.className = 'video-row' + (done ? ' is-done' : '') + (isActiveRow ? ' is-active' : '');
        row.innerHTML =
        '<span class="video-check">' + svgCheck() + '</span>' +
        '<span class="video-row-title">' + video.title + '</span>';
        row.addEventListener('click', function () {
        playVideo(dayObj, video, idx);
        });
        videosWrap.appendChild(row);
    });

    folder.appendChild(head);
    folder.appendChild(videosWrap);
    daysContainer.appendChild(folder);
    });

    /* --- Cartella Quiz --- */
    var quizUnlocked = overallPercent() >= 100;
    var quizFolder = document.createElement('div');
    quizFolder.className = 'day-folder day-folder--quiz' + (quizUnlocked ? '' : ' is-locked');

    var quizHead = document.createElement(quizUnlocked ? 'a' : 'div');
    quizHead.className = 'day-head';
    if (quizUnlocked) quizHead.href = 'quiz';
    quizHead.innerHTML =
    '<span class="day-index">' + (quizUnlocked ? svgCheck() : '?') + '</span>' +
    '<span class="day-info">' +
        '<span class="day-title">Fai il Quiz</span>' +
        '<span class="day-sub">' + (quizUnlocked ? 'Disponibile ora' : 'Si sblocca al 100%') + '</span>' +
    '</span>' +
    (quizUnlocked ? svgChevron() : svgLock());
    quizFolder.appendChild(quizHead);
    daysContainer.appendChild(quizFolder);

    updateOverallUI();
    updateQuizReadyState();
}

/* ================================================
    PROGRESSO GLOBALE (navbar + sidebar)
================================================ */
var ringFg = document.getElementById('ringFg');
var ringNum = document.getElementById('ringNum');
var overallPctEl = document.getElementById('overallPct');
var overallBarFill = document.getElementById('overallBarFill');
var RING_CIRC = 100.5; // 2 * PI * 16, arrotondato

function updateOverallUI() {
    var pct = overallPercent();
    overallPctEl.textContent = pct + '%';
    overallBarFill.style.width = pct + '%';
    ringNum.textContent = pct + '%';
    var offset = RING_CIRC - (RING_CIRC * pct / 100);
    ringFg.style.strokeDashoffset = offset;
}

function updateQuizReadyState() {
    var pct = overallPercent();
    var playerCard = document.getElementById('playerCard');
    var quizReady = document.getElementById('quizReady');
    if (pct >= 100 && !activeVideo) {
    playerCard.style.display = 'none';
    quizReady.style.display = 'flex';
    } else {
    quizReady.style.display = 'none';
    playerCard.style.display = 'flex';
    }
}

/* ================================================
    YOUTUBE PLAYER (no skip/seek, solo play/pausa)
================================================ */
var ytPlayer = null;
var ytReady = false;
var ytApiFailed = false;
var pendingVideo = null;
var maxWatchedSeconds = 0; // impedisce il riavvolgimento in avanti via seek esterno
var pollTimer = null;
var loadTimeoutTimer = null;
var LOAD_TIMEOUT_MS = 9000;

var VOLUME_STORAGE_KEY = 'edilcam_formazione_volume';
function loadVolumeState() {
    try {
    var raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { volume: 100, muted: false };
    } catch (e) { return { volume: 100, muted: false }; }
}
function saveVolumeState(state) {
    try { localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}
var volumeState = loadVolumeState();

// Se l'IFrame API non chiama onYouTubeIframeAPIReady entro pochi secondi
// (script bloccato, rete lenta, ecc.) mostriamo un errore invece di restare
// bloccati sul messaggio "apri una cartella".
var apiReadyWatchdog = setTimeout(function () {
    if (!ytReady) {
    ytApiFailed = true;
    if (pendingVideo) showPlayerError();
    }
}, LOAD_TIMEOUT_MS);

window.onYouTubeIframeAPIReady = function () {
    ytReady = true;
    ytApiFailed = false; // l'API è arrivata: annulla un eventuale timeout precedente
    clearTimeout(apiReadyWatchdog);
    if (pendingVideo) {
    var v = pendingVideo;
    pendingVideo = null;
    initOrLoadVideo(v);
    }
};

function showPlayerError() {
    if (loadTimeoutTimer) { clearTimeout(loadTimeoutTimer); loadTimeoutTimer = null; }
    document.getElementById('playerEmpty').style.display = 'none';
    document.getElementById('ytPlayer').style.display = 'none';
    document.getElementById('playerError').classList.add('is-visible');
    btnPlayPause.disabled = true;
    btnRewind.disabled = true;
    setVolumeControlsEnabled(false);
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function hidePlayerError() {
    document.getElementById('playerError').classList.remove('is-visible');
}

function initOrLoadVideo(video) {
    if (ytApiFailed) { showPlayerError(); return; }
    if (!ytReady) { pendingVideo = video; return; }

    hidePlayerError();
    document.getElementById('playerEmpty').style.display = 'none';
    document.getElementById('ytPlayer').style.display = 'block';

    // Riprende da dove l'utente aveva lasciato il video, se c'è un progresso salvato.
    maxWatchedSeconds = getSavedSeconds(video.id);

    // Se il player tarda troppo a diventare pronto/utilizzabile, mostriamo l'errore
    // invece di lasciare l'interfaccia bloccata senza feedback.
    if (loadTimeoutTimer) clearTimeout(loadTimeoutTimer);
    loadTimeoutTimer = setTimeout(function () {
    if (!ytPlayer || typeof ytPlayer.getDuration !== 'function' || !ytPlayer.getDuration()) {
        showPlayerError();
    }
    }, LOAD_TIMEOUT_MS);

    if (!ytPlayer) {
    ytPlayer = new YT.Player('ytPlayer', {
        videoId: video.yt,
        playerVars: {
        controls: 0,      // niente barra di controllo nativa
        disablekb: 1,      // niente scorciatoie da tastiera
        modestbranding: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
        playsinline: 1
        },
        events: {
        onReady: function () { onPlayerReadyForVideo(video); },
        onStateChange: onPlayerStateChange,
        onError: function () { showPlayerError(); }
        }
    });
    } else {
    ytPlayer.loadVideoById(video.yt);
    // loadVideoById ri-triggera onReady solo la prima volta: per i caricamenti
    // successivi impostiamo subito i controlli e applichiamo il volume salvato.
    setPlayButtonState(false);
    applyStoredVolume();
    setVolumeControlsEnabled(true);
    startPolling();
    if (maxWatchedSeconds > 0) {
        // Aspettiamo che il player sia davvero pronto a ricevere il seek.
        waitAndSeek(maxWatchedSeconds);
    }
    }
}

function onPlayerReadyForVideo(video) {
    if (loadTimeoutTimer) { clearTimeout(loadTimeoutTimer); loadTimeoutTimer = null; }
    setPlayButtonState(false);
    applyStoredVolume();
    setVolumeControlsEnabled(true);
    startPolling();
    if (maxWatchedSeconds > 0) {
    waitAndSeek(maxWatchedSeconds);
    }
}

// Alcuni browser/connessioni lente non sono pronti a un seekTo() immediato
// dopo onReady: riprova per un breve periodo finché getDuration() è disponibile.
function waitAndSeek(seconds, attempts) {
    attempts = attempts || 0;
    if (!ytPlayer || !ytPlayer.getDuration) return;
    var duration = ytPlayer.getDuration();
    if (duration > 0) {
    ytPlayer.seekTo(Math.min(seconds, Math.max(0, duration - 0.5)), true);
    updateMiniBar(seconds, duration);
    } else if (attempts < 15) {
    setTimeout(function () { waitAndSeek(seconds, attempts + 1); }, 300);
    }
}

function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.PLAYING) setPlayButtonState(true);
    if (e.data === YT.PlayerState.PAUSED) setPlayButtonState(false);
    if (e.data === YT.PlayerState.ENDED) {
    setPlayButtonState(false);
    handleVideoCompleted();
    }
}

function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    var current = ytPlayer.getCurrentTime();
    var duration = ytPlayer.getDuration();

    /* Anti-skip: se l'utente tenta di saltare avanti (drag su barra nascosta,
        tasti freccia ecc.) lo riportiamo al punto massimo già raggiunto. */
    if (current > maxWatchedSeconds + 1.5) {
        ytPlayer.seekTo(maxWatchedSeconds, true);
    } else if (current > maxWatchedSeconds) {
        maxWatchedSeconds = current;
    }

    updateMiniBar(maxWatchedSeconds, duration);

    // Salva il progresso in secondi periodicamente, così ricaricando la pagina
    // o tornando alla lista il video riparte da dove era arrivato.
    if (activeVideo) saveSeconds(activeVideo.video.id, maxWatchedSeconds);

    /* Considera completato anche se ENDED non scatta per arrotondamenti */
    if (duration > 0 && maxWatchedSeconds >= duration - 0.6) {
        handleVideoCompleted();
    }
    }, 400);
}

function updateMiniBar(current, duration) {
    var pct = duration > 0 ? (current / duration) * 100 : 0;
    document.getElementById('miniBarFill').style.width = pct + '%';
    document.getElementById('miniTime').textContent = formatTime(current) + ' / ' + formatTime(duration);
}

function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

/* ================================================
    VOLUME
================================================ */
var volumeSlider = document.getElementById('volumeSlider');
var btnMute = document.getElementById('btnMute');
var iconVolOn = document.getElementById('iconVolOn');
var iconVolOff = document.getElementById('iconVolOff');

function setVolumeControlsEnabled(enabled) {
    volumeSlider.disabled = !enabled;
    btnMute.disabled = !enabled;
}

function applyStoredVolume() {
    if (!ytPlayer || !ytPlayer.setVolume) return;
    ytPlayer.setVolume(volumeState.volume);
    if (volumeState.muted) { ytPlayer.mute(); } else { ytPlayer.unMute(); }
    volumeSlider.value = volumeState.volume;
    updateMuteIcon();
}

function updateMuteIcon() {
    var isMuted = volumeState.muted || volumeState.volume === 0;
    iconVolOn.style.display = isMuted ? 'none' : 'block';
    iconVolOff.style.display = isMuted ? 'block' : 'none';
}

volumeSlider.addEventListener('input', function () {
    var val = parseInt(volumeSlider.value, 10);
    volumeState.volume = val;
    volumeState.muted = val === 0;
    saveVolumeState(volumeState);
    if (ytPlayer && ytPlayer.setVolume) {
    ytPlayer.setVolume(val);
    if (val === 0) { ytPlayer.mute(); } else { ytPlayer.unMute(); }
    }
    updateMuteIcon();
});

btnMute.addEventListener('click', function () {
    if (!ytPlayer || !ytPlayer.mute) return;
    volumeState.muted = !volumeState.muted;
    saveVolumeState(volumeState);
    if (volumeState.muted) { ytPlayer.mute(); } else { ytPlayer.unMute(); }
    updateMuteIcon();
});

/* ================================================
    RETRY CARICAMENTO VIDEO
================================================ */
document.getElementById('btnRetryVideo').addEventListener('click', function () {
    if (!activeVideo) return;
    hidePlayerError();
    document.getElementById('playerEmpty').style.display = 'none';
    ytApiFailed = false;

    if (!ytReady) {
    // L'API potrebbe non essersi mai caricata: tenta di ricaricare lo script.
    pendingVideo = activeVideo.video;
    var existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existing) {
        var s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
    }
    clearTimeout(apiReadyWatchdog);
    apiReadyWatchdog = setTimeout(function () {
        if (!ytReady) { ytApiFailed = true; showPlayerError(); }
    }, LOAD_TIMEOUT_MS);
    return;
    }
    initOrLoadVideo(activeVideo.video);
});

/* ================================================
    CONTROLLI ESTERNI (play/pausa, torna alla lista)
================================================ */
var btnPlayPause = document.getElementById('btnPlayPause');
var btnRewind = document.getElementById('btnRewind');
var btnBack = document.getElementById('btnBack');
var iconPlay = document.getElementById('iconPlay');
var iconPause = document.getElementById('iconPause');
var playPauseLabel = document.getElementById('playPauseLabel');

function setPlayButtonState(isPlaying) {
    iconPlay.style.display = isPlaying ? 'none' : 'block';
    iconPause.style.display = isPlaying ? 'block' : 'none';
    playPauseLabel.textContent = isPlaying ? 'Pausa' : 'Play';
    btnPlayPause.dataset.playing = isPlaying ? '1' : '0';
}

btnPlayPause.addEventListener('click', function () {
    if (!ytPlayer) return;
    if (btnPlayPause.dataset.playing === '1') {
    ytPlayer.pauseVideo();
    } else {
    ytPlayer.playVideo();
    }
});

// Indietro di 10 secondi: consentito perché non fa mai superare il punto
// massimo già raggiunto (maxWatchedSeconds), quindi non permette di saltare
// contenuto non ancora visto, solo di rivedere quello già guardato.
btnRewind.addEventListener('click', function () {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    var current = ytPlayer.getCurrentTime();
    var target = Math.max(0, current - 10);
    ytPlayer.seekTo(target, true);
    updateMiniBar(target, ytPlayer.getDuration ? ytPlayer.getDuration() : 0);
    if (activeVideo) saveSeconds(activeVideo.video.id, Math.min(target, maxWatchedSeconds));
});

btnBack.addEventListener('click', function () {
    if (ytPlayer) ytPlayer.pauseVideo();
    activeVideo = null;
    resetPlayerUI();
    renderDays();
});

function resetPlayerUI() {
    document.getElementById('playerEyebrow').textContent = 'Seleziona un video';
    document.getElementById('playerTitle').textContent = 'Nessun video in riproduzione';
    document.getElementById('playerCounter').textContent = '';
    document.getElementById('playerEmpty').style.display = 'flex';
    document.getElementById('ytPlayer').style.display = 'none';
    hidePlayerError();
    document.getElementById('miniBarFill').style.width = '0%';
    document.getElementById('miniTime').textContent = '00:00 / 00:00';
    btnPlayPause.disabled = true;
    btnRewind.disabled = true;
    btnBack.disabled = true;
    setVolumeControlsEnabled(false);
    setPlayButtonState(false);
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (loadTimeoutTimer) { clearTimeout(loadTimeoutTimer); loadTimeoutTimer = null; }
    updateQuizReadyState();
}

/* ================================================
    AVVIO VIDEO
================================================ */
function playVideo(dayObj, video, idx) {
    activeVideo = { dayObj: dayObj, video: video, index: idx };

    document.getElementById('playerEyebrow').textContent = dayObj.label;
    document.getElementById('playerTitle').textContent = video.title;
    document.getElementById('playerCounter').textContent = 'Video ' + (idx + 1) + ' di ' + dayObj.videos.length;

    btnPlayPause.disabled = false;
    btnRewind.disabled = false;
    btnBack.disabled = false;

    document.getElementById('playerCard').style.display = 'flex';
    document.getElementById('quizReady').style.display = 'none';

    var savedSeconds = getSavedSeconds(video.id);
    document.getElementById('miniTime').textContent = formatTime(savedSeconds) + ' / 00:00';

    initOrLoadVideo(video);
    renderDays();
}

/* ================================================
    COMPLETAMENTO VIDEO
================================================ */
var toastTimer = null;
function handleVideoCompleted() {
    if (!activeVideo) return;
    clearSeconds(activeVideo.video.id);
    var wasNew = markDone(activeVideo.video.id);
    renderDays();
    if (wasNew) showToast();
}

function showToast() {
    var toast = document.getElementById('videoToast');
    var sub = document.getElementById('videoToastSub');
    sub.textContent = 'Progresso totale: ' + overallPercent() + '%';
    toast.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 3200);
}

/* ================================================
    INIT
================================================ */
renderDays();
})();

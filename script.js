const cupsContainer = document.querySelector('.cups')
const cups = Array.from(cupsContainer.querySelectorAll('.cup'))
let clique = 0;
for(let i = cups.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[cups[i], cups[randomIndex]] = [cups[randomIndex], cups[i]]
}

cups.forEach(cup => cupsContainer.appendChild(cup))

const smallCups = document.querySelectorAll('.cup-small')
const litros = document.getElementById('litros')
const porcentagem = document.getElementById('porcentagem')
const restante = document.getElementById('restante')
const falseCups = document.querySelectorAll('.cup-false')
const bigCup = document.querySelector('.cup')
const eastereggOverlay = document.getElementById('easteregg')
let eastereggAtivado = false

updateBigCup()

smallCups.forEach((cup, idx) => {
    cup.addEventListener('click', () => highlightCups(idx))
})

falseCups.forEach(cup => {
    cup.addEventListener('click', () => {
        bigCup.classList.remove('shake')
        void bigCup.offsetWidth
        bigCup.classList.add('shake')
        clique++

        easteregg()

        window.setTimeout(() => {
            bigCup.classList.remove('shake')
        }, 500)
    })
})

function easteregg() {
    if(clique > 9 && !eastereggAtivado) {
        eastereggAtivado = true
        eastereggOverlay.classList.remove('active')
        void eastereggOverlay.offsetWidth
        eastereggOverlay.classList.add('active')
        eastereggOverlay.setAttribute('aria-hidden', 'false')

        iniciarAmbiente()
        tocarSusto()

        window.setTimeout(pararTudo, 6000)
    }
}

function highlightCups(idx) {
    const cup = smallCups[idx]
    const fullCups = document.querySelectorAll('.cup-small.full').length
    const targetCups = 8

    if(!cup.classList.contains('full') && fullCups >= targetCups) {
        bigCup.classList.remove('shake', 'overflowing')
        void bigCup.offsetWidth
        bigCup.classList.add('shake', 'overflowing')

        window.setTimeout(() => {
            bigCup.classList.remove('shake')
        }, 700)

        window.setTimeout(() => {
            bigCup.classList.remove('overflowing')
        }, 1800)

        return
    }

    cup.classList.toggle('full')
    updateBigCup()
}

function updateBigCup() {
    const fullCups = document.querySelectorAll('.cup-small.full').length
    const totalCups = 8
    const completedCups = Math.min(fullCups, totalCups)

    if(completedCups === 0) {
        porcentagem.style.visibility = 'hidden'
        porcentagem.style.height = 0
        porcentagem.innerText = ''
    } else {
        const percent = completedCups / totalCups * 100
        const percentText = Number(percent.toFixed(1)).toString()

        porcentagem.style.visibility = 'visible'
        porcentagem.style.height = `${completedCups / totalCups * 330}px`
        porcentagem.innerText = `${percentText}%`
    }

    if(completedCups === totalCups) {
        restante.style.visibility = 'hidden'
        restante.style.height = 0
    } else {
        const litersRemaining = 2 - (0.25 * completedCups)

        restante.style.visibility = 'visible'
        litros.innerText = `${Number(litersRemaining.toFixed(2))}L`
    }
}

let audioCtx;
let osc1, osc2, lfo, noiseSource;

function iniciarAmbiente() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if(osc1) return;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.16;

    osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, audioCtx.currentTime);

    osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(225.5, audioCtx.currentTime);

    lfo = audioCtx.createOscillator();
    lfo.frequency.value = 1.7;

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.09;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    const filtro = audioCtx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 900;
    filtro.Q.value = 12;

    osc1.connect(filtro);
    osc2.connect(filtro);
    filtro.connect(gainNode);

    const noiseLength = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for(let i = 0; i < noiseLength; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLength * 0.7);
    }

    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1500;
    noiseFilter.Q.value = 3;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.035;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();
    noiseSource.start();
}

function tocarSusto() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const agora = audioCtx.currentTime;
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 4;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.25;
    compressor.connect(audioCtx.destination);

    const gainSusto = audioCtx.createGain();
    gainSusto.gain.setValueAtTime(0.001, agora);
    gainSusto.gain.linearRampToValueAtTime(0.9, agora + 0.025);
    gainSusto.gain.exponentialRampToValueAtTime(0.08, agora + 0.55);
    gainSusto.gain.exponentialRampToValueAtTime(0.001, agora + 1.2);
    gainSusto.connect(compressor);

    [90, 180, 720].forEach((frequencia, index) => {
        const osc = audioCtx.createOscillator();
        osc.type = index === 2 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(frequencia * 8, agora);
        osc.frequency.exponentialRampToValueAtTime(frequencia, agora + 0.8);
        osc.detune.setValueAtTime(index === 1 ? 18 : -12, agora);
        osc.connect(gainSusto);
        osc.start(agora);
        osc.stop(agora + 1.2);
    });

    const noiseLength = audioCtx.sampleRate * 1.2;
    const noiseBuffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    for(let i = 0; i < noiseLength; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1300;
    noiseFilter.Q.value = 0.8;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.001, agora);
    noiseGain.gain.linearRampToValueAtTime(0.75, agora + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, agora + 0.9);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(compressor);

    noise.start(agora);
    noise.stop(agora + 1);
}

function pararTudo() {
    if(osc1) {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        if(noiseSource) noiseSource.stop();
        osc1 = null;
        osc2 = null;
        lfo = null;
        noiseSource = null;
    }
}

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
    if(clique > 10 && !eastereggAtivado) {
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
let osc1, osc2, lfo;

function iniciarAmbiente() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if(osc1) return;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.25;

    osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

    osc2 = audioCtx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(56.5, audioCtx.currentTime);

    lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.4;

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 4;
    lfo.connect(lfoGain);
    lfoGain.connect(osc2.frequency);

    const filtro = audioCtx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 220;

    osc1.connect(filtro);
    osc2.connect(filtro);
    filtro.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();
}

function tocarSusto() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const agora = audioCtx.currentTime;
    const oscSusto = audioCtx.createOscillator();
    const gainSusto = audioCtx.createGain();

    oscSusto.type = 'square';
    oscSusto.frequency.setValueAtTime(1400, agora);
    oscSusto.frequency.exponentialRampToValueAtTime(120, agora + 0.6);

    gainSusto.gain.setValueAtTime(0.6, agora);
    gainSusto.gain.exponentialRampToValueAtTime(0.01, agora + 0.8);

    oscSusto.connect(gainSusto);
    gainSusto.connect(audioCtx.destination);

    oscSusto.start(agora);
    oscSusto.stop(agora + 0.8);
}

function pararTudo() {
    if(osc1) {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        osc1 = null;
        osc2 = null;
        lfo = null;
    }
}

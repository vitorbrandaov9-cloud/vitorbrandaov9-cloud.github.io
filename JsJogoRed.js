const bola = document.querySelector(".bola");
const gamescreen = document.querySelector(".gamescreen");
const missil = document.querySelector(".missil-hitbox");
const explosion = document.getElementById("explosion");



let da = 0;
let pulando = false;
let colisaoJaOcorrida = false;

function limitarMovimento() {
    if (!gamescreen || !bola) return;

    const maxX = gamescreen.clientWidth - bola.offsetWidth;
    da = Math.max(1, Math.min(da, maxX));
    bola.style.left = da + "px";
}

function ativarExplosao() {
    if (!missil || !explosion || colisaoJaOcorrida) return;

    colisaoJaOcorrida = true;
    const bolaRect = bola.getBoundingClientRect();
    const gamescreenRect = gamescreen.getBoundingClientRect();

    const left = bolaRect.left - gamescreenRect.left + (bola.offsetWidth / 2) - (explosion.offsetWidth / 2);
    const bottom = bolaRect.bottom - gamescreenRect.bottom + 10;

    missil.style.display = "none";
    explosion.style.display = "block";
    explosion.style.left = `${left}px`;
    explosion.style.bottom = `${bottom}px`;

    explosion.classList.remove("ativo");
    void explosion.offsetWidth;
    explosion.classList.add("ativo");

    explosion.addEventListener("animationend", () => {
        explosion.classList.remove("ativo");
        explosion.style.display = "none";
    }, { once: true });
}

function ativarMudaFundo() {
    if (!gamescreen) return;

    gamescreen.style.backgroundImage = "url('./checkmate.gif')";
    gamescreen.style.backgroundSize = "cover";
    gamescreen.style.backgroundPosition = "center";
    gamescreen.style.backgroundRepeat = "no-repeat";
}

function verificarColisao() {
    if (!missil || !bola || colisaoJaOcorrida) return;

    const missilRect = missil.getBoundingClientRect();
    const bolaRect = bola.getBoundingClientRect();

    const acertou =
        missilRect.right >= bolaRect.left &&
        missilRect.left <= bolaRect.right &&
        missilRect.bottom >= bolaRect.top &&
        missilRect.top <= bolaRect.bottom;

    if (acertou) {
        ativarExplosao();
        ativarMudaFundo();
    }
}

function mover(event) {
    switch (event.key.toLowerCase()) {
        case "w":
            pular();
            break;
        case "a":
            da -= 80;
            limitarMovimento();
            break;
        case "s":
            break;
        case "d":
            da += 80;
            limitarMovimento();
            break;
    }
}

bola.addEventListener("animationend", () => {
    bola.classList.remove("Pulo");
    pulando = false;
});

function pular() {
    if (pulando) return;

    pulando = true;
    bola.classList.remove("Pulo");
    void bola.offsetWidth;
    bola.classList.add("Pulo");
}

setInterval(verificarColisao, 20);

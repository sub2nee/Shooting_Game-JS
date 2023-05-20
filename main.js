//캔버스 세팅
let canvas;
let ctx;
canvas = document.createElement('canvas');
ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 750;
document.body.appendChild(canvas);

const gameOverSound = new Audio('sounds/GameOver.ogg');
const laserSounds = ['sounds/sfx_laser1.ogg', 'sounds/sfx_laser2.ogg'];

const font = new FontFace('kenvector_future', 'url(font/kenvector_future.ttf)');
font.load().then(() => {
    document.fonts.add(font);
    ctx.font = 'bold 24px kenvector_future';
    ctx.fillStyle = 'white';
});
const playRandomLaserSound = () => {
    const index = Math.floor(Math.random() * laserSounds.length);
    const audio = new Audio(laserSounds[index]);
    audio.play();
};
/***********************************************************************************/

let gameOver = false; //true 이면 게임 끝, false 이면 게임진행
let score = 0;

//캔버스 중앙에 위치하기
const x = canvas.width / 2;
const y = canvas.height / 2;

const playerShipWidth = 112;
const playerShipHeight = 75;

//플레이어 좌표
let playerShipX = x - playerShipWidth / 2;
let playerShipY = canvas.height - playerShipHeight;

let bgImg, gameOverImg, playerShipImg, bulletImg, enemyImgs;

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function loadImages() {
    bgImg = loadImage('images/background.jpg');
    gameOverImg = loadImage('images/gameOver.png');
    playerShipImg = loadImage('images/playerShip.png');
    bulletImg = loadImage('images/bullet.png');
    enemyImgs = [
        loadImage('images/enemy/enemy1.png'),
        loadImage('images/enemy/enemy2.png'),
        loadImage('images/enemy/enemy3.png'),
    ];
}

let bulletList = []; //총알들을 저장하는 리스트
function Bullet() {
    this.x = 0;
    this.y = 0;
    this.init = function () {
        this.x = playerShipX + 25;
        this.y = playerShipY;
        this.alive = true; //true면 살아있는총알, false면 없어진 총알
        bulletList.push(this);
    };
    this.update = function () {
        this.y -= 25;
    };
    this.checkHit = function () {
        for (let i = 0; i < enemyList.length; i++) {
            if (
                this.y <= enemyList[i].y &&
                this.x >= enemyList[i].x &&
                this.x <= enemyList[i].x + 122
            ) {
                if (this.y >= 0) {
                    // 총알이 캔버스 내부에 있을 때만 점수 획득
                    score += 100;
                }
                this.alive = false; //없어진총알
                enemyList.splice(i, 1);
                // 적군과 충돌한 총알도 삭제하기
                bulletList.splice(bulletList.indexOf(this), 1);
            }
        }
    };
}

function randomEnemy(min, max) {
    let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum;
}

let enemyList = [];
function Enemy() {
    this.x = 0;
    this.y = 0;
    this.img = null;

    this.init = function () {
        this.y = 0;
        this.x = randomEnemy(0, canvas.width - 112);
        const randomImg = randomEnemy(1, 3);
        if (randomImg === 1) {
            this.img = enemyImgs[0];
        } else if (randomImg === 2) {
            this.img = enemyImgs[1];
        } else {
            this.img = enemyImgs[2];
        }
        enemyList.push(this);
    };

    this.update = function () {
        this.y += 3; //적군의 속도 조절

        if (
            this.y >= canvas.height - 122 ||
            (this.y >= playerShipY - 112 &&
                this.x >= playerShipX &&
                this.x <= playerShipX + playerShipWidth)
        ) {
            gameOver = true;
            console.log('Game Over');
        }
    };
}

let keysDown = {};
function setupKeyboardListener() {
    document.addEventListener('keydown', function (event) {
        keysDown[event.keyCode] = true;
        if (event.keyCode == 13 && gameOver) {
            //Enter
            reGame(); //게임다시시작
        }
    });
    document.addEventListener('keyup', function (event) {
        delete keysDown[event.keyCode];

        if (event.keyCode == 32) {
            //space
            createBullet(); //총알생성
        }
    });
}

function createBullet() {
    let b = new Bullet(); //총알 한개 생성
    b.init();
    playRandomLaserSound();
}

function createEnemy() {
    // const interval = setInterval(호출하고싶은함수,시간[단위:ms = 1s(1000ms] ))
    const interval = setInterval(function () {
        let e = new Enemy();
        e.init();
    }, 1000);
}

function reGame() {
    // 게임 초기화 및 리셋 작업 수행
    gameOver = false; // 게임 오버 상태 초기화
    playerShipX = x - playerShipWidth / 2;
    playerShipY = canvas.height - playerShipHeight; //플레이어 위치 초기화
    bulletList = []; // 총알 리스트 초기화
    enemyList = []; // 적군 리스트 초기화
    score = 0;

    // 게임 루프 다시 시작
    main();
}

function update() {
    const moveStep = 10;
    playerShipX = Math.max(
        Math.min(
            playerShipX +
                (39 in keysDown ? moveStep : 0) -
                (37 in keysDown ? moveStep : 0),
            canvas.width - playerShipWidth
        ),
        0
    );
    playerShipY = Math.max(
        Math.min(
            playerShipY +
                (40 in keysDown ? moveStep : 0) -
                (38 in keysDown ? moveStep : 0),
            canvas.height - playerShipHeight
        ),
        0
    );

    bulletList.forEach((bullet) => {
        if (bullet.alive) {
            bullet.update();
            bullet.checkHit();
        }
    });

    enemyList.forEach((enemy) => enemy.update());
}

// 이미지보여주기
// ctx.drawImage(image, dx, dy, dWidth, sHeight);
function render() {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height); //배경이미지
    ctx.drawImage(playerShipImg, playerShipX, playerShipY); //플레이어이미지
    ctx.fillText(`score : ${score}`, 20, 45); //점수
    ctx.fillStyle = 'white';

    for (let i = 0; i < bulletList.length; i++) {
        if (bulletList[i].alive) {
            ctx.drawImage(bulletImg, bulletList[i].x, bulletList[i].y);
        } //살아있는 총알이미지만 보여주기
    }

    for (let i = 0; i < enemyList.length; i++) {
        ctx.drawImage(enemyList[i].img, enemyList[i].x, enemyList[i].y);
    } //적군이미지
}

function main() {
    if (gameOver) {
        ctx.drawImage(gameOverImg, x - 200, y - 190, 400, 280);
        ctx.fillText('Press Enter to begin', x - 170, y + 200);
        gameOverSound.play(); // 게임 오버 사운드 출력
        setupKeyboardListener();
    } else {
        update(); // 좌표값을 업데이트하고
        render(); // 다시 그리기
        requestAnimationFrame(main);
    }
}

loadImages();
setupKeyboardListener();
createEnemy();
main();

//방향키를 누르면 playerShip 의 x,y좌표가 바뀌고 , 다시 render그리기

/*  
playerShip이 오른쪽으로 간다 -> x좌표의 값이 증가한다.
playerShip이 왼쪽으로 간다 -> x좌표의 값이 감소한다.
*/

/*
총알 만들기
1. 스페이스바를 누르면 총알 발사
2. 총알발사 = 총알의 Y값이 --(감소) , 총알의 X값은? 스페이스를 누른 순간의 player 좌표값과 동일
3. 발사된 총알들은 배열에 저장
4. 모든 총알들은 X,Y 좌표값이 있어야한다.
5. 총알 배열을 가지고 render 그려준다.
*/

/*
적군 만들기
1. 적군은 위치가 랜덤하다
2. 적군은 밑으로 내려온다
3. 1초마다 하나씩 적군이나온다
4. 적군이 우주선이나 바닥에 닿으면 게임오버
5. 적군과 총알이 만나면 우주선이 사라진다 점수 1점 획득
*/

/*
적군이 죽는다
1. 총알이 적군에게 닿는다
(총알의 y값 <= 적군의 y값 && 총알의 x값 >= 적군의 x값  && 총알의 x값 + 적군의 넓이)
2. 총알과 적군 없어진다
3. 점수 획득
*/

/*
게임 다시시작
1. 엔터를 누르면 다시 시작한다
2. 플레이어 위치를 원래대로 초기화
3. 적군과 총알의 리스트 초기화
4. 점수 또한 초기화시켜준다
5. 배경음악을 다시 재시작
*/

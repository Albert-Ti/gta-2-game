import Player from "./Player.js";
import Projectile from "./Projectile.js";
import Enemy from "./enemy.js";
import { distanceBetweenTwoPoints } from "./utilites.js";

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const wastedElem = document.querySelector('.wasted');
const scoreElem = document.querySelector('#score');

// Зададим размер canvas чтобы он был на всю ширину экрана
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

let player;
let projectiles = []; // где будет хранится все снаряды
let enemies = []; // массив врагов
let particles = []; // массив частиц взрыва
let score = 0; // очки в игре
let animationId;
let spawnIntervalId;
let countIntervalId;


startGame();
function startGame() {
  init();
  animate();
  spawnEnemies(); // Добавление врагов 
}

function init() {
  const movementLimits = {
    minX: 0,
    maxX: canvas.width,
    minY: 0,
    maxY: canvas.height
  }
  // Создадим нашего персонажа это будет экземпляр класса Player кот. мы опишем чуть позже
  // Персонаж будет изначально распологаться в середине экрана поэтому передаем координаты середины canvas
  // И передаем context так как он понадобится для отрисовки персонажа
  player = new Player(canvas.width / 2, canvas.height / 2, context, movementLimits);
  addEventListener('click', createProjectile);
}

function createProjectile(evt) {
  projectiles.push(
    new Projectile(
      player.x, // координаты выстрела
      player.y,
      evt.clientX, // координаты цели они совпадут с местом клика
      evt.clientY,
      context // отрисовать снаряд
    )
  )
}

function spawnEnemies() {
  let countSpawnEnemies = 1; // отвечает за кол-во появляюших врагов

  countIntervalId = setInterval(() => {
    countSpawnEnemies++;
  }, 30000);
  spawnIntervalId = setInterval(() => {
    spawnCountEnemies(countSpawnEnemies);
  }, 1000);
  // в аргументах Enemy мы ширина и высота canvas эти значения нам понадобятся для того чтобы враги появлялись из-за пределы экрана, далее нам нужен context чтобы рисовать врагов, и player чтобы враги следовали за персонажем
  spawnCountEnemies(countSpawnEnemies);
}

function spawnCountEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(new Enemy(canvas.width, canvas.height, context, player));
  }
}



// картинка отрисовывается не моментально, а в нашем коде мы рисуем один кадр когда картинка еще не подгрузилась файле index.js мы создадим цикл отрисовки анимации 
function animate() {
  animationId = requestAnimationFrame(animate);

  // теперь персонаж поворачивается но старая картинка не стирается
  // чтобы полностью очишать canvas перед каждой новой отрисовкой
  context.clearRect(0, 0, canvas.width, canvas.height);


  particles = particles.filter(particle => particle.alpha > 0)
  // улучшение: когда снаряд вылетаем за пределы экрана то мы можем его больше не рисовать. Тут в массив projectiles запишем новый массив( в кот. будут только те снаряды кот. остались внутри окна браузера )
  projectiles = projectiles.filter(projectileInsideWindow);
  enemies.forEach(enemy => checkHittingEnemy(enemy)); // пропишем логика попадания снарядо во врага. Мы пробежим по массиву врагов и проверим попал ли снаряд во врага

  enemies = enemies.filter(enemy => enemy.health > 0); // убираем с экрана убитого врага
  const isGameOver = enemies.some(checkHittingPlayer);
  // если нас коснулся враг то
  if (isGameOver) {
    wastedElem.style.display = 'block';
    clearInterval(countIntervalId);
    clearInterval(spawnIntervalId); // после окончании не появлялись новые враги
    cancelAnimationFrame(animationId);
  }


  particles.forEach(particle => particle.update());
  // Добавим код отрисовки всех снарядов. То есть мы пробежимся по всем снарядом в массиве projectiles и у каждого снаряда вызовим метод update
  projectiles.forEach(projectile => projectile.update());
  player.update();

  enemies.forEach(enemy => enemy.update());
}

function projectileInsideWindow(projectile) {
  // возврашать будет true если снаряд внутри экрана
  // 1. сперва проверим что снаряд не вышел левой части экрана, тогда projectile.x + projectile.radius должен быть больше 0 если мы будем сравнивать только projectile.x то снаряд будет пропадать когда он на половину выйдет за экран, а нам нужно чтоб он полностью пропадал когда выходит за пределы экрана
  // 2. теперь проверям что снаряд не вышел правой части экрана
  return projectile.x + projectile.radius > 0 &&
    projectile.x - projectile.radius < canvas.width &&
    projectile.y + projectile.radius > 0 &&
    projectile.y - projectile.radius < canvas.height;
}

function checkHittingPlayer(enemy) { // функция косания нас врагом
  const distance = distanceBetweenTwoPoints(player.x, player.y, enemy.x, enemy.y);
  return distance - enemy.radius - player.radius < 0;
}


function checkHittingEnemy(enemy) {
  // пробежимся по массиву снарядов и найдем любой один снаряд кот. коснулся врага
  projectiles.some((projectile, index) => {
    // далее расчитаем расстояние между врагом и снарядом для этого будем использовать ранее написанную функцию. Расстояние будем расчитывать между центром врага и центром снаряда
    const distance = distanceBetweenTwoPoints(projectile.x, projectile.y, enemy.x, enemy.y)
    // если расстояние больше чем радиус врага и радиус снаряда то это значит что мы не попали во врага
    if (distance - enemy.radius - projectile.radius > 0) return false

    removeProjectileByIndex(index);
    // уменьшение жизни врага
    enemy.health--;

    // добавим визуальный эффект попадания, если у врага закончились жизни вызовем у врага метод
    if (enemy.health < 1) {
      increaseScore(); // функция увеличения очков
      enemy.createExplosion(particles);
    }
    return true;
  })
}


function removeProjectileByIndex(index) {
  projectiles.splice(index, 1); // удалять 1 элемент по индексу
}


function increaseScore() {
  score += 250;
  scoreElem.textContent = score;
}
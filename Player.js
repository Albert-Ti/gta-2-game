
// добавим возможность перемешения персонажа клавишами
// это коды клавиши верх и W, причем это будет независимо регистра и раскладки
const MOVE_UP_KEY_CODES = ["ArrowUp", "KeyW"];
// теперь нужно повторить все тоже самое и для ругих клавиш
const MOVE_DOWN_KEY_CODES = ["ArrowDown", "KeyS"];
const MOVE_LEFT_KEY_CODES = ["ArrowLeft", "KeyA"];
const MOVE_RIGHT_KEY_CODES = ["ArrowRight", "KeyD"];
const ALL_MOVE_KEY_CODES = [...MOVE_UP_KEY_CODES, ...MOVE_DOWN_KEY_CODES, ...MOVE_LEFT_KEY_CODES, ...MOVE_RIGHT_KEY_CODES]


export default class Player {
  constructor(x, y, context, movementLimits) {
    this.velocity = 3;
    this.radius = 15;

    this.x = x;
    this.y = y;
    this.context = context;

    // теперь заставим нащего персонажа поворачиваться за курсором, добавим свойство для хранение позиции курсора в качестве начальных значений укажем x0 y0:
    this.cursorPosition = {
      x: 0,
      y: 0
    };

    this.movementLimits = {
      minX: movementLimits.minX + this.radius,
      maxX: movementLimits.maxX - this.radius,
      minY: movementLimits.minY + this.radius,
      maxY: movementLimits.maxY - this.radius,
    }

    // далее нужно подписаться на событие mousemove

    document.addEventListener('mousemove', evt => {
      // при каждом перемещении курсора будем менять позицию cursorPosition на новую:
      this.cursorPosition.x = evt.clientX;
      this.cursorPosition.y = evt.clientY;
    })

    // Внутри этого обьекта будем хранить нажатые клавиши, это нужно чтобы наш персонаж мог перемешаться в две стороны
    this.keyMap = new Map();
    // подпишем на событие keyDown 
    document.addEventListener('keydown', evt => this.keyMap.set(evt.code, true))
    document.addEventListener('keyup', evt => this.keyMap.delete(evt.code))



    // создаем в конструкторе экземпляр картинки
    this.image = new Image();
    this.image.src = './img/player.png'

    // размеры отображаемой части картинки
    this.imageWidth = 50;
    this.imageHeight = 60;

    this.isMoving = false; // нужен чтобы рисовать неподвижного персонажа
    this.imageTick = 0; // нужен чтобы считать кол-во кадров между сменой картинок для анимации движения ног
  }
  // метод в кот. мы будем рисовать картинку персонажа
  drawImg() {
    const imageTickLimit = 18; // каждые 18 кадров менять картинку положении ног
    let subX = 0; // будем хранить позицию начало картинки
    if (!this.isMoving) {
      subX = 0; // если персонаж не двигается но нужно менять значение subX на ноль
      this.imageTick = 0; // и нужно обнулять imageTik
    } else {
      // если персонаж двигается то надо менять значение subX в зависимости imageTick
      subX = this.imageTick > imageTickLimit ? this.imageWidth * 2 : this.imageWidth;
      this.imageTick++;
    }
    // когда imageTick будет больше 2 лимитов то обнулим его таким оразом во время движения будет рисоватся то 2 то 3 картинка спрайта
    if (this.imageTick > imageTickLimit * 2) {
      this.imageTick = 0;
    }
    // теперь добавим на canvas часть картинки спрайта(это изобр. персонажа в трех разных состояниях) где персонаж не подвижен с помошью метода drowImage.
    // в нашем случаю придеться с максимальным кол-ом аргументов 
    this.context.drawImage(
      // передаем экземпляр картинки
      this.image,
      // далее передаем координаты спрайта с которых начнется наше изобр.
      // так как мы будем брать первую картинку спрайта то мы начнем с 0,0
      subX,
      0,
      // далее передаем ширину и высоту части картинки спрайта
      this.imageWidth,
      this.imageHeight,
      // теперь нужно указать координаты canvas в котоорых картинка начнется рисоваться
      // чтобы координаты персонажа были в центре картинки, то нам нужно сместить начало картинки в convas на половину ширины и наполовину высотв
      // и только тогда цнтр отрисованной картинки будет совпадать с координатами x y
      this.x - this.imageWidth / 2,
      this.y - this.imageHeight / 2,
      // далее передаем ширину и высоту картинки, кот. мы хотим нарисовать на convas
      // так как мы не будем масштабировать картинку то ширина и высота опять будут 
      this.imageWidth,
      this.imageHeight
    );
  }


  // теперь запишим метод draw, в которым мы будем рисовать картинку под нужным углом чтобы наш персонаж смотрел на курсос
  draw() {
    // так как просто картинку повернуть не можем, то будем поварачивать весь canvas, а потом возврашать в первоначальное состояние, чтобы созранить текущее состояние canvas пишем
    this.context.save();
    // теперь нужно высчитать угол между персонажем и курсосром делть будем через встроенный метов Math.atan2, он возрашает угол в радианах по координатам относительно центра координат, пожтому нам нужно будет как бы переместить персонажа в центра координат и пересчитать координаты курсора  новые координаты уцрсора для вичисления будут - this.cursorPosition.y - this.y, this.cursorPosition.x - this.x
    let angle = Math.atan2(this.cursorPosition.y - this.y, this.cursorPosition.x - this.x);

    // теперь перед тем как повернуть canvas нам нужно проделать еще одну хитрость, так как canvas поварачивается относительно координат :0 :0, а нам нужно его повернуть относително координат this.x this.y, то мы сперва переместим canvas на координаты this.x и this.y с помошью метода translate, повернем его с помошью метода rotate и сместим обратно на -this.x и -this.y
    this.context.translate(this.x, this.y);
    this.context.rotate(angle + Math.PI / 2);
    this.context.translate(-this.x, -this.y);

    this.drawImg();// теперь нужно нарисовать картинку с помошью готового метода drawImage
    this.context.restore();// и вернуть canvas в прежнее состояние с помошью встроеного метода restore
  }


  update() {
    this.isMoving = this.shouldMove(ALL_MOVE_KEY_CODES);
    this.draw(); // рисуем персонажа
    this.updatePosiyion(); // а после этого менять персонажа для следующей отрисовки для этого создадим метод
    this.checkPositionLimitAndUpdate()
  }

  checkPositionLimitAndUpdate() {
    if (this.y < this.movementLimits.minY) this.y = this.movementLimits.minY;
    if (this.y > this.movementLimits.maxY) this.y = this.movementLimits.maxY;
    if (this.x < this.movementLimits.minX) this.x = this.movementLimits.minX;
    if (this.x > this.movementLimits.maxX) this.x = this.movementLimits.maxX;
  }

  updatePosiyion() {
    // теперь внутри updatePosiyion с помошью метода shouldMove проверяем нажата ли какая-то изклавиш верх, если клавиша нажата то уменьшаем значение this.y на значение скорости this.velocity
    if (this.shouldMove(MOVE_UP_KEY_CODES)) this.y -= this.velocity;
    if (this.shouldMove(MOVE_DOWN_KEY_CODES)) this.y += this.velocity;
    if (this.shouldMove(MOVE_LEFT_KEY_CODES)) this.x -= this.velocity;
    if (this.shouldMove(MOVE_RIGHT_KEY_CODES)) this.x += this.velocity;
  }

  // метод кот. будет принимать массив с кодом клавиш и отвечать тру если нажата хоть одна из переданных клавиш
  shouldMove(keys) {
    // с помошью some мы будем проверять есть ли клавиша в обьекте keyMap
    return keys.some(key => this.keyMap.get(key));
  }
}


import { cosBetweenTwoPoints, sinBetweenTwoPoints } from "./utilites.js";
import Particle from "./Particle.js";


export default class Enemy {
  constructor(canvasWidth, canvasHeight, context, player) {
    this.context = context;
    this.player = player;

    this.radius = 15;
    this.enemyType = Math.random() > 0.8 ? 2 : 1; // новый тим врага со значением "2"
    this.health = this.enemyType;

    // далее нам нужно задать начальное значение X и Y откуда будет появляться враг. Зададим чтобы враг появлялся случайным образом и 4х сторон, пусть в половине случаев враг появляется слева или справа, для этого пишем Math.random() < 0.5
    if (Math.random() < 0.5) {
      // Math.random() дает случайное число от 0 до 1 и наше выражение будет верно в 50%-случаях.
      // теперь напишем код для появление врага слева или справа, тут нам тоже понадобится Math.random(), чтобы в 50%-случаях враг появлялся слева в остальных случаях появлялся справа:
      this.x = Math.random() < 0.5 ? 0 - this.radius : canvasWidth + this.radius;
      this.y = Math.random() * canvasHeight;
    } else {
      // теперь нам нужно написать код для отображения врага сверху либо снизу
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() < 0.5 ? this.radius : canvasHeight + this.radius;
    }


    this.image = new Image();
    this.image.src = `./img/enemy_${this.enemyType}.png`;
    this.imageWidth = 50;
    this.imageHeight = 60;
    this.imageTick = 0;
  }

  drawImg() {
    const imageTickLimit = 18;
    const subX = this.imageTick > imageTickLimit ? this.imageWidth : 0;
    this.imageTick++;
    if (this.imageTick > imageTickLimit * 2) this.imageTick = 0;


    this.context.drawImage(
      this.image,
      subX,
      0,
      this.imageWidth,
      this.imageHeight,
      this.x - this.imageWidth / 2,
      this.y - this.imageHeight / 2,
      this.imageWidth,
      this.imageHeight
    );
  }


  draw() {
    // в этот раз вместо позиции курсора мы будем использовать позицию нашего персонажа все остальное будет точно такое же
    this.context.save();
    let angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
    this.context.translate(this.x, this.y);
    this.context.rotate(angle + Math.PI / 2);
    this.context.translate(-this.x, -this.y);
    this.drawImg();
    this.context.restore();
  }

  update() {
    this.draw();
    this.velocity = {
      x: cosBetweenTwoPoints(this.player.x, this.player.y, this.x, this.y) * 2,
      y: sinBetweenTwoPoints(this.player.x, this.player.y, this.x, this.y) * 2,
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }


  createExplosion(particles) {
    // будет с помошью цикла фор создавать 50 частиц взрыва
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(
        this.x,
        this.y,
        this.context,

      ))
    }
  }
}
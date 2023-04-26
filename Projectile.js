import { cosBetweenTwoPoints, sinBetweenTwoPoints } from "./utilites.js";

export default class Projectile {
  constructor(x, y, targetX, targetY, context) {
    this.x = x;
    this.y = y;
    this.context = context;

    this.radius = 3; // чтобы снаряд был круглым
    this.color = '#810000'; // цвет снаряда
    this.velocity = { // скорость снаряда. Будет обьект со значениями смешения по x и по y

      // пусть скорость нашего снаряда будет 15px в любую сторону, тогда смешение по x будет ровно косинусу угла между 2 точками умноженому на 15, а смешение по y будет ровно синусу угла между 2 точками умноженному на 15 (2 точки это начало выстрела x, y и точка клика targetX, targetY)
      x: cosBetweenTwoPoints(targetX, targetY, x, y) * 15,
      y: sinBetweenTwoPoints(targetX, targetY, x, y) * 15
    }
  }


  // добавим метод drow кот. будет рисовать наш снаряд
  drow() {
    // нам нужно нариосвать кружок и закрасить его. Сперва beginPath чтобы дальше нарисовать кружок потом Context.arc и в качестве аргументов передаем центр кружка x, y радиус кружка и углы начало и конца отрисовки кружка
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.context.fillStyle = this.color; // задаем цвет кружка
    this.context.fill(); // и с помошью fill закрашиваем кружок
  }

  update() {
    this.drow(); // вызываем метод для отрисовки кружка

    // дальше будет увеличивать X и Y на значении скорости velocity X и Y 
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
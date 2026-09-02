import { AnimatedSprite, Texture } from "pixi.js";

export class Boss {
  sprite: AnimatedSprite;
  state: "fly" | "attack" = "fly";
  animations: Record<"fly" | "attack", Texture[]>;

  // Native Boss Stats Tracking
  level: number = 1;
  hp: number = 600;
  maxHp: number = 600;
  attackCooldown: number = 0;

  constructor() {
    const flyFrames = [
      Texture.from("assets/sprites/boss/flying1.png"),
      Texture.from("assets/sprites/boss/flying2.png")
    ];

    const attackFrames = [
      Texture.from("assets/sprites/boss/attack1.png"),
      Texture.from("assets/sprites/boss/attack2.png")
    ];

    this.animations = { fly: flyFrames, attack: attackFrames };

    this.sprite = new AnimatedSprite(flyFrames);
    this.sprite.anchor.set(0.5);
    this.sprite.animationSpeed = 0.15;
    this.sprite.play();
  }

  setState(newState: "fly" | "attack") {
    if (this.state === newState) return;
    this.state = newState;
    this.sprite.textures = this.animations[newState];
    this.sprite.play();
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setScale(scale: number) {
    this.sprite.scale.set(scale);
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
  }

  respawn() {
    this.level++;
    this.maxHp = Math.floor(this.maxHp * 1.3);
    this.hp = this.maxHp;
    this.sprite.alpha = 1.0;
    this.setState("fly");
  }
}

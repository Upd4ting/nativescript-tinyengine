import {World as W, Entity as E, Component as C, Shape as Sh, CircleShape as CiS, CubeShape as CuS, ImageShape as Is, Vector2 as Vec, OBB as box} from "./tinyengine.common";

export class World extends W {
    
}

export class Entity extends E {

}

export enum CollisionResponse {
    NONE,
    COLLIDE
}

export interface Component extends C {

}

export interface Shape extends Sh {

}

export class CircleShape extends CiS {

}

export class CubeShape extends CuS {

}

export class ImageShape extends Is {

}

export class Vector2 extends Vec {

}

export class OBB extends box {
    
}
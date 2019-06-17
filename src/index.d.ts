import { Image } from "tns-core-modules/ui/image";
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";
export declare class World {
    private container;
    private width;
    private height;
    private gravity;
    private entities;
    private previous;
    constructor(container: LayoutBase, width: number, height: number);
    getContainer(): LayoutBase;
    getWidth(): number;
    getHeight(): number;
    getGravity(): Vector2;
    setGravity(gravity: Vector2): void;
    destroy(): void;
    addEntity(entity: Entity): void;
    removeEntity(entity: Entity): void;
    tick(): void;
    isCollidingWithOther(entity: Entity): ResponseObject;
    private update;
    private render;
}
export declare class Entity {
    private static ids;
    private id;
    private world;
    private position;
    private velocity;
    private rotation;
    private shape;
    private obb;
    private cr;
    private components;
    private useGravity;
    private started;
    constructor(position: Vector2, velocity: Vector2, rotation: number, shape: Shape);
    getID(): number;
    getPosition(): Vector2;
    getVelocity(): Vector2;
    getRotation(): number;
    getWorld(): World;
    getShape(): Shape;
    getOBB(): OBB;
    getCollisionResponse(): CollisionResponse;
    isUsingGravity(): boolean;
    setPosition(position: Vector2): void;
    setVelocity(velocity: Vector2): void;
    setRotation(rotation: number): void;
    setWorld(world: World): void;
    setShape(shape: Shape): void;
    setOBB(obb: OBB): void;
    setCollisionResponse(cr: CollisionResponse): void;
    setUseGravity(useGravity: boolean): void;
    addComponent<T extends Component>(type: (new () => T)): T;
    removeComponent(className: string): void;
    update(deltaTime: number): void;
    private checkForCollision;
    render(): void;
    destroy(): void;
}
export declare enum CollisionResponse {
    NONE = 0,
    COLLIDE = 1
}
export declare type ResponseObject = {
    response: CollisionResponse;
    collided: Entity;
};
export interface Shape {
    init(entity: Entity): void;
    render(entity: Entity): void;
    getWidth(): number;
    getHeight(): number;
}
export declare class CubeShape implements Shape {
    private width;
    private height;
    private color;
    private img;
    constructor(width: number, height: number, color: string);
    getWidth(): number;
    getHeight(): number;
    getColor(): string;
    getImg(): Image;
    init(entity: Entity): void;
    render(entity: Entity): void;
}
export declare class CircleShape implements Shape {
    private radius;
    private color;
    private img;
    constructor(radius: number, color: string);
    getWidth(): number;
    getHeight(): number;
    getRadius(): number;
    getColor(): string;
    getImg(): Image;
    init(entity: Entity): void;
    render(entity: Entity): void;
}
export declare class ImageShape implements Shape {
    private width;
    private height;
    private src;
    private img;
    constructor(width: number, height: number, src: string);
    getWidth(): number;
    getHeight(): number;
    getSrc(): string;
    getImg(): Image;
    init(entity: Entity): void;
    render(entity: Entity): void;
}
export interface Component {
    onStart(entity: Entity): void;
    onUpdate(entity: Entity, deltatTime: number): void;
    onCollide(collider: Entity, collided: Entity): void;
    onDestroy(entity: Entity): void;
    getClassName(): string;
}
export declare class Vector2 {
    private c;
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    getX(): number;
    getY(): number;
    get(i: number): number;
    getCoordinates(): Array<number>;
    setX(x: number): Vector2;
    setY(y: number): Vector2;
    set(x: number, y: number): Vector2;
    add(v: Vector2): Vector2;
    add(x: number, y: number): Vector2;
    subtract(v: Vector2): Vector2;
    subtract(x: number, y: number): Vector2;
    multiply(v: Vector2): Vector2;
    multiply(x: number, y: number): Vector2;
    divide(v: Vector2): Vector2;
    divide(x: number, y: number): Vector2;
    scale(n: number): Vector2;
    negate(): Vector2;
    normalize(): Vector2;
    getLength(): number;
    getSquaredLength(): number;
    copy(): Vector2;
    equals(v: Vector2): boolean;
    tostring(): string;
    static dot(v1: Vector2, v2: Vector2): number;
    static cross(v1: Vector2, v2: Vector2): number;
    static distance(v1: Vector2, v2: Vector2): number;
    static readonly ZERO: Vector2;
    static readonly ONE: Vector2;
    static readonly RIGHT: Vector2;
    static readonly LEFT: Vector2;
    static readonly UP: Vector2;
    static readonly DOWN: Vector2;
}
export declare class OBB {
    private points;
    private axis;
    private center;
    private extend;
    constructor(minX: number, minY: number, maxX: number, maxY: number, orientation: number);
    getPoints(): Vector2[];
    getAxis(): Vector2[];
    getCenter(): Vector2;
    getExtend(): Vector2;
    setPoints(points: Vector2[]): void;
    setAxis(axis: Vector2[]): void;
    setCenter(center: Vector2): void;
    setExtend(extend: Vector2): void;
    update(minX: number, minY: number, maxX: number, maxY: number, orientation: number): void;
    overlap(obb: OBB): boolean;
}

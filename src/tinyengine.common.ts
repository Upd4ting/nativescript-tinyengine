import { Observable } from 'tns-core-modules/data/observable';
import * as app from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { Image } from "tns-core-modules/ui/image";
import { View } from "tns-core-modules/ui/core/view";
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";
import { TextBase } from "tns-core-modules/ui/text-base";
import { Color } from "tns-core-modules/color";

export class World {

    private container: LayoutBase;
    private width: number;
    private height: number;
    private entities: Entity[];
    private inputHandler: Function;
    private previous: number;

    public constructor(container: LayoutBase, width: number, height: number) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.entities = [];
        this.inputHandler = null;
    }

    // Getter & setter

    public getContainer(): LayoutBase {
        return this.container;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    // Functions

    public destroy(): void {
        for (let entity of this.entities) {
            entity.destroy();
        }
    }

    public addEntity(entity: Entity): void {
        entity.setWorld(this);
        this.entities.push(entity);
    }

    public removeEntity(entity: Entity): void {
        this.entities = this.entities.filter(function (item) {
            return item != entity;
        });
    }

    public tick(): void {
        if (!this.previous) {
            this.previous = new Date().getTime();
        }

        let current: number = new Date().getTime();
        let elapsed: number = current - this.previous;

        // Handle input
        if (this.inputHandler) {
            this.inputHandler(this);
        }

        // Update
        this.update(elapsed);

        // Render
        this.render();

        this.previous = current;
    }

    public isCollidingWithOther(entity: Entity): ResponseObject {
        let response = CollisionResponse.NONE;
        let collided: Entity = null;

        for (let ent of this.entities) {
            if (entity.getID() == ent.getID()) {
                continue;
            }

            if (entity.getOBB().overlap(ent.getOBB())) {
                collided = ent;
                response = ent.getCollisionResponse();
                break;
            }
        }     

        return {response: response, collided: collided};
    }

    private update(deltaTime: number): void {
        for (let entity of this.entities) {
            entity.update(deltaTime);
        }
    }

    private render(): void {
        for (let entity of this.entities) {
            entity.render();
        }
    }
}

export class Entity {
    private static ids: number = 0;

    private id: number;
    private world: World;
    private position: Vector2;
    private velocity: Vector2;
    private rotation: number;
    private shape: Shape;
    private obb: OBB;
    private cr: CollisionResponse;
    private components: Component[];
    private started: boolean;

    public constructor(position: Vector2, velocity: Vector2, rotation: number, shape: Shape) {
        this.id = Entity.ids++;
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.shape = shape;
        this.obb = new OBB(position.getX(), position.getY(), position.getX() + shape.getWidth(), position.getY() + shape.getHeight(), rotation);
        this.cr = CollisionResponse.NONE;
        this.components = [];
        this.started = false;
    }

    // Setter & getter

    public getID(): number {
        return this.id;
    }

    public getPosition(): Vector2 {
        return this.position;
    }

    public getVelocity(): Vector2 {
        return this.velocity;
    }

    public getRotation(): number {
        return this.rotation;
    }

    public getWorld(): World {
        return this.world;
    }

    public getShape(): Shape {
        return this.shape;
    }

    public getOBB(): OBB {
        return this.obb;
    }

    public getCollisionResponse(): CollisionResponse {
        return this.cr;
    }

    public setPosition(position: Vector2): void {
        this.position = position;
    }

    public setVelocity(velocity: Vector2): void {
        this.velocity = velocity;
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation;
    }

    public setWorld(world: World): void {
        this.world = world;
    }

    public setShape(shape: Shape): void {
        this.shape = shape;
    }

    public setOBB(obb: OBB): void {
        this.obb = obb;
    }

    public setCollisionResponse(cr: CollisionResponse): void {
        this.cr = cr;
    }

    // Functions

    public addComponent<T extends Component>(type: (new () => T)): T {
        let component = new type();

        // If entity already started
        if (this.started) {
            component.onStart(this);
        }

        this.components.push(component);

        return component;
    }

    public removeComponent(className: string): void {
        this.components = this.components.filter(function (item) {
            return item.getClassName() !== className;
        });
    }

    public update(deltaTime: number): void {
        let needStart: boolean = false;

        if (!this.started) {
            this.started = true;
            needStart = true;

            // Init shape
            this.shape.init(this);
        }

        for (let component of this.components) {
            if (needStart) {
                component.onStart(this);
            }
            component.onUpdate(this, deltaTime);
        }

        let savedPos = this.position.copy();

        // Update position & obb
        this.position.add(this.velocity.copy().multiply(deltaTime, deltaTime));
        this.obb.update(this.position.getX(), this.position.getY(), this.position.getX() + this.shape.getWidth(), this.position.getY() + this.shape.getHeight(), this.rotation);

        this.checkForCollision(savedPos);
    }

    private checkForCollision(savedPos): void {
        let objectResponse = this.world.isCollidingWithOther(this);

        // If collision revert
        if (objectResponse.response == CollisionResponse.COLLIDE) {
            this.position = savedPos;
            this.obb.update(this.position.getX(), this.position.getY(), this.position.getX() + this.shape.getWidth(), this.position.getY() + this.shape.getHeight(), this.rotation);
        }

        // Call components event
        if (objectResponse.collided) {
            for (let component of this.components) {
                component.onCollide(this, objectResponse.collided);
            }
        }
    }

    public render(): void {
        this.shape.render(this);
    }

    public destroy(): void {
        for (let component of this.components) {
            component.onDestroy(this);
        }

        this.world.removeEntity(this);
    }
}

export enum CollisionResponse {
    NONE,
    COLLIDE
}

export type ResponseObject = {
    response: CollisionResponse;
    collided: Entity;
}

export interface Shape {
    init(entity: Entity): void;
    render(entity: Entity): void;
    getWidth(): number;
    getHeight(): number;
}

export class CubeShape implements Shape {

    private width: number;
    private height: number;
    private color: string;
    private img: Image;

    constructor(width: number, height: number, color: string) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.img = new Image();
    }

    // Getter and setter

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getColor(): string {
        return this.color;
    }

    public getImg(): Image {
        return this.img;
    }

    // Functions

    public init(entity: Entity): void {
        this.img.backgroundColor = new Color(this.color);
        this.img.width = this.width;
        this.img.height = this.height;
        entity.getWorld().getContainer().addChild(this.img);
    }

    public render(entity: Entity): void {
        this.img.translateX = entity.getPosition().getX() - Math.abs(entity.getWorld().getWidth() / 2) + Math.abs(this.width / 2);
        this.img.translateY = entity.getPosition().getY() - Math.abs(entity.getWorld().getHeight() / 2) + Math.abs(this.height / 2);
        this.img.rotate = entity.getRotation();
    }
}

export class CircleShape implements Shape {

    private radius: number;
    private color: string;
    private img: Image;

    constructor(radius: number, color: string) {
        this.radius = radius;
        this.color = color;
        this.img = new Image();
    }

    // Getter and setter

    public getWidth(): number {
        return this.radius * 2;
    }

    public getHeight(): number {
        return this.radius * 2;
    }

    public getRadius(): number {
        return this.radius;
    }

    public getColor(): string {
        return this.color;
    }

    public getImg(): Image {
        return this.img;
    }

    // Functions

    public init(entity: Entity): void {
        this.img.stretch = "none";
        this.img.borderRadius = this.radius.toString();
        this.img.backgroundColor = new Color(this.color);
        this.img.width = this.radius * 2;
        this.img.height = this.radius * 2;
        entity.getWorld().getContainer().addChild(this.img);
    }

    public render(entity: Entity): void {
        this.img.translateX = entity.getPosition().getX() - Math.abs(entity.getWorld().getWidth() / 2) + Math.abs(this.radius);
        this.img.translateY = entity.getPosition().getY() - Math.abs(entity.getWorld().getHeight() / 2) + Math.abs(this.radius);
        this.img.rotate = entity.getRotation();
    }
}

export class ImageShape implements Shape {

    private width: number;
    private height: number;
    private src: string;
    private img: Image;

    constructor(width: number, height: number, src: string) {
        this.width = width;
        this.height = height;
        this.src = src;
        this.img = new Image();
    }

    // Getter and setter

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getSrc(): string {
        return this.src;
    }

    public getImg(): Image {
        return this.img;
    }

    // Functions

    public init(entity: Entity): void {
        this.img.src = this.src;
        this.img.width = this.width;
        this.img.height = this.height;
        this.img.stretch = 'fill';
        entity.getWorld().getContainer().addChild(this.img);
    }

    public render(entity: Entity): void {
        this.img.translateX = entity.getPosition().getX() - Math.abs(entity.getWorld().getWidth() / 2) + Math.abs(this.width / 2);
        this.img.translateY = entity.getPosition().getY() - Math.abs(entity.getWorld().getHeight() / 2) + Math.abs(this.height / 2);
        this.img.rotate = entity.getRotation();
    }
}

export interface Component {
    onStart(entity: Entity): void;
    onUpdate(entity: Entity, deltatTime: number): void;
    onCollide(collider: Entity, collided: Entity): void;
    onDestroy(entity: Entity): void;
    getClassName(): string;
}

export class Vector2 {

    private c: Array<number> = [0,0];

    public constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    // Getter & setter

    public get x(): number {
        return this.c[0];
    }

    public get y(): number {
        return this.c[1];
    }

    public set x(x: number) {
        this.c[0] = x;
    }

    public set y(y: number) {
        this.c[1] = y;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public get(i: number): number {
        return this.c[i];
    }

    public getCoordinates(): Array<number> {
        return this.c;
    }

    public setX(x: number): Vector2 {
        this.x = x;
        return this;
    }

    public setY(y: number): Vector2 {
        this.y = y;
        return this;
    }

    public set(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }

    // Functions

    public add(v: Vector2): Vector2;
    public add(x: number, y: number): Vector2;
    add() {
        if (arguments[0] instanceof Vector2) {
            this.x += arguments[0].x;
            this.y += arguments[0].y;
        } else {
            this.x += arguments[0];
            this.y += arguments[1];
        }
        return this;
    }

    public subtract(v: Vector2): Vector2;
    public subtract(x: number, y: number): Vector2;
    subtract() {
        if (arguments[0] instanceof Vector2) {
            this.x -= arguments[0].x;
            this.y -= arguments[0].y;
        } else {
            this.x -= arguments[0];
            this.y -= arguments[1];
        }
        return this;
    }

    public multiply(v: Vector2): Vector2;
    public multiply(x: number, y: number): Vector2;
    multiply() {
        if (arguments[0] instanceof Vector2) {
            this.x *= arguments[0].x;
            this.y *= arguments[0].y;
        } else {
            this.x *= arguments[0];
            this.y *= arguments[1];
        }
        return this;
    }

    public divide(v: Vector2): Vector2;
    public divide(x: number, y: number): Vector2;
    divide() {
        if (arguments[0] instanceof Vector2) {
            this.x /= arguments[0].x;
            this.y /= arguments[0].y;
        } else {
            this.x /= arguments[0];
            this.y /= arguments[1];
        }
        return this;
    }

    public scale(n: number): Vector2 {
        this.x *= n;
        this.y *= n;
        return this;
    }

    public negate(): Vector2 {
        return this.scale(-1);
    }

    public normalize(): Vector2 {
        var length = this.getLength();

        if (length === 0) {
            return this.set(0,0);
        }

        return this.scale(1.0 / length);
    }

    public getLength(): number {
        return Math.sqrt(this.getSquaredLength());
    }

    public getSquaredLength(): number {
        return this.x * this.x + this.y * this.y;
    }

    public copy(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public equals(v: Vector2): boolean {
        return v.x == this.x && v.y == this.y;
    }

    public tostring(): string {
        return "[" + this.x + ", " + this.y + "]";
    }

    // Static functions

    public static dot(v1: Vector2, v2: Vector2): number {
        return (v1.x * v2.x + v1.y * v2.y);
    }

    public static cross(v1: Vector2, v2: Vector2): number{
        return (v1.x * v2.y - v1.y * v2.x);
    }

    public static distance(v1: Vector2, v2: Vector2): number{
        var x = v2.x - v1.x;
        var y = v2.y - v1.y;
        return Math.sqrt(x * x + y * y);
    }

    // Static variables

    public static get ZERO(): Vector2 {
        return new Vector2(0, 0);
    }

    public static get ONE(): Vector2 {
        return new Vector2(1, 1);
    }

    public static get RIGHT(): Vector2 {
        return new Vector2(1, 0);
    }

    public static get LEFT(): Vector2 {
        return new Vector2(-1, 0);
    }

    public static get UP(): Vector2 {
        return new Vector2(0, 1);
    }

    public static get DOWN(): Vector2 {
        return new Vector2(0,-1);
    }
}

export class OBB {
    private points: Vector2[];
    private axis: Vector2[];
    private center: Vector2;
    private extend: Vector2;

    public constructor(minX: number, minY: number, maxX: number, maxY: number, orientation: number) {
        this.update(minX, minY, maxX, maxY, orientation);
    }

    // Getter and setter
    
    public getPoints(): Vector2[] {
        return this.points;
    }

    public getAxis(): Vector2[] {
        return this.axis;
    }

    public getCenter(): Vector2 {
        return this.center;
    }

    public getExtend(): Vector2 {
        return this.extend;
    }

    public setPoints(points: Vector2[]): void {
        this.points = points;
    }

    public setAxis(axis: Vector2[]): void {
        this.axis = axis;
    }

    public setCenter(center: Vector2): void {
        this.center = center;
    }

    public setExtend(extend: Vector2): void {
        this.extend = extend;
    }

    // Functions

    public update(minX: number, minY: number, maxX: number, maxY: number, orientation: number) {
        this.center = new Vector2((maxX + minX) * 0.5, (maxY + minY) * 0.5);
        this.extend = new Vector2(Math.abs(maxX - minX) * 0.5, Math.abs(maxY - minY) * 0.5);

        let a = new Vector2(minX, minY);
        let b = new Vector2(minX, maxY);
        let c = new Vector2(maxX, maxY);
        let d = new Vector2(maxX, minY);

        let radAngle = orientation * (Math.PI / 180);

        // Now apply rotation on these points
        a = new Vector2(this.center.getX() + (a.getX() - this.center.getX()) * Math.cos(radAngle) - (a.getY() - this.center.getY()) * Math.sin(radAngle), this.center.getY() + (a.getX() - this.center.getX()) * Math.sin(radAngle) + (a.getY() - this.center.getY()) * Math.cos(radAngle));
        b = new Vector2(this.center.getX() + (b.getX() - this.center.getX()) * Math.cos(radAngle) - (b.getY() - this.center.getY()) * Math.sin(radAngle), this.center.getY() + (b.getX() - this.center.getX()) * Math.sin(radAngle) + (b.getY() - this.center.getY()) * Math.cos(radAngle));
        c = new Vector2(this.center.getX() + (c.getX() - this.center.getX()) * Math.cos(radAngle) - (c.getY() - this.center.getY()) * Math.sin(radAngle), this.center.getY() + (c.getX() - this.center.getX()) * Math.sin(radAngle) + (c.getY() - this.center.getY()) * Math.cos(radAngle));
        d = new Vector2(this.center.getX() + (d.getX() - this.center.getX()) * Math.cos(radAngle) - (d.getY() - this.center.getY()) * Math.sin(radAngle), this.center.getY() + (d.getX() - this.center.getX()) * Math.sin(radAngle) + (d.getY() - this.center.getY()) * Math.cos(radAngle));

        // Add to points
        this.points = [a, b, c, d];

        // Generate axis
        let axA = b.copy().subtract(a);
        let axB = c.copy().subtract(b);
        let axC = d.copy().subtract(c);
        let axD = a.copy().subtract(d);

        this.axis = [axA, axB, axC, axD];
        
    }

    public overlap(obb: OBB): boolean {
        let processAxis = function (axises, currentObb) {
            for (let axis of axises) {
                let min1 = 999999999999,
                    min2 = 999999999999,
                    max1 = -999999999999,
                    max2 = -999999999999;


                for (let point of currentObb.getPoints()) {
                    let dotval = Vector2.dot(point, axis);
                    if (dotval < min1) min1 = dotval;
                    if (dotval > max1) max1 = dotval;
                }

                for (let point of obb.getPoints()) {
                    let dotval = Vector2.dot(point, axis);
                    if (dotval < min2) min2 = dotval;
                    if (dotval > max2) max2 = dotval;
                }

                if ((min1 > min2 || min2 > max1) && (min2 > min1 || min1 > max2)) {
                    return false;
                }
            }

            return true;
        };

        // Process axis of first obb
        if (!processAxis(this.getAxis(), this))
            return false;

        // Process axis of second obb
        if (!processAxis(obb.getAxis(), this))
            return false;

        return true;
    }
}
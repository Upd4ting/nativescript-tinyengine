import { World, Entity, Vector2, OBB, CollisionResponse, Shape, Component, CircleShape, CubeShape, ImageShape } from 'nativescript-tinyengine';
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { HomeViewModel } from "./home-view-model";
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";

export class SnakePositionComponent implements Component {

    public onStart(entity: Entity): void {
        
    }

    public onUpdate(entity: Entity): void {
        let world = entity.getWorld();

        let eWidth = entity.getShape().getWidth();
        let eHeight = entity.getShape().getHeight();

        if (entity.getPosition().getX() < -eWidth) {
            entity.getPosition().setX(world.getWidth() + eWidth);
        } else if (entity.getPosition().getX() > world.getWidth() + eWidth) {
            entity.getPosition().setX(-eWidth);
        }

        if (entity.getPosition().getY() < -eHeight) {
            entity.getPosition().setY(world.getHeight() + eHeight);
        } else if (entity.getPosition().getY() > world.getHeight() + eHeight) {
            entity.getPosition().setY(-eHeight);
        }
    }

    public onCollide(collider: Entity, collided: Entity) {
    }

    public onDestroy(entity: Entity): void {

    }

    public getClassName(): string {
        return "SnakePositionComponent";
    }
}

export class CollideComponent implements Component {
    public onStart(entity: Entity): void {
    }

    public onUpdate(entity: Entity): void {
        entity.setRotation(entity.getRotation() + 3);
    }

    public onCollide(collider: Entity, collided: Entity) {
        collided.getVelocity().setX(collider.getVelocity().getX());
        collided.getVelocity().setY(collider.getVelocity().getY());

        collider.getVelocity().setX(-collider.getVelocity().getX());
        collider.getVelocity().setY(-collider.getVelocity().getY());
    }

    public onDestroy(entity: Entity): void {

    }

    public getClassName(): string {
        return "CollideComponent";
    }
}

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;

    page.bindingContext = new HomeViewModel();

    let container: LayoutBase = page.getViewById("container");

	let world: World = new World(container, 300, 300);
	world.setGravity(new Vector2(0, 0.1));

    let cubeEntity: Entity = new Entity(new Vector2(0, 50), new Vector2(0.1, 0), 45, new CubeShape(20, 20, '#FFFFFF'));
    cubeEntity.addComponent(SnakePositionComponent);
    cubeEntity.addComponent(CollideComponent);
    world.addEntity(cubeEntity);

    let wallEntity: Entity = new Entity(new Vector2(240, 10), new Vector2(0, 0), 0, new CubeShape(20, 80, '#DDDDDD'));
    wallEntity.setCollisionResponse(CollisionResponse.COLLIDE);
	wallEntity.addComponent(SnakePositionComponent);
	wallEntity.setUseGravity(false);
    world.addEntity(wallEntity);

    setInterval(function () { world.tick(); }, 20);
}
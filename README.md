# Tiny Engine

[![npm](https://img.shields.io/npm/v/nativescript-tinyengine.svg)](https://github.com/Upd4ting/nativescript-tinyengine) [![npm license](https://img.shields.io/npm/l/nativescript-tinyengine.svg)](https://github.com/Upd4ting/nativescript-tinyengine)

A little 2d game engine for nativescript.

## Installation

```javascript
tns plugin add nativescript-tinyengine
```

## Screenshots

![Screenshot](https://i.gyazo.com/6a5f01f95c2bdbbeb4dd80e848443c0a.gif)

## Usage 

First in your `XML` you need to add a `GridLayout`

```xml
<GridLayout id="container" width="300" height="300" backgroundColor="lightgreen">
        
</GridLayout>
```

then in your `typescript` file import everything required

```typescript
import { World, Entity, Vector2, OBB, CollisionResponse, Shape, Component, CircleShape, CubeShape, ImageShape } from 'nativescript-tinyengine';
```

now you just need to instantiate a World object on your GridLayout and start using this library. Here is a basic code.

```typescript
let container: LayoutBase = page.getViewById("container");

let world: World = new World(container, 300, 300);

let cubeEntity: Entity = new Entity(new Vector2(0, 50), new Vector2(0, 0), 45, new CubeShape(20, 20, '#FFFFFF'));
world.addEntity(cubeEntity);

setInterval(function () { world.tick(); }, 20);
```

## Documentation

You can find the documentation of the library [here](https://upd4ting.github.io/nativescript-tinyengine/)

## Components / Collisions

`Component` is an interface that you can implements. This interface has the following methods: 

-	`onStart(entity: Entity)` Called before the first frame update of the attached entity.
-	`onUpdate(entity: Entity, deltatTime: number)` Called at each frame update of the attached entity.
-	`onCollide(collider: Entity, collided: Entity)` Called when the attached entity collide with an other entity.
-	`onDestroy(entity: Entity)` Called when the attached entity is destroyed.
-	`getClassName(): string` You need to return your class name in this method.

Components can be attached throught the `addComponent<T extends Component>(type: (new () => T))` of the Entity class.

Each entity got a property `collisionResponse` which can be set to `NONE` or `COLLIDE`. That's how are handled collision. If you want to have something custom, put the collision response to `NONE` and do your custom logic into `onCollide(collider: Entity, collided: Entity)` of a component.
    
## License

Apache License Version 2.0, May 2019

export class MarsRover {
    private static map = {
      f: (position: { forward: () => string }) => position.forward(),
      b: (position: { backward: () => string }) => position.backward(),
      l: (position: { turnLeft: () => string }) => position.turnLeft(),
      r: (position: { turnRight: () => string }) => position.turnRight(),
    }
    private position: Position
  
    constructor(position: Position) {
      this.position = position
    }
  
    public move(commands:string) {
      commands.split('').map((command) => {
        try {
          MarsRover.map[command](this.position)
        } catch (e) {
          throw Error(`Invalid command '${command}'`)
        }
      })
    }
  }
  
  export class Direction {
    private static map = {
      N: {left:'W', right: 'E', forward: {x: 0, y: 1}, backward: {x: 0, y: -1}},
      W: {left: 'S', right: 'N', forward: {x: -1, y: 0}, backward: {x: 1, y: 0}},
      S: {left: 'E', right: 'W', forward: {x: 0, y: -1}, backward: {x: 0, y: 1}},
      E: {left: 'N', right: 'S', forward: {x: 1, y: 0}, backward: {x: -1, y: 0}}
    }
    public facing: string
  
    constructor(facing: string) {
      this.facing = facing
    }
  
    public left() {
      return new Direction(Direction.map[this.facing].left)
    }
  
    public right() {
      return new Direction(Direction.map[this.facing].right)
    }
  
    public forward() {
      return Direction.map[this.facing].forward
    }
  
    public backward() {
      return Direction.map[this.facing].backward
    }
  }
  
  export class Point {
    public x: number
    public y: number
  
    constructor(x: number, y: number) {
      this.x = x
      this.y = y
    }
  
    public sum(other: Point) {
      return new Point(this.x + other.x, this.y + other.y)
    }
  }
  
  export class Position {
    public static at(x: number, y: number) {
      return {
        withinWorld(world: World) {
          return {
            facing(directionRaw: string) {
              const direction = new Direction(directionRaw)
              return new Position(x, y, direction, world)
            }
          }
        }
      }
    }
  
    private direction: Direction
    private point: Point
    private world: World
  
    private constructor(x: number, y: number, direction: Direction, world: World) {
      this.point = new Point(x, y)
      this.direction = direction
      this.world = world
    }
  
    public turnLeft() {
      this.direction = this.direction.left()
    }
  
    public turnRight() {
      this.direction = this.direction.right()
    }
  
    public forward() {
      this.sumVector(this.direction.forward())
    }
  
    public backward() {
      this.sumVector(this.direction.backward())
    }
  
    private sumVector(vector: Point) {
      this.point = this.world.move(this.point, vector)
    }
  
  }
  
  export abstract class World {
    public static unlimited(): World {
      return new UnlimitedWorld()
    }
  
    public static wrapping(width: number, height: number) {
      return new WrappingWorld(width, height)
    }
  
    public abstract move(origin: Point, vector: Point): Point
  }
  
  export abstract class ObstaclesInWorld {
    public static none(world: World): World {
      return world
    }
  
    public static with(world: World, obstacles: Point[]): World {
      return new WorldWithObstacles(world, obstacles)
    }
  }
  
  class WorldWithObstacles implements World {
    private obstacles: Point[]
    private world: World
  
    constructor(world: World, obstacles: Point[]) {
      this.world = world
      this.obstacles = obstacles
    }
  
    public move(origin: Point, vector: Point): Point {
      const newValue = origin.sum(vector)
      const obstacleFound = this.obstacles.some((e: Point) => e.x === newValue.x && e.y === newValue.y)
      if (obstacleFound) {
        return origin
      }
      return this.world.move(origin, vector)
    }
  }
  
  class WrappingWorld implements World {
    private height: number
    private width: number
  
    constructor(width: number, height: number) {
      this.height = height
      this.width = width
    }
  
    public move(origin: Point, vector: Point): Point {
      const point = origin.sum(vector)
      return new Point((point.x + this.width) % this.width, (point.y + this.height) % this.height)
    }
  }
  
  class UnlimitedWorld implements World {
    public move(origin: Point, vector: Point): Point {
      return origin.sum(vector)
    }
  }
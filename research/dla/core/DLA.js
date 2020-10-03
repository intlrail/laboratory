/** @module DLA */

import Defaults from './Defaults';
import Collisions from 'collisions';
import { toPath } from 'svg-points';
import { saveAs } from 'file-saver';

/** Structure for managing state and properties of all walkers, clusters, shapes, and the collision system. */
export default class DLA {
  /**
   * Create a new DLA object with reference to global P5 instance and any local sketch Settings
   * @param {object} p5 - Global p5.js instance passed from main sketch
   * @param {object} settings  - Object containing any override values passed from sketch to be merged with global Defaults
   */
  constructor(p5, settings) {
    this.p5 = p5;
    this.settings = Object.assign({}, Defaults, settings);

    // State flags
    this.paused = false;
    this.showWalkers = this.settings.ShowWalkers;
    this.showClusters = this.settings.ShowClusters;
    this.showShapes = this.settings.ShowShapes;
    this.useFrame = this.settings.UseFrame;
    this.renderMode = this.settings.RenderMode;

    // Number of active walkers
    this.numWalkers = 0;

    // Custom movement function for directed growth patterns
    this.customMovementFunction = undefined;

    // Outer edges of active sketch area (screen or confined "frame")
    this.edgeMargin = this.settings.EdgeMargin;
    this.edges = {};
    this.frame = {};

    if (typeof this.settings.FrameSize == 'number') {
      this.frame.left = window.innerWidth / 2 - this.settings.FrameSize / 2;
      this.frame.right = window.innerWidth / 2 + this.settings.FrameSize / 2;
      this.frame.top = window.innerHeight / 2 - this.settings.FrameSize / 2;
      this.frame.bottom = window.innerHeight / 2 + this.settings.FrameSize / 2;
    } else if (typeof this.settings.FrameSize == 'object') {
      this.frame.left = window.innerWidth / 2 - this.settings.FrameSize[0] / 2;
      this.frame.right = window.innerWidth / 2 + this.settings.FrameSize[0] / 2;
      this.frame.top = window.innerHeight / 2 - this.settings.FrameSize[1] / 2;
      this.frame.bottom = window.innerHeight / 2 + this.settings.FrameSize[1] / 2;
    }

    this.resetEdges();

    // Precalculate the largest possible distance of any particle to center for use in distance-based effects later
    this.maxDistance = this.p5.dist(this.edges.left, this.edges.top, window.innerWidth / 2, window.innerHeight / 2);

    // Collision system
    this.system = new Collisions();
    this.bodies = [];
    this.shapes = [];
    this.lines = [];
  }

  /** Run one "tick" of the simulation */
  iterate() {
    // Skip this iteration when the simulation is paused
    if (this.paused) {
      return;
    }

    // Replenish any walkers that stuck to the cluster(s) in the last iteration
    if (this.settings.ReplenishWalkers && this.numWalkers < this.settings.MaxWalkers) {
      this.createDefaultWalkers(this.settings.MaxWalkers - this.numWalkers, this.settings.ReplenishmentSource);
    }

    // Move all the walkers
    this.moveWalkers();

    // Update the collision system
    this.system.update();

    // Check for collisions and convert walkers to cluster particles as needed
    this.handleCollisions();

    // Remove any walkers that have been walking around for too long
    this.pruneWalkers();
  }


  /** Draw all objects based on current visibility flags and colors */
  draw() {
    if(this.settings.UseColors) {
      this.p5.background(this.getColorStringFromObject(this.settings.BackgroundColor));
    } else {
      this.p5.background(255);
    }

    // Draw all custom shapes
    if(this.showShapes) {
      for (let shape of this.shapes) {
        if(this.settings.UseColors) {
          this.p5.fill(this.getColorStringFromObject(this.settings.ShapeColor));
          this.p5.stroke(this.getColorStringFromObject(this.settings.ShapeColor));  
        } else {
          this.p5.noFill();
          this.p5.stroke(100);
        }
        
        this.p5.beginShape();

          for (let i = 0; i < shape._coords.length; i += 2) {
            this.p5.vertex(shape._coords[i], shape._coords[i + 1]);
          }

        this.p5.endShape();
      }
    }

    // Draw all walkers and clustered particles
    if(this.renderMode == 'Lines') {
      if(this.settings.UseColors) {
        this.p5.stroke(this.getColorStringFromObject(this.settings.LineColor));
      } else {
        this.p5.stroke(75);
      }

      if(this.lines.length > 0) {
        for(let line of this.lines) {
          this.p5.line(line.p1.x, line.p1.y, line.p2.x, line.p2.y);
        }
      }
    } else {
      for (let body of this.bodies) {
        // Points
        if (body._point) {
          this.p5.noFill();

          if (body.stuck && this.showClusters) {
            this.p5.noStroke();

            if(this.settings.UseColors) {
              this.p5.fill(this.getColorStringFromObject(this.settings.ClusterColor));
            } else {
              this.p5.fill(200);
            }

            this.p5.ellipse(body.x, body.y, 5);

          } else if (!body.stuck && this.showWalkers) {
            if(this.settings.UseColors) {
              this.p5.stroke(this.getColorStringFromObject(this.settings.WalkerColor));
            } else {
              this.p5.stroke(0)
            }
          } else {
            this.p5.noStroke();
          }

          this.p5.point(body.x, body.y);

        // Circles
        } else if (body._circle) {
          if(this.settings.UseStroke) {
            if(this.settings.UseColors) {
              this.p5.stroke(this.getColorStringFromObject(this.settings.BackgroundColor));
            } else {
              this.p5.stroke(255);
            }
          } else {
            this.p5.noStroke();
          }

          if (body.stuck && this.showClusters) {
            if(this.settings.UseColors) {
              this.p5.fill(this.getColorStringFromObject(this.settings.ClusterColor));
            } else {
              this.p5.fill(120);
            }
          } else if (!body.stuck && this.showWalkers) {
            if(this.settings.UseColors) {
              this.p5.fill(this.getColorStringFromObject(this.settings.WalkerColor));
            } else {
              this.p5.fill(230);
            }
          } else {
            this.p5.noFill();
          }

          this.p5.ellipse(body.x, body.y, body.radius * 2);

        // Polygons
        } else if (body._polygon) {
          if(this.settings.UseStroke) {
            if(this.settings.UseColors) {
              this.p5.stroke(this.getColorStringFromObject(this.settings.BackgroundColor));
            } else {
              this.p5.stroke(255);
            }
          } else {
            this.p5.noStroke();
          }

          if (body.stuck && this.showClusters) {
            if(this.settings.UseColors) {
              this.p5.fill(this.getColorStringFromObject(this.settings.ClusterColor));
            } else {
              this.p5.fill(120);
            }
          } else if (!body.stuck && this.showWalkers) {
            if(this.settings.UseColors) {
              this.p5.fill(this.getColorStringFromObject(this.settings.WalkerColor));
            } else {
              this.p5.fill(230);
            }
          } else {
            this.p5.noFill();
          }

          this.p5.beginShape();

            for (let i = 0; i < body._coords.length - 1; i += 2) {
              this.p5.vertex(body._coords[i], body._coords[i + 1]);
            }

          this.p5.endShape();
        }
      }
    }

    // Draw a square around the active area, if set
    if (this.useFrame) {
      this.drawFrame();
    }
  }

  /** Draw a rectangle to represent the frame (bounding box), if active */
  drawFrame() {
    this.p5.noFill();

    if(this.settings.UseColors) {
      this.p5.stroke(this.getColorStringFromObject(this.settings.FrameColor));
    } else {
      this.p5.stroke(0);
    }

    if (typeof this.settings.FrameSize == 'number') {
      this.p5.rect(
        window.innerWidth / 2 - this.settings.FrameSize / 2 - 1,
        window.innerHeight / 2 - this.settings.FrameSize / 2 - 1,
        this.settings.FrameSize + 2,
        this.settings.FrameSize + 2
      );
    } else if (typeof this.settings.FrameSize == 'object') {
      this.p5.rect(
        window.innerWidth / 2 - this.settings.FrameSize[0] / 2 - 1,
        window.innerHeight / 2 - this.settings.FrameSize[1] / 2 - 1,
        this.settings.FrameSize[0] + 2,
        this.settings.FrameSize[1] + 2
      )
    }
  }

  /** Recalculate the positions of the four edges of the simulation based on whether the frame is in use or not. */
  resetEdges() {
    this.edges.left = this.useFrame ? this.frame.left : 0;
    this.edges.right = this.useFrame ? this.frame.right : window.innerWidth;
    this.edges.top = this.useFrame ? this.frame.top : 0;
    this.edges.bottom = this.useFrame ? this.frame.bottom : window.innerHeight;
  }

  
  /** Apply Brownian motion and bias forces to all walkers to make them move a little bit. */
  moveWalkers() {
    if (this.bodies.length > 0) {
      for (let body of this.bodies) {
        if (!body.stuck) {
          // Start with a randomized movement (Brownian motion)
          let deltaX = this.p5.random(-1, 1),
            deltaY = this.p5.random(-1, 1),
            deltas;

          // Add in per-walker bias, if enabled
          if(this.settings.UsePerWalkerBias && body.hasOwnProperty('BiasTowards')) {
            deltas = this.getDeltasTowards(body.x, body.y, body.BiasTowards.x, body.BiasTowards.y);
            deltaX += deltas.x;
            deltaY += deltas.y;

          // Otherwise add in uniform bias to all walkers (if defined)
          } else {

            // Add in a bias towards a specific direction, if set
            switch (this.settings.BiasTowards) {
              case 'Top':
                deltaY -= this.settings.BiasForce;
                break;

              case 'Bottom':
                deltaY += this.settings.BiasForce;
                break;

              case 'Left':
                deltaX -= this.settings.BiasForce;
                break;

              case 'Right':
                deltaX += this.settings.BiasForce;
                break;

              case 'Center':
                deltas = this.getDeltasTowards(body.x, body.y, window.innerWidth / 2, window.innerHeight / 2);
                deltaX += deltas.x;
                deltaY += deltas.y;
                break;

              case 'Edges':
                deltas = this.getDeltasTowards(body.x, body.y, window.innerWidth / 2, window.innerHeight / 2);
                deltaX -= deltas.x;
                deltaY -= deltas.y;
                break;

              case 'Equator':
                if (body.y < window.innerHeight / 2) {
                  deltaY += this.settings.BiasForce;
                } else {
                  deltaY -= this.settings.BiasForce;
                }

                break;

              case 'Meridian':
                if (body.x < window.innerWidth / 2) {
                  deltaX += this.settings.BiasForce;
                } else {
                  deltaX -= this.settings.BiasForce;
                }

                break;

            }
          }

          // Apply custom movement function, if it has bee provided
          if(typeof this.customMovementFunction != undefined && this.customMovementFunction instanceof Function) {
            let deltas = this.customMovementFunction(body);
            deltaX += deltas.dx;
            deltaY += deltas.dy;
          }

          // Ensure only whole numbers for single-pixel particles so they are always "on lattice"
          if (body._point) {
            deltaX = Math.round(deltaX);
            deltaY = Math.round(deltaY);
          }

          // Apply deltas to walker
          body.x += deltaX;
          body.y += deltaY;

          // Increment age of the walker
          body.age++;
        }
      }
    }
  }

  /**
   * Calculates movement deltas for a given walker in order to move it towards a given point in space.
   * @param {number} bodyX - X coordinate of walker to move
   * @param {number} bodyY  - Y coordinate of walker to move
   * @param {number} targetX  - X coordinate of target we want to move the walker towards
   * @param {number} targetY  - YY coordinate of target we want to move the walker towards
   * @returns {Object} Object with properties x and y representing directional forces to apply to walker
   */
  getDeltasTowards(bodyX, bodyY, targetX, targetY) {
    let angle = Math.atan2(targetY - bodyY, targetX - bodyX);

    return {
      x: Math.cos(angle) * this.settings.BiasForce,
      y: Math.sin(angle) * this.settings.BiasForce
    }
  }

  /** Look for collisions between walkers and clustered elements, converting walkers to clustered particles as needed. */
  handleCollisions() {
    // Look for collisions between walkers and custom shapes
    for (let shape of this.shapes) {
      const potentials = shape.potentials();

      for (let secondBody of potentials) {
        if (shape.collides(secondBody)) {
          secondBody.stuck = true;
          this.numWalkers--;
        }
      }
    }

    // Look for collisions between walkers and clustered particles
    for (let body of this.bodies) {
      // Cut down on duplicate computations by only looking for collisions on walkers
      if (body.stuck) {
        continue;
      }

      // Look for broadphase collisions
      const potentials = body.potentials();

      for (let secondBody of potentials) {

        // Points should be checked for adjacency to a stuck particle 
        if (body._point) {
          if (secondBody.stuck) {
            body.stuck = true;
            this.numWalkers--;
          }

        // Circles and polygons should be checked for collision (overlap) with potentials
        } else {
          if (secondBody.stuck && body.collides(secondBody)) {
            body.stuck = true;
            this.numWalkers--;

            if(this.settings.CaptureLines) {
              this.lines.push({
                p1: { x: body.x, y: body.y },
                p2: { x: secondBody.x, y: secondBody.y }
              });
            }
          }
        }
      }
    }
  }

  /** Remove any walkers that are no longer "useful" in an effort to make the simulation more efficient. */
  pruneWalkers() {
    // Remove any walkers that have been wandering around for too long
    if(this.settings.PruneOldWalkers || this.settings.PruneDistantWalkers) {
      for(let [index, body] of this.bodies.entries()) {
        if(
          !body.stuck && 
          (
            (this.settings.PruneOldWalkers && body.age > this.settings.MaxAge) ||
            (this.settings.PruneDistantWalkers && this.p5.dist(body.x, body.y, body.originalX, body.originalY) > this.settings.MaxWanderDistance)
          )
        ) {
          body.remove();
          this.bodies.splice(index, 1);
          this.numWalkers--;
        }
      }
    }
  }


  /**
   * Creates a new body (walker or clustered particle) using the provided parameters in the collision system and stores it in a private array for manipulation later.
   * @param {object} params - Object of particle parameters such as X/Y coordinates, type, shape, and rotation
   */
  createParticle(params) {
    if (typeof params == 'undefined' || typeof params != 'object') {
      return;
    }

    let body;

    if (params.hasOwnProperty('type')) {
      switch (params.type) {
        case 'Point':
          body = this.system.createPoint(Math.round(params.x), Math.round(params.y));
          body._point = true;
          break;

        case 'Circle':
        default:
          body = this.system.createCircle(params.x, params.y, params.diameter / 2);
          body._circle = true;
          break;

        case 'Polygon':
          body = this.system.createPolygon(params.x, params.y, params.polygon, params.hasOwnProperty('rotation') ? this.p5.radians(params.rotation) : 0);
          body._polygon = true;
          break;
      }
    } else {
      const diameter = params.hasOwnProperty('diameter') ? params.diameter : this.settings.CircleDiameter;
      body = this.system.createCircle(params.x, params.y, diameter / 2);
      body._circle = true;
    }

    body.stuck = params.hasOwnProperty('stuck') ? params.stuck : false;
    body.age = 0;

    if(params.hasOwnProperty('BiasTowards')) {
      body.BiasTowards = params.BiasTowards;
    }

    body.originalX = body.x;
    body.originalY = body.y;

    this.bodies.push(body);
  }

  /**
   * Wrapper for createParticle() that increments internal count of walkers.
   * @param {Object} params - Object of particle parameters such as X/Y coordinates, type, shape, and rotation
   */
  createWalker(params) {
    this.createParticle(params);
    this.numWalkers++;
  }

  /**
   * Create a set of walkers in a specific area in the simulation (center, edges, randomly, etc).
   * @param {number} count - Number of walkers to create
   * @param {string} source - Location where walkers should be created.
   */
  createDefaultWalkers(count = this.settings.MaxWalkers, source = this.settings.WalkerSource) {
    for (let i = 0; i < count; i++) {
      let params = {};

      switch (source) {
        // Edges = spawn walkers at screen edges
        case 'Edges':
          let edge = Math.round(this.p5.random(1, 4));

          switch (edge) {
            case 1: // top
              params.x = this.p5.random(this.edges.left + this.edgeMargin, this.edges.right - this.edgeMargin);
              params.y = this.p5.random(this.edges.top, this.edges.top + this.edgeMargin);
              break;

            case 3: // bottom
              params.x = this.p5.random(this.edges.left + this.edgeMargin, this.edges.right - this.edgeMargin);
              params.y = this.p5.random(this.edges.bottom - this.edgeMargin, this.edges.bottom);
              break;

            case 4: // left
              params.x = this.p5.random(this.edges.left, this.edges.left + this.edgeMargin);
              params.y = this.p5.random(this.edges.top, this.edges.bottom);
              break;

            case 2: // right
              params.x = this.p5.random(this.edges.right - this.edgeMargin, this.edges.right);
              params.y = this.p5.random(this.edges.top, this.edges.bottom);
              break;
          }

          break;

        // Circle = spawn walkers in a circle around the center of the screen
        case 'Circle':
          // Find the largest radius that fits into the current FrameSize dimensions (smallest dimension)
          let maxRadius;
          switch(typeof this.settings.FrameSize) {
            case 'number':
              maxRadius = this.settings.FrameSize/2;
              break;

            case 'object':
              maxRadius = this.settings.FrameSize[0] > this.settings.FrameSize[1] ? this.settings.FrameSize[1]/2 : this.settings.FrameSize[0]/2;
              break;
          }

          let radius = this.p5.random(5, maxRadius),
            angle = this.p5.random(360),
            center = this.settings.hasOwnProperty('CircleCenter') ? this.settings.CircleCenter : {x: window.innerWidth / 2, y: window.innerHeight / 2};

          params.x = center.x + radius * Math.cos(angle * Math.PI / 180);
          params.y = center.y + radius * Math.sin(angle * Math.PI / 180);
          break;

        // Random = spawn walkers randomly throughout the entire screen
        case 'Random':
          params.x = this.p5.random(this.edges.left, this.edges.right);
          params.y = this.p5.random(this.edges.top, this.edges.bottom);
          break;

        // Center = spawn all walkers at screen center
        case 'Center':
          params.x = window.innerWidth / 2;
          params.y = window.innerHeight / 2;
          break;

        // Offscreen = spawn all walkers outside of the screen edges
        case 'Offscreen':
          params.x = this.p5.random(this.edges.left - 200, this.edges.right + 200);
          params.y = this.p5.random(this.edges.top - 200, this.edges.bottom + 200);

          if(
            (params.x > this.edges.left && params.x < this.edges.right) &&
            (params.y > this.edges.top && params.y < this.edges.bottom)
          ) {
            continue;
          }
          
          break;
      }

      // Vary diameter, if enabled
      if (this.settings.VaryDiameterByDistance) {
        let dist = this.p5.dist(params.x, params.y, window.innerWidth / 2, window.innerHeight / 2);
        params.diameter = this.p5.map(dist, 0, this.maxDistance, this.settings.CircleDiameterRange[0], this.settings.CircleDiameterRange[1]);
      } else if (this.settings.VaryDiameterRandomly) {
        params.diameter = this.p5.random(this.settings.CircleDiameterRange[0], this.settings.CircleDiameterRange[1]);
      }

      // Create a walker with the coordinates
      this.createWalker(params);
    }
  }

  /**
   * Create a set of clustered particles with the provided pattern.
   * @param {string} clusterType - Pattern to create all clustered particles with. Can be Point, Ring, Random, or Wall
   */
  createDefaultClusters(clusterType = this.settings.InitialClusterType) {
    let paramsList = [];

    switch (clusterType) {
      // Single particle in center of screen
      case 'Point':
        paramsList.push({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          diameter: this.settings.CircleDiameter
        });

        break;

      // Series of particles evenly spaced in a circle around center of screen
      case 'Ring':
        let radius = 100,
          numParticles = 20;

        for (let i = 0; i < numParticles; i++) {
          paramsList.push({
            x: window.innerWidth / 2 + radius * Math.cos((360 / numParticles) * i * Math.PI / 180),
            y: window.innerHeight / 2 + radius * Math.sin((360 / numParticles) * i * Math.PI / 180),
            diameter: this.settings.CircleDiameter
          });
        }

        break;

      // Individual particles randomly distributed across entire screen
      case 'Random':
        for (let i = 0; i < 100; i++) {
          paramsList.push({
            x: this.p5.random(this.edges.left, this.edges.right),
            y: this.p5.random(this.edges.top, this.edges.bottom),
            diameter: this.settings.CircleDiameter
          });
        }

        break;

      // Line of particles along an edge of the screen or frame
      case 'Wall':
        switch (this.settings.BiasTowards) {
          case 'Top':
            paramsList = this.createHorizontalClusterWall(this.edges.top);
            break;

          case 'Bottom':
            paramsList = this.createHorizontalClusterWall(this.edges.bottom);
            break;

          case 'Left':
            paramsList = this.createVerticalClusterWall(this.edges.left);
            break;

          case 'Right':
            paramsList = this.createVerticalClusterWall(this.edges.right);
            break;

          case 'Edges':
            paramsList = paramsList.concat(this.createHorizontalClusterWall(this.edges.top));
            paramsList = paramsList.concat(this.createHorizontalClusterWall(this.edges.bottom));
            paramsList = paramsList.concat(this.createVerticalClusterWall(this.edges.left));
            paramsList = paramsList.concat(this.createVerticalClusterWall(this.edges.right));
            break;

          case 'Equator':
            paramsList = paramsList.concat(this.createHorizontalClusterWall(window.innerHeight / 2));
            break;

          case 'Meridian':
            paramsList = paramsList.concat(this.createVerticalClusterWall(window.innerWidth / 2));
            break;
        }

        break;
    }

    this.createClusterFromParams(paramsList);
  }

  /**
   * Create a horizontal line of clustered particles at a given Y coordinate
   * @param {number} yPos - vertical coordinate where line of particles is created
   * @returns {Object} Object containing X and Y coordinates of all clustered particles in line
   */
  createHorizontalClusterWall(yPos) {
    let coords = [],
      width = this.useFrame ? this.edges.right - this.edges.left : window.innerWidth;

    for (let i = 0; i <= width / this.settings.CircleDiameter; i++) {
      coords.push({
        x: this.edges.left + i * this.settings.CircleDiameter,
        y: yPos,
        diameter: this.settings.CircleDiameter
      });
    }

    return coords;
  }

  /**
   * Create a vertical line of clustered particles at a given X coordinate
   * @param {number} xPos - horizontal coordinate where line of particles is created 
   * @return {Object} Object containing the X and Y coordinates of all clustered particles in line
   */
  createVerticalClusterWall(xPos) {
    let coords = [],
      height = this.useFrame ? this.edges.bottom - this.edges.top : window.innerHeight;

    for (let i = 0; i <= height / this.settings.CircleDiameter; i++) {
      coords.push({
        x: xPos,
        y: this.edges.top + i * this.settings.CircleDiameter,
        diameter: this.settings.CircleDiameter
      });
    }

    return coords;
  }

  /**
   * Create a set of clustered particles from an array of individual particle parameters
   * @param {Array} paramsList - Array of objects containing particle parameters.  
   */
  createClusterFromParams(paramsList) {
    if (paramsList.length > 0) {
      for (let params of paramsList) {
        params.stuck = true;
        this.createParticle(params);
      }
    }
  }

  /**
   * Create shapes in the internal collision detection system from a set of paths
   * @param {Array} paths - Array of objects defining polygons (technically polylines) with starting X and Y coordinates and a list of points
   */
  createShapesFromPaths(paths) {
    if (!paths.hasOwnProperty('points') && paths.length == 0) {
      console.error('Unable to create shapes. Paths must have an array of points [[x,y],...]');
      return;
    }

    for (let path of paths) {
      // Create a single polygon if the shape is marked as "solid"
      if (path.solid) {
        let shape = this.system.createPolygon(path.x, path.y, path.points);
        shape.solid = path.solid;
        shape.closed = path.closed;
        this.shapes.push(shape);

      // Create a series of separate line segments if shape is not "solid", per https://github.com/Sinova/Collisions#anchor-lines
      } else {
        for (let i = 1; i < path.points.length; i++) {
          let line = this.system.createPolygon(path.x, path.y, [[path.points[i - 1][0], path.points[i - 1][1]], [path.points[i][0], path.points[i][1]]]);
          line.solid = false;
          line.closed = false;
          this.shapes.push(line);
        }
      }
    }
  }


  //==============
  //  Removers
  //==============
  /** Remove all walkers, clustered particles, shapes, and lines from the system */
  removeAll() {
    for (let body of this.bodies) {
      this.system.remove(body);
    }

    for (let shape of this.shapes) {
      this.system.remove(shape);
    }

    this.bodies = [];
    this.shapes = [];
    this.lines = [];
    this.numWalkers = 0;
  }


  //==============
  //  Togglers
  //==============
  /** Toggle between paused or unpaused state */
  togglePause() {
    this.paused = !this.paused;
  }

  /** Toggle the visibility of walkers */
  toggleShowWalkers() {
    this.showWalkers = !this.showWalkers;
  }

  /** Toggle the visibility of clustered particles */
  toggleShowClusters() {
    this.showClusters = !this.showClusters;
  }

  /** Toggle the visibility of shapes */
  toggleShowShapes() {
    this.showShapes = !this.showShapes;
  }

  /** Toggle the use of a custom-defined frame (bounding box) */
  toggleUseFrame() {
    this.useFrame = !this.useFrame;
    this.resetEdges();
  }

  /** Toggle the line-based rendering mode */
  toggleLineRenderingMode() {
    if(this.renderMode != 'Lines') {
      if(this.settings.CaptureLines) {
        this.renderMode = 'Lines';
      } else {
        console.error('Line rendering mode only allowed when CaptureLines is set.');
      }
    } else {
      this.renderMode = 'Shapes';
    }
  }


  //===================
  //  Pause/unpause
  //===================
  /** Pause the simulation */
  pause() {
    this.paused = true;
  }

  /** Unpause the simulation */
  unpause() {
    this.paused = false;
  }


  //======================
  //  Utility functions
  //======================
  /**
   * Create an HSL-formatted string that plays well with p5.js from an object with appropriate properties
   * @param {object} colorObject - Object with the properties h, s, and b (all numbers) 
   * @returns {string} - String in the format of hsl({h}, {s}, {b})
   */
  getColorStringFromObject(colorObject) {
    let colorString = 'hsla(' +
      colorObject.h + ', ' +
      colorObject.s + '%, ' +
      colorObject.b + '%, ';

    if(colorObject.hasOwnProperty('a')) {
      colorString += colorObject.a + ')';
    } else {
      colorString += '1.0)';
    }
    
    return colorString;
  }


  //============
  //  Export
  //============
  /** Constructs an SVG node with paths based on current rendering mode of the simulation, then initiates a download on the user's machine of the generated file */
  export() {
    // Set up <svg> element
    let svg = document.createElement('svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);

    // Export all bodies based on the current rendering mode
    switch(this.renderMode) {
      case 'Shapes':
      default:
        for(let body of this.bodies) {
          if(!body.stuck && !this.showWalkers) {
            continue;
          }

          if(body._circle) {
            svg.appendChild( this.createCircleElFromBody(body) );
          } else {  
            svg.appendChild( this.createPathElFromPoints( this.getPointsFromCoords(body._coords) ) );
          }
        }

        break;

      case 'Lines':
        if(this.lines.length > 0) {
          for(let line of this.lines) {
            let points = [];
            
            points.push({
              x: line.p1.x, 
              y: line.p1.y
            });

            points.push({
              x: line.p2.x,
              y: line.p2.y
            });

            svg.appendChild( this.createPathElFromPoints(points) );
          }
        }

        break;
    }

    // Export all custom imported shapes as paths
    if(this.shapes.length > 0) {
      for(let shape of this.shapes) {
        svg.appendChild( this.createPathElFromPoints( this.getPointsFromCoords(shape._coords) ) );
      }
    }
    
    // Force download of .svg file based on https://jsfiddle.net/ch77e7yh/1
    let svgDocType = document.implementation.createDocumentType('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd");
    let svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
    svgDoc.replaceChild(svg, svgDoc.documentElement);
    let svgData = (new XMLSerializer()).serializeToString(svgDoc);

    let blob = new Blob([svgData.replace(/></g, '>\n\r<')]);
    saveAs(blob, 'dla-' + Date.now() + '.svg');
  }

  /**
   * Convert a flat array of coords ([x1, y1, x2, y2, ...]), used internally by collisions package into an array of objects for easier traversing
   * @param {array} coords 
   */
  getPointsFromCoords(coords) {
    let points = [];

    for (let i = 0; i < coords.length - 1; i += 2) {
      points.push({
        x: coords[i], 
        y: coords[i + 1]
      });
    }

    return points;
  }

  /**
   * Create a <path> element with a "d" attribute containing provided points
   * @param {array} points 
   * @returns {node} SVG <path> element with "d" attribute containing provided points
   */
  createPathElFromPoints(points) {
    let pointsString = '';

    for(let [index, point] of points.entries()) {
      pointsString += point.x + ',' + point.y;

      if(index < points.length - 1) {
        pointsString += ' ';
      }
    }

    let d = toPath({
      type: 'polyline',
      points: pointsString
    });

    let pathEl = document.createElement('path');
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('style', 'fill: none; stroke: black; stroke-width: 1');

    return pathEl;
  }

  /**
   * Create an SVG <circle> element with attributes `cx`, `cy`, and `r` extracted from provided body
   * @param {object} body 
   * @returns {node} SVG <circle> element with `cx`, `cy`, and `r` attributes from body
   */
  createCircleElFromBody(body) {
    let circleEl = document.createElement('circle');
    circleEl.setAttribute('cx', body.x);
    circleEl.setAttribute('cy', body.y);
    circleEl.setAttribute('r', body.radius);
    return circleEl;
  }

}
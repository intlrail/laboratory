import {math} from "./math";

export const config = {
    DEFAULT_SEGMENT_LENGTH: 500, HIGHWAY_SEGMENT_LENGTH: 500,
    DEFAULT_SEGMENT_WIDTH: 6, HIGHWAY_SEGMENT_WIDTH: 60,
    /** branch with 90° angle + randomness */
    RANDOM_BRANCH_ANGLE: function() { return math.PI * radius; },
    /** sample possible highway continuation with this angle */
    RANDOM_STRAIGHT_ANGLE: function() { return math.PI / 180; },
    /** probability of branching normal streets (including from highways) */
    DEFAULT_BRANCH_PROBABILITY: 1
    /** probability of branching from highways */
    HIGHWAY_BRANCH_PROBABILITY: 0
    /** minimum population to allow branching */
    HIGHWAY_BRANCH_POPULATION_THRESHOLD: 100,
    NORMAL_BRANCH_POPULATION_THRESHOLD: 10,
    /** time steps every normal street that branches from a highway is delayed */
    NORMAL_BRANCH_TIME_DELAY_FROM_HIGHWAY: 10,
    /** number of possible new segments to search for maximum population */
    HIGHWAY_POPULATION_SAMPLE_SIZE: 1,
    /** ignore intersections with less than this degrees angle */
    MINIMUM_INTERSECTION_DEVIATION: 45,
    /** stop generation after x steps */
    SEGMENT_COUNT_LIMIT: 200000,
    /** maximum distance to connect roads */
    ROAD_SNAP_DISTANCE: 200,
    /** resolution of the heatmap overlay */
    HEATMAP_PIXEL_DIM: 25,
    /** draw population heatmap */
    DRAW_HEATMAP: false,
    /** threshold heatmap at *_BRANCH_POPULATION_THRESHOLD */
    HEATMAP_AS_THRESHOLD: false,
    QUADTREE_PARAMS: { x: -2E4, y: -2E4, width: 4E4, height: 4E4 },
    QUADTREE_MAX_OBJECTS: 10, QUADTREE_MAX_LEVELS: 10,
    DEBUG: false,
    /** disallow branching of normal streets from highways */
    ONLY_HIGHWAYS: false,
    /** 80 is good value for displaying segments as arrows */
    ARROWHEAD_SIZE: 0,
    /** draw a circle at the base of segments (30 is good) (very slow for some reason) */
    DRAW_CIRCLE_ON_SEGMENT_BASE: 25,
    /** disable collision checks (ignore localConstraints evaluation) */
    IGNORE_CONFLICTS: false,
    ITERATIONS_PER_SECOND: 60,
    /** speedup of iterations per second over time */
    ITERATION_SPEEDUP: 0.66,
    /** color future segments according to their position in the priority queue */
    PRIORITY_FUTURE_COLORS: false,
    /** start smooth zooming after n iterations */
    SMOOTH_ZOOM_START: 40,
    /** immediately execute  n iterations before animating */
    SKIP_ITERATIONS: 9,
    /** delay when finding new time step in priority queue */
    DELAY_BETWEEN_TIME_STEPS: 25,
    /** target camera scale of the scene */
    TARGET_ZOOM: 0.9,
    /** automatic restart of generation when finished */
    RESTART_AFTER_SECONDS: -1,
    /** choose new seed when restarting */
    RESEED_AFTER_RESTART: true,
    /** grow to the right and left initially */
    TWO_SEGMENTS_INITIALLY: false,
    /** instead of starting with highways */
    START_WITH_NORMAL_STREETS: true,
    /** transparent background of canvas */
    TRANSPARENT: true, BACKGROUND_COLOR: 0x000000,
    /** seed value for determinism */
    SEED: null as string
};

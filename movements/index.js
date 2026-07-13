import { wanderer } from './wanderer.js';
import { cat } from './cat.js';
import { dog } from './dog.js';
import { bird } from './bird.js';
import { bunny } from './bunny.js';
import { snail } from './snail.js';
import { polarBear } from './polarBear.js';

const movements = { wanderer, cat, dog, bird, bunny, snail, polarBear };

export function getMovement(type){
  return movements[type] || movements.wanderer;
}

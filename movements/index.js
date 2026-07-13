import { wanderer } from './wanderer.js';
import { cat } from './cat.js';
import { dog } from './dog.js';

const movements = { wanderer, cat, dog };

export function getMovement(type){
  return movements[type] || movements.wanderer;
}

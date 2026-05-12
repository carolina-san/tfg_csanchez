import * as THREE from "three";

export const LAT_REF = 38.0598459;
export const LON_REF = -0.7645837;
export const METROS_POR_GRADO_LAT = 111320;
export const METROS_POR_GRADO_LON = 111320 * Math.cos((LAT_REF * Math.PI) / 180);
export const ESCALA = 0.78 / 11950;
export const POS_INICIAL = new THREE.Vector3(0.3, 0.40, 0.3);
export const TARGET_INICIAL_DEFAULT = new THREE.Vector3(0, 0, 0);
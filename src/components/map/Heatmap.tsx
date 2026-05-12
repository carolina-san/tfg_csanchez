import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { useSensorData } from "../../hooks/useSensorData";
import { LAT_REF, LON_REF, METROS_POR_GRADO_LAT, METROS_POR_GRADO_LON, ESCALA } from "../../utils/mapConstants";
import { updateHeatmapCanvas } from "../../utils/heatmapUtils";

interface HeatmapProps {
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number } | null;
  type: 'Temperatura' | 'Humedad' | 'Ruido';
  onLoadingChange?: (loading: boolean) => void;
}

function Heatmap({ bounds, type, onLoadingChange }: HeatmapProps) {
  const { sensors, isSensorsLoading } = useSensorData();
  const [heatmapReady, setHeatmapReady] = useState(false);

  const { scene: terrainScene } = useGLTF("/laguna_con_textura2.glb");
  const waterTexture = useTexture('/textura_agua.png');

  // textura de agua
  useEffect(() => {
    waterTexture.colorSpace = THREE.SRGBColorSpace;
    waterTexture.offset.set(0.006, -0.006);
    waterTexture.repeat.set(0.985, 1.005);
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.needsUpdate = true;
  }, [waterTexture]);

  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 240;
    c.height = 240;
    return c;
  }, []);

  const heatmapTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [canvas]);

  useEffect(() => {
    return () => {
      heatmapTexture.dispose();
    };
  }, [heatmapTexture]);

  useEffect(() => {
    if (!onLoadingChange) return;
    onLoadingChange(isSensorsLoading || !heatmapReady);
    return () => {
      onLoadingChange(false);
    };
  }, [heatmapReady, isSensorsLoading, onLoadingChange]);

  useEffect(() => {
    if (!bounds || sensors.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeSensors = sensors.filter(s => s.data.some(d => d.type === type));
    if (activeSensors.length === 0) return;

    const points = activeSensors.map(s => {
      const x_m = (s.lon - LON_REF) * METROS_POR_GRADO_LON;
      const z_m = -(s.lat - LAT_REF) * METROS_POR_GRADO_LAT;
      const x = x_m * ESCALA;
      const z = z_m * ESCALA;
      const val = s.data.find(d => d.type === type)?.value || 0;
      return { x, z, val };
    });

    updateHeatmapCanvas(canvas, points, bounds);

    heatmapTexture.needsUpdate = true;
    setHeatmapReady(true);

  }, [sensors, bounds, canvas, heatmapTexture, type]);

  const processedGeometries = useMemo(() => {
    if (!bounds || !terrainScene) return [];

    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxZ - bounds.minZ;
    const geoms: THREE.BufferGeometry[] = [];

    terrainScene.updateMatrixWorld(true);

    terrainScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geom = child.geometry.clone();
        const posAttribute = geom.attributes.position;
        const uv = new Float32Array(posAttribute.count * 2);
        const vertex = new THREE.Vector3();

        for (let i = 0; i < posAttribute.count; i++) {
          vertex.fromBufferAttribute(posAttribute, i);
          vertex.applyMatrix4(child.matrixWorld);

          const u = (vertex.x - bounds.minX) / width;
          const v = 1.0 - (vertex.z - bounds.minZ) / depth;

          uv[i * 2] = u;
          uv[i * 2 + 1] = v;
        }

        geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        geoms.push(geom);
      }
    });

    return geoms;
  }, [bounds, terrainScene]);

  useEffect(() => {
    return () => {
      processedGeometries.forEach(geom => geom.dispose());
    };
  }, [processedGeometries]);

  if (!bounds || processedGeometries.length === 0) return null;

  return (
    <group>
      {processedGeometries.map((geometry, idx) => (
        <group key={idx}>
          {/* Textura heatmap */}
          <mesh geometry={geometry} renderOrder={1}>
            <meshStandardMaterial
              map={heatmapTexture}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              polygonOffsetUnits={-4}
            />
          </mesh>

          {/* Textura agua solo si ya se ha calculado el heatmap*/}
          {heatmapReady && (
            <mesh geometry={geometry} renderOrder={2}>
              <meshStandardMaterial
                map={waterTexture}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-5}
                polygonOffsetUnits={-5}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

useGLTF.preload("/laguna_con_textura2.glb");

export default Heatmap;

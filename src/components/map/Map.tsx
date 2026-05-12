import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Markers } from "./Marker3D";
import Heatmap from "./Heatmap";
import { POS_INICIAL, TARGET_INICIAL_DEFAULT } from "../../utils/mapConstants";


interface MapBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
}

interface Map3DProps {
  selectedSensor?: any;
  onSensorSelect?: (sensor: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  heatmapVisible: boolean;
  heatmapType: 'Temperatura' | 'Humedad' | 'Ruido';
  sensorsVisible: boolean;
  onCameraMove?: (moved: boolean) => void;
}

export interface Map3DHandle {
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

function MapModel({ setControlsTarget, setInitialCameraPos, setMapBounds, isMobile }: {
  setControlsTarget: (v: THREE.Vector3) => void,
  setInitialCameraPos: (v: THREE.Vector3) => void,
  setMapBounds: (bounds: MapBounds) => void,
  isMobile: boolean
}) {
  const { scene } = useGLTF("/laguna_con_textura2.glb");
  const { camera, controls } = useThree();

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = !isMobile;
          mesh.receiveShadow = false;
          if (mesh.material) {
            (mesh.material as THREE.Material).needsUpdate = true;
            (mesh.material as THREE.Material).shadowSide = THREE.DoubleSide;
          }
        }
      });

      const offsetX = isMobile ? 0.06 : 0;
      const offsetZ = isMobile ? -0.06 : 0;
      const targetOffset = new THREE.Vector3(offsetX, 0, offsetZ);
      const newTarget = center.clone().add(targetOffset);

      if (controls) {
        const orbitControls = controls as unknown as OrbitControlsImpl;
        orbitControls.target.copy(newTarget);
        orbitControls.update();
        setControlsTarget(newTarget.clone());
      }

      const scalePos = isMobile ? 1.2 : 1.0;
      const newPos = new THREE.Vector3(
        center.x + POS_INICIAL.x * scalePos + offsetX,
        center.y + POS_INICIAL.y * scalePos,
        center.z + POS_INICIAL.z * scalePos + offsetZ
      );

      camera.position.copy(newPos);
      camera.lookAt(newTarget);
      setInitialCameraPos(newPos);

      setMapBounds({
        minX: box.min.x,
        maxX: box.max.x,
        minZ: box.min.z,
        maxZ: box.max.z,
        minY: box.min.y
      });
    }
  }, [scene, camera, controls, setControlsTarget, setInitialCameraPos, isMobile]);

  return <primitive object={scene} />;
}

const Map3D = forwardRef<Map3DHandle, Map3DProps>(({ selectedSensor, onSensorSelect, onLoadingChange, heatmapVisible, heatmapType, sensorsVisible, onCameraMove }, ref) => {
  const [controlsTarget, setControlsTarget] = useState<THREE.Vector3>(TARGET_INICIAL_DEFAULT);
  const [initialCameraPos, setInitialCameraPos] = useState<THREE.Vector3>(POS_INICIAL);
  const [controlsRef, setControlsRef] = useState<any>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReset = () => {
    if (controlsRef) {
      controlsRef.object.position.copy(initialCameraPos);
      controlsRef.target.copy(controlsTarget);
      controlsRef.update();
      if (onCameraMove) onCameraMove(false);
    }
  };

  const handleZoom = (factor: number) => {
    if (controlsRef) {
      const distance = controlsRef.object.position.distanceTo(controlsRef.target);
      let newDistance = Math.max(0.1, distance * factor);
      newDistance = Math.min(1.0, newDistance);

      const dir = new THREE.Vector3().subVectors(controlsRef.object.position, controlsRef.target).normalize();
      controlsRef.object.position.copy(controlsRef.target).add(dir.multiplyScalar(newDistance));
      controlsRef.update();
      if (onCameraMove) onCameraMove(true);
    }
  };

  useImperativeHandle(ref, () => ({
    resetCamera: handleReset,
    zoomIn: () => handleZoom(0.8),
    zoomOut: () => handleZoom(1.25)
  }));

  return (
    <div className="w-full h-full relative" role="region" aria-label="Mapa 3D interactivo de la laguna" >
      <Canvas
        dpr={[1, 1.5]}
        shadows={!isMobile}
        gl={{ antialias: !isMobile, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = !isMobile;
          if (!isMobile) {
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }
        }}
      >
        <PerspectiveCamera makeDefault position={POS_INICIAL} fov={60} near={0.01} far={10000} />

        <OrbitControls
          makeDefault
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={0.1}
          maxDistance={isMobile ? 1.5 : 1.0}
          ref={(ref) => setControlsRef(ref)}
          onChange={(e) => {
            if (!e?.target) return;
            const ctrl = e.target;
            const cam = ctrl.object;
            if (ctrl.target.y < 0) { //no se puede bajar del suelo
              cam.position.y += (0 - ctrl.target.y);
              ctrl.target.y = 0;
            }
            const moved =
              cam.position.distanceTo(initialCameraPos) > 0.05 ||
              ctrl.target.distanceTo(controlsTarget) > 0.05;

            if (onCameraMove) onCameraMove(moved);
          }}
        />

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={2} castShadow={!isMobile}
        />


        <MapModel setControlsTarget={setControlsTarget} setInitialCameraPos={setInitialCameraPos} setMapBounds={setMapBounds} isMobile={isMobile} />

        {mapBounds && (
          <mesh
            receiveShadow
            position={[0, mapBounds.minY - 0.05, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[10000, 10000]} />
            <shadowMaterial transparent opacity={0.4} />
          </mesh>
        )}

        {/* Si están activos los sensores */}
        {sensorsVisible && (
          <Markers
            selectedSensor={selectedSensor}
            onSensorSelect={onSensorSelect}
            onLoadingChange={onLoadingChange}
          />
        )}

        {/* Si hay heatmap sale el heatmap */}
        {heatmapVisible && <Heatmap bounds={mapBounds} type={heatmapType} onLoadingChange={onLoadingChange} />}
      </Canvas>
    </div>
  );
});

export default Map3D;

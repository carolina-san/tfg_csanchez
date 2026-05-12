import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useSensorData } from "../../hooks/useSensorData";
import { LAT_REF, LON_REF, METROS_POR_GRADO_LAT, METROS_POR_GRADO_LON, ESCALA } from "../../utils/mapConstants";



interface MarkerItemProps {
    sensor: any;
    initialPosition: THREE.Vector3;
    isSelected: boolean;
    onSelect: (name: string) => void;
}

function MarkerItem({ sensor, initialPosition, isSelected, onSelect }: MarkerItemProps) {
    const { scene } = useGLTF("/marcador.glb");
    const clone = useMemo(() => {
        const clonedScene = scene.clone();
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = false;
            }
        });
        return clonedScene;
    }, [scene]);

    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    const targetScale = hovered || isSelected ? 1.3 : 1.0;
    const currentScale = useRef(1.0);

    const targetColor = useMemo(() => hovered || isSelected ? new THREE.Color(0xFC4C69) : new THREE.Color(0xFF91A4), [hovered, isSelected]);
    const currentColor = useRef(new THREE.Color(0xFF91A4));

    useFrame(() => {
        if (meshRef.current) {

            currentScale.current += (targetScale - currentScale.current) * 0.1;
            meshRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);

            currentColor.current.lerp(targetColor, 0.1);

            meshRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    if (!child.userData.materialCloned) {
                        child.material = child.material.clone();
                        child.userData.materialCloned = true;
                    }
                    child.material.color.copy(currentColor.current);
                }
            });
        }
    });

    const { scene: parentScene } = useThree();
    const [adjustedPosition, setAdjustedPosition] = useState(initialPosition);

    useEffect(() => {
        const pos = initialPosition.clone();

        const raycaster = new THREE.Raycaster();
        const rayOrigin = new THREE.Vector3(pos.x, 50, pos.z);
        const rayDirection = new THREE.Vector3(0, -1, 0);
        raycaster.set(rayOrigin, rayDirection);

        const meshes: THREE.Mesh[] = [];
        parentScene.traverse((child) => {
            if (child instanceof THREE.Mesh && !meshRef.current?.children.includes(child)) {
                meshes.push(child);
            }
        });

        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
            pos.y = intersects[0].point.y;
        } else {
            pos.y = 0;
        }
        setAdjustedPosition(pos);
    }, [initialPosition, parentScene]);

    return (
        <primitive
            object={clone}
            position={adjustedPosition}
            ref={meshRef}
            castShadow
            receiveShadow
            onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e: any) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
            onClick={(e: any) => {
                e.stopPropagation();
                onSelect(sensor.nombre);
            }}
        />
    );
}

interface MarkersProps {
    selectedSensor?: any;
    onSensorSelect?: (sensor: any) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export function Markers({
    selectedSensor,
    onSensorSelect,
    onLoadingChange,
}: MarkersProps) {
    const { sensors, isSensorsLoading } = useSensorData();

    useEffect(() => {
        if (onLoadingChange) onLoadingChange(isSensorsLoading);
        return () => {
            if (onLoadingChange) onLoadingChange(false);
        };
    }, [isSensorsLoading, onLoadingChange]);

    const translateCoords = (lat: number, lon: number) => {
        const x_m = (lon - LON_REF) * METROS_POR_GRADO_LON;
        const z_m = -(lat - LAT_REF) * METROS_POR_GRADO_LAT;
        return new THREE.Vector3(x_m * ESCALA, 0, z_m * ESCALA);
    };

    const handleSensorSelect = (sensor: any) => {
        if (onSensorSelect) {
            onSensorSelect(sensor);
        }
    };

    return (
        <group>
            {sensors.map((sensor, i) => (
                <MarkerItem
                    key={i}
                    sensor={sensor}
                    initialPosition={translateCoords(sensor.lat, sensor.lon)}
                    isSelected={selectedSensor && sensor.name === selectedSensor.name}
                    onSelect={() => handleSensorSelect(sensor)}
                />
            ))}
        </group>
    );
}

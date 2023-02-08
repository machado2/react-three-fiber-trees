import { ColliderDesc } from "@dimforge/rapier3d-compat";
import { useLoader, useThree } from "@react-three/fiber";
import { HeightfieldArgs, HeightfieldCollider, UseColliderOptions, useRapier } from "@react-three/rapier";
import React, { forwardRef, ReactNode, useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, Mesh, PlaneBufferGeometry, PlaneGeometry, Vector3 } from "three";

const colliderDescFromPlaneGeometry = (
    geometry,
) => {
    let desc;
    const g = geometry
    const heights = []
    const vertices = g.attributes.position
    const vertex = new Vector3()
    for (let i = 0; i < vertices.count; i++) {
        vertex.fromBufferAttribute(vertices, i)
        heights.push(vertex.z)
    }

    desc = ColliderDesc.heightfield(
        g.parameters.widthSegments,
        g.parameters.heightSegments,
        new Float32Array(heights),
        { x: g.parameters.width, y: 1, z: g.parameters.height }
    );

    return desc;
}

export const Ground = forwardRef((props, ref) => {
    const widthSegments = props.widthSegments ?? 10
    const heightSegments = props.heightSegments ?? 10
    const heightFunction = props.heightFunction ?? ((_x, _z) => 1)

    const width = props.width ?? 100
    const height = props.height ?? 100

    const [heights, geometry] = useMemo(() => {
        const geom = new PlaneBufferGeometry(width, height, widthSegments, heightSegments)
        const vertex = new Vector3()
        let newPositionAttribute = []
        const positionAttribute = geom.getAttribute('position')
        const heightLines = Array(heightSegments + 1)

        for (let y = 0; y <= heightSegments; y++)
            heightLines[y] = []

        for (let y = 0; y <= heightSegments; y++) {
            const py = y * (widthSegments + 1)
            //heightLines[heightSegments - y] = []
            for (let x = 0; x <= widthSegments; x++) {
                vertex.fromBufferAttribute(positionAttribute, py + x)
                const z = heightFunction(vertex.x, vertex.y)
                newPositionAttribute.push(vertex.x, vertex.y, z)
                heightLines[heightSegments - y][x] = -z
            }
        }
        const heights = heightLines.flat()
        geom.setAttribute('position', new Float32BufferAttribute(newPositionAttribute, 3))
        geom.computeVertexNormals()
        geom.attributes.position.needsUpdate = true

        return [heights, geom]
    }, [true])

    const { world, rapier } = useRapier()

    useEffect(() => {
        const colliderDesc = rapier.ColliderDesc.heightfield(
            widthSegments,
            heightSegments,
            new Float32Array(heights),
            { x: width, y: 1.0, z: height }
        );
        const collider = world.createCollider(colliderDesc)
        return () => {
            world.removeCollider(collider)
        }
    }, [heights])

    return <group rotation-y={Math.PI / 2}>
        <group rotation-x={-Math.PI / 2}>
            <mesh ref={ref} geometry={geometry}  castShadow receiveShadow>
                {props.children}
            </mesh>
        </group>
    </group>
})


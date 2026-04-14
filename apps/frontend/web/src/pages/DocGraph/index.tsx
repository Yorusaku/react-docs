/*
 * Copyright (c) 2024 婵℃瑧鐖滅€涳箓娅?@Heyi
 * All rights reserved.
 * 婵℃瑧鐖滅€涳箓娅岀€规ɑ鏌熼崙鍝勬惂閿涘奔缍旈敓?@Heyi閿涘奔绶电€涳箑鎲崇€涳缚绡勬担璺ㄦ暏閿涘苯褰查悽銊ょ稊缂佸啩绡勯敍灞藉讲閻劋缍旂紘搴″缁犫偓閸樺棴绱濇稉宥呭讲瀵偓濠ф劧鎷? */

import '@xyflow/react/dist/style.css'

import { SidebarInset, SidebarTrigger } from '@miaoma-doc/shadcn-shared-ui/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import { applyEdgeChanges, applyNodeChanges, Background, Controls, Edge, EdgeChange, Node, NodeChange, ReactFlow } from '@xyflow/react'
import * as d3 from 'd3-force'
import { Loader } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import * as srv from '@/services'

import { GraphEdge } from './Edge'
import { buildGraphElements } from './graph-data'
import { GraphNode } from './Node'

const nodesTypes = {
    graph: GraphNode,
}

const edgeTypes = {
    graph: GraphEdge,
}

interface ForceNode extends d3.SimulationNodeDatum {
    id: string
}

interface ForceEdge extends d3.SimulationLinkDatum<ForceNode> {
    source: string | ForceNode
    target: string | ForceNode
}

export function DocGraph() {
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [isSimulating, setIsSimulating] = useState(true)

    const { data: pages = [] } = useQuery({
        queryKey: ['pageGraph'],
        queryFn: async () => {
            return (await srv.fetchPageGraph()).data
        },
    })

    const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        const selectedId = node.id

        setNodes(currentNodes => currentNodes.map(currentNode => ({ ...currentNode, selected: currentNode.id === selectedId })))
        setEdges(currentEdges =>
            currentEdges.map(currentEdge => ({
                ...currentEdge,
                selected: currentEdge.source === selectedId || currentEdge.target === selectedId,
            }))
        )
    }, [])

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)), [])
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges(eds => applyEdgeChanges(changes, eds)), [])

    useEffect(() => {
        setIsSimulating(true)

        const { nodes: initialNodes, edges: initialEdges } = buildGraphElements(pages)
        setNodes(initialNodes)
        setEdges(initialEdges)

        if (initialNodes.length === 0) {
            setIsSimulating(false)
            return undefined
        }

        const forceNodes: ForceNode[] = initialNodes.map(node => ({
            id: node.id,
            x: node.position.x,
            y: node.position.y,
        }))

        const forceEdges: ForceEdge[] = initialEdges.map(edge => ({
            source: edge.source,
            target: edge.target,
        }))

        const simulation = d3
            .forceSimulation(forceNodes)
            .force('charge', d3.forceManyBody().strength(-120))
            .force('collide', d3.forceCollide(96))
            .force(
                'link',
                d3
                    .forceLink<ForceNode, ForceEdge>(forceEdges)
                    .id(node => node.id)
                    .strength(0.9)
                    .distance(220)
                    .iterations(80)
            )
            .force('center', d3.forceCenter(700, 400))

        simulation.on('tick', () => {
            const forceNodeMap = new Map(simulation.nodes().map(node => [node.id, node]))

            setNodes(currentNodes =>
                currentNodes.map(currentNode => {
                    const forceNode = forceNodeMap.get(currentNode.id)
                    if (!forceNode) {
                        return currentNode
                    }

                    return {
                        ...currentNode,
                        position: {
                            x: forceNode.x ?? 0,
                            y: forceNode.y ?? 0,
                        },
                    }
                })
            )
        })

        simulation.on('end', () => {
            setIsSimulating(false)
        })

        return () => {
            simulation.stop()
        }
    }, [pages])

    return (
        <SidebarInset>
            <div className="flex flex-col w-full h-full">
                <div className="flex flex-row items-center p-6 gap-2">
                    <SidebarTrigger />
                    <h1 className="text-xl text-zinc-500">閿熶茎纰夋嫹鍥鹃敓鏂ゆ嫹</h1>
                </div>
                <div className="w-full h-full relative">
                    {isSimulating && (
                        <div className="w-full h-full flex justify-center items-center bg-zinc-50 opacity-30 absolute z-10">
                            <div className="flex flex-col items-center gap-2">
                                <Loader className="w-8 h-8 animate-spin" />
                                <p className="text-sm">閿熸枻鎷烽敓鏂ゆ嫹閿熸枻鎷?..</p>
                            </div>
                        </div>
                    )}
                    {!isSimulating && nodes.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500 absolute z-10">
                            閿熸枻鎷烽敓鐫尅鎷峰睍绀洪敓鏂ゆ嫹閿熶茎纰夋嫹閿熸枻鎷风郴
                        </div>
                    )}
                    <ReactFlow
                        nodesDraggable
                        proOptions={{
                            hideAttribution: true,
                        }}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodesTypes}
                        edgeTypes={edgeTypes}
                        onNodeClick={handleNodeClick}
                        onNodeDragStart={handleNodeClick}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>
            </div>
        </SidebarInset>
    )
}

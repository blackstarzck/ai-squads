import networkx as nx
from typing import List, Dict, Any


class ImpactAnalyzer:
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph(
        self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]
    ) -> None:
        """Build a directed graph from nodes and edges"""
        self.graph.clear()

        # Add all nodes
        for node in nodes:
            self.graph.add_node(
                node["id"],
                label=node.get("label", ""),
                type=node.get("type", ""),
                data=node.get("data", {}),
            )

        # Add all edges
        for edge in edges:
            self.graph.add_edge(
                edge["source_id"], edge["target_id"], label=edge.get("label", "")
            )

    def calculate_impact_score(self, node_id: str) -> int:
        """
        Calculate impact score (1-10) based on node connectivity.

        Factors considered:
        - Number of downstream nodes (nodes that depend on this one)
        - Number of upstream nodes (nodes this one depends on)
        - Centrality in the graph
        - Type of connected nodes (data nodes have higher weight)
        """
        if node_id not in self.graph:
            return 1

        # Get downstream nodes (affected by this node)
        try:
            downstream = len(list(nx.descendants(self.graph, node_id)))
        except:
            downstream = 0

        # Get upstream nodes (this node depends on)
        try:
            upstream = len(list(nx.ancestors(self.graph, node_id)))
        except:
            upstream = 0

        # Calculate degree centrality
        try:
            centrality = nx.degree_centrality(self.graph).get(node_id, 0)
        except:
            centrality = 0

        # Check if any connected nodes are data nodes (higher risk)
        data_node_factor = 0
        neighbors = list(self.graph.predecessors(node_id)) + list(
            self.graph.successors(node_id)
        )
        for neighbor in neighbors:
            if self.graph.nodes[neighbor].get("type") == "data":
                data_node_factor += 1

        # Calculate base score
        total_nodes = len(self.graph.nodes)
        if total_nodes == 0:
            return 1

        # Normalize and combine factors
        downstream_score = min(downstream / max(total_nodes, 1) * 5, 3)
        upstream_score = min(upstream / max(total_nodes, 1) * 3, 2)
        centrality_score = centrality * 3
        data_score = min(data_node_factor, 2)

        # Final score (1-10)
        raw_score = (
            1 + downstream_score + upstream_score + centrality_score + data_score
        )
        return min(max(int(raw_score), 1), 10)

    def get_affected_nodes(self, node_id: str) -> List[str]:
        """Get all nodes that would be affected by changing this node"""
        if node_id not in self.graph:
            return []

        try:
            descendants = list(nx.descendants(self.graph, node_id))
            return descendants
        except:
            return []

    def get_downstream_nodes(self, node_id: str) -> List[str]:
        """Get nodes that depend on this node (successors and their descendants)"""
        if node_id not in self.graph:
            return []

        try:
            return list(nx.descendants(self.graph, node_id))
        except:
            return []

    def get_upstream_nodes(self, node_id: str) -> List[str]:
        """Get nodes that this node depends on (predecessors and their ancestors)"""
        if node_id not in self.graph:
            return []

        try:
            return list(nx.ancestors(self.graph, node_id))
        except:
            return []

    def get_dependency_path(self, source_id: str, target_id: str) -> List[str]:
        """Get the shortest path between two nodes"""
        if source_id not in self.graph or target_id not in self.graph:
            return []

        try:
            return list(nx.shortest_path(self.graph, source_id, target_id))
        except nx.NetworkXNoPath:
            return []

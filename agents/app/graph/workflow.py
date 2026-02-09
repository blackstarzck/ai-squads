from langgraph.graph import StateGraph, END
from typing import Literal

from app.graph.state import AgentState, Message, TaskResult
from app.agents.sisyphus import SisyphusAgent
from app.agents.architect import ArchitectAgent
from app.agents.coder import CoderAgent
from app.agents.qa import QAAgent

# Initialize agents
sisyphus = SisyphusAgent()
architect = ArchitectAgent()
coder = CoderAgent()
qa = QAAgent()


def sisyphus_node(state: AgentState) -> AgentState:
    """PM agent that orchestrates the workflow"""
    return sisyphus.process(state)


def architect_node(state: AgentState) -> AgentState:
    """Architecture and design agent"""
    return architect.process(state)


def coder_node(state: AgentState) -> AgentState:
    """Code generation agent"""
    return coder.process(state)


def qa_node(state: AgentState) -> AgentState:
    """Quality assurance agent"""
    return qa.process(state)


def route_from_sisyphus(
    state: AgentState,
) -> Literal["architect", "coder", "qa", "end"]:
    """Route to the next agent based on workflow stage"""
    stage = state.get("workflow_stage", "idle")

    if stage == "design":
        return "architect"
    elif stage == "coding":
        return "coder"
    elif stage == "qa":
        return "qa"
    elif stage == "complete":
        return "end"
    else:
        return "end"


def route_back_to_sisyphus(state: AgentState) -> Literal["sisyphus", "end"]:
    """Route back to Sisyphus for review or end"""
    stage = state.get("workflow_stage", "idle")

    if stage == "complete":
        return "end"
    else:
        return "sisyphus"


def create_workflow() -> StateGraph:
    """Create the agent workflow graph"""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("sisyphus", sisyphus_node)
    workflow.add_node("architect", architect_node)
    workflow.add_node("coder", coder_node)
    workflow.add_node("qa", qa_node)

    # Set entry point
    workflow.set_entry_point("sisyphus")

    # Add conditional edges from Sisyphus
    workflow.add_conditional_edges(
        "sisyphus",
        route_from_sisyphus,
        {"architect": "architect", "coder": "coder", "qa": "qa", "end": END},
    )

    # Add edges back to Sisyphus from other agents
    workflow.add_conditional_edges(
        "architect", route_back_to_sisyphus, {"sisyphus": "sisyphus", "end": END}
    )

    workflow.add_conditional_edges(
        "coder", route_back_to_sisyphus, {"sisyphus": "sisyphus", "end": END}
    )

    workflow.add_conditional_edges(
        "qa", route_back_to_sisyphus, {"sisyphus": "sisyphus", "end": END}
    )

    return workflow


def compile_workflow():
    """Compile the workflow into a runnable graph"""
    workflow = create_workflow()
    return workflow.compile()

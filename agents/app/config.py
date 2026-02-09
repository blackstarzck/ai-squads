import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()


class Config:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MODEL_NAME: str = "llama-3.3-70b-versatile"
    TEMPERATURE: float = 0.7


config = Config()


def get_llm() -> ChatGroq:
    """Get the configured LLM instance"""
    return ChatGroq(
        model=config.MODEL_NAME,
        temperature=config.TEMPERATURE,
        groq_api_key=config.GROQ_API_KEY,
    )

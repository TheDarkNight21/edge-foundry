from llama_cpp import Llama

def load_model():

    llm = Llama(
        model_path = " thebloke/tinyllama-1.1b-chat-v1.0.Q8_0.gguf"
    )


from llama_cpp import Llama
from huggingface_hub import hf_hub_download

def download_model():

    model_path = hf_hub_download(
        repo_id="TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
        filename="tinyllama-1.1b-chat-v1.0.Q8_0.gguf"
    )

    print("Downloaded to:", model_path)


def load_model():

    llm = Llama.from_pretrained(
        model_path="models/tinyllama-1.1b-chat-v1.0.Q2_K.gguf",
        n_gpu_layers=-1,
        seed=1337,
        n_ctx=2048,
    )

    print(llm)

    return llm

def run_model(prompt : str, llm):
    output = llm(
        "Q: Name the planets in the solar system? A: ",  # Prompt
        max_tokens=32,  # Generate up to 32 tokens, set to None to generate up to the end of the context window
        stop=["Q:", "\n"],  # Stop generating just before the model would generate a new question
        echo=True  # Echo the prompt back in the output
    )  # Generate a completion, can also call create_completion

    return output

if __name__ == "__main__":
    download_model()


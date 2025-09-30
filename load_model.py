from llama_cpp import Llama

def load_model():
    return Llama.from_pretrained(
        repo_id="TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
        filename="tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
        n_ctx=2048,
        n_gpu_layers=-1,
        seed=1337,
    )

def run_model(prompt: str, llm: Llama):
    out = llm(prompt, max_tokens=128, stop=["Q:", "Human:", "User:"], echo=True)
    return out

if __name__ == "__main__":
    llm = load_model()
    print(run_model("Q: Name the planets in the solar system? A:", llm)["choices"][0]["text"])

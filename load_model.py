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
    # Format the prompt for better responses
    formatted_prompt = f"Human: {prompt}\nAssistant:"
    out = llm(formatted_prompt, max_tokens=64, stop=["Human:", "User:", "Student:", "\n\n", "Assistant:"], echo=False, temperature=0.7)
    return out

if __name__ == "__main__":
    llm = load_model()
    print(run_model("Q: Name the planets in the solar system? A:", llm)["choices"][0]["text"])

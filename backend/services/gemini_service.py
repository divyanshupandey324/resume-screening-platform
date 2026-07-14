import os
import json
import logging
import asyncio
import urllib.request
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger("LLMFallback")
logging.basicConfig(level=logging.INFO)

class LLMResponse:
    def __init__(self, text):
        self.text = text

class FallbackModelWrapper:
    def __init__(self):
        import threading
        self._cache = {}
        self._lock = threading.Lock()

    def _get_gemini_keys(self):
        val = os.getenv("GEMINI_API_KEY", "")
        if not val:
            return []
        keys = [k.strip() for k in val.split(",") if k.strip()]
        # Filter out keys that do not start with AIzaSy or AQ. (invalid format for API key)
        valid_keys = [k for k in keys if k.startswith("AIzaSy") or k.startswith("AQ.")]
        if len(valid_keys) < len(keys):
            logger.warning(f"Filtered out {len(keys) - len(valid_keys)} invalid Gemini API key format(s) (must start with 'AIzaSy' or 'AQ.').")
        return valid_keys

    def _call_openai_api(self, url, api_key, model_name, prompt, generation_config=None, extra_headers=None, timeout=8):
        headers = {
            "Content-Type": "application/json"
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        if extra_headers:
            headers.update(extra_headers)

        data = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        # Enable JSON mode if requested
        if generation_config and generation_config.get("response_mime_type") == "application/json":
            data["response_format"] = {"type": "json_object"}

        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["choices"][0]["message"]["content"]
                return text
        except Exception as e:
            logger.warning(f"Failed calling {model_name} at {url}: {e}")
            raise e

    def generate_content(self, prompt, generation_config=None):
        import hashlib
        config_str = json.dumps(generation_config, sort_keys=True) if generation_config else ""
        cache_key = hashlib.sha256(f"{prompt}|||{config_str}".encode("utf-8")).hexdigest()
        
        with self._lock:
            if cache_key in self._cache:
                logger.info("LLM Cache Hit")
                return LLMResponse(self._cache[cache_key])
                
        response = self._generate_content_uncached(prompt, generation_config=generation_config)
        
        with self._lock:
            self._cache[cache_key] = response.text
            
        return response

    def _generate_content_uncached(self, prompt, generation_config=None):
        errors = []

        # 1. Gemini Keys (with rotation)
        gemini_keys = self._get_gemini_keys()
        for idx, key in enumerate(gemini_keys):
            try:
                logger.info(f"Attempting Gemini API with key index {idx}")
                genai.configure(api_key=key)
                m = genai.GenerativeModel("gemini-2.5-flash")
                response = m.generate_content(prompt, generation_config=generation_config)
                return LLMResponse(response.text)
            except Exception as e:
                err_msg = f"Gemini key {idx} failed: {e}"
                logger.warning(err_msg)
                errors.append(err_msg)

        # 2. Groq
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            for model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"]:
                try:
                    logger.info(f"Attempting Groq with model {model}")
                    text = self._call_openai_api(
                        "https://api.groq.com/openai/v1/chat/completions",
                        groq_key,
                        model,
                        prompt,
                        generation_config
                    )
                    return LLMResponse(text)
                except Exception as e:
                    err_msg = f"Groq {model} failed: {e}"
                    errors.append(err_msg)

        # 3. OpenRouter
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if openrouter_key:
            for model in ["openrouter/auto", "openrouter/free", "google/gemini-2.5-flash:free", "meta-llama/llama-3.1-8b-instruct:free"]:
                try:
                    logger.info(f"Attempting OpenRouter with model {model}")
                    extra_headers = {
                        "HTTP-Referer": "https://github.com/divyanshupandey324/resume-screening-platform",
                        "X-Title": "AI Resume Screener"
                    }
                    text = self._call_openai_api(
                        "https://openrouter.ai/api/v1/chat/completions",
                        openrouter_key,
                        model,
                        prompt,
                        generation_config,
                        extra_headers=extra_headers
                    )
                    return LLMResponse(text)
                except Exception as e:
                    err_msg = f"OpenRouter {model} failed: {e}"
                    errors.append(err_msg)

        # 4. GitHub Models
        github_token = os.getenv("GITHUB_TOKEN")
        if github_token:
            for model in ["gpt-4o-mini", "meta-llama-3.1-8b-instruct"]:
                try:
                    logger.info(f"Attempting GitHub Models with model {model}")
                    text = self._call_openai_api(
                        "https://models.inference.ai.azure.com/chat/completions",
                        github_token,
                        model,
                        prompt,
                        generation_config
                    )
                    return LLMResponse(text)
                except Exception as e:
                    err_msg = f"GitHub Models {model} failed: {e}"
                    errors.append(err_msg)

        # 5. NVIDIA NIM
        nvidia_key = os.getenv("NVIDIA_API_KEY")
        if nvidia_key:
            for model in ["meta/llama-3.1-405b-instruct", "nvidia/llama-3.1-nemotron-70b-instruct"]:
                try:
                    logger.info(f"Attempting NVIDIA NIM with model {model}")
                    text = self._call_openai_api(
                        "https://integrate.api.nvidia.com/v1/chat/completions",
                        nvidia_key,
                        model,
                        prompt,
                        generation_config
                    )
                    return LLMResponse(text)
                except Exception as e:
                    err_msg = f"NVIDIA NIM {model} failed: {e}"
                    errors.append(err_msg)

        # 6. Ollama Local
        ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        if os.getenv("OLLAMA_ENABLED", "false").lower() == "true":
            try:
                logger.info(f"Attempting local Ollama with model {ollama_model} at {ollama_host}")
                text = self._call_openai_api(
                    f"{ollama_host}/v1/chat/completions",
                    None,
                    ollama_model,
                    prompt,
                    generation_config,
                    timeout=3
                )
                return LLMResponse(text)
            except Exception as e:
                err_msg = f"Ollama local failed: {e}"
                errors.append(err_msg)
        else:
            errors.append("Ollama local bypassed (OLLAMA_ENABLED is not set to true).")

        raise RuntimeError(f"All LLM providers and keys failed. Details: {'; '.join(errors)}")

    async def generate_content_async(self, prompt, generation_config=None):
        return await asyncio.to_thread(self.generate_content, prompt, generation_config=generation_config)

# Instantiate the fallback model wrapper to be used across the codebase
model = FallbackModelWrapper()
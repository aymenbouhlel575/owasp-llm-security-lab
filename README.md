# AI Security Testing Platform

### OWASP Top 10 for LLM Applications (2025)

A full-stack security testing platform designed to explore and assess vulnerabilities in Large Language Models (LLMs) and AI-powered applications.

## Overview

This project provides a modular environment for evaluating security risks associated with LLM-based applications.

The platform combines a Python/FastAPI backend with a React frontend to organize security test scenarios and display evaluation results.

## Technologies

- Python
- FastAPI
- React
- JavaScript
- Vite
- Docker
- REST APIs

## OWASP LLM Top 10 Coverage

The backend contains modules corresponding to the following OWASP 2025 risk categories:

| ID | Security Risk |
|---|---|
| LLM01 | Prompt Injection |
| LLM02 | Sensitive Information Disclosure |
| LLM03 | Supply Chain |
| LLM04 | Data and Model Poisoning |
| LLM05 | Improper Output Handling |
| LLM06 | Excessive Agency |
| LLM07 | System Prompt Leakage |
| LLM08 | Vector and Embedding Weaknesses |
| LLM09 | Misinformation |
| LLM10 | Unbounded Consumption |

Note: Module presence does not imply that every security scenario has been fully validated.

## Architecture

The project includes:

- React frontend for interacting with security scenarios
- FastAPI backend exposing REST endpoints
- Dedicated modules for OWASP security risks
- LLM provider integration
- Database models and result management
- Security evaluation scripts

## Project Structure

backend/     Python backend and security modules
frontend/    React user interface
scripts/     Evaluation and smoke-test scripts
docs/        Project documentation
compose.yaml Docker Compose configuration

## Development Status

Active development and validation.

## Security Notice

This project is intended for educational purposes and authorized security testing only.

Do not use the testing scenarios against systems without permission.

## References

OWASP GenAI Security Project:
https://genai.owasp.org/

OWASP Top 10 for LLM Applications:
https://genai.owasp.org/llm-top-10/

## Author

Aymen Bouhlel

Computer Engineering Student - ENSICAEN

GitHub: https://github.com/aymenbouhlel575

---

This is an independent educational project and is not an official OWASP product.
